import type {
  GitHubRepo,
  GitHubUser,
  LanguageStat,
  ProfileData,
  RepoSummary,
} from "./types";

const API = "https://api.github.com";

/** GitHub allows alphanumerics and single inner hyphens, max 39 chars. */
const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

/** Thrown for anything the user can act on — surfaced verbatim in the UI. */
export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

/**
 * Accepts any of: `octocat`, `@octocat`, `octocat/repo`,
 * `github.com/octocat`, `https://github.com/octocat/repo/tree/main`.
 * Returns just the username — the repo half is intentionally discarded,
 * since we always profile the account rather than a single repo.
 */
export function parseGitHubInput(raw: string): string {
  let value = raw.trim();
  if (!value) throw new GitHubError("Enter a GitHub username or URL.", 400);

  value = value.replace(/^@/, "");

  // Strip protocol/host if a full or partial URL was pasted.
  const urlMatch = value.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/(.+)$/i,
  );
  if (urlMatch) value = urlMatch[1];

  // Keep only the first path segment, dropping query strings and fragments.
  const username = value.split(/[/?#]/)[0];

  if (!USERNAME_RE.test(username)) {
    throw new GitHubError(`"${username}" is not a valid GitHub username.`, 400);
  }
  return username;
}

function headers(): HeadersInit {
  const base: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "readme-forge",
  };
  // Optional: lifts the rate limit from 60/hr to 5000/hr when configured.
  const token = process.env.GITHUB_TOKEN;
  if (token) base.Authorization = `Bearer ${token}`;
  return base;
}

export interface RateLimit {
  remaining: number;
  limit: number;
}

function readRateLimit(res: Response): RateLimit | null {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const limit = res.headers.get("x-ratelimit-limit");
  if (remaining === null || limit === null) return null;
  return { remaining: Number(remaining), limit: Number(limit) };
}

async function ghFetch(path: string): Promise<{ data: unknown; rate: RateLimit | null }> {
  let res = await fetch(`${API}${path}`, {
    headers: headers(),
    // Profile data changes slowly; an hour of caching keeps us inside the
    // unauthenticated 60/hr budget when a user regenerates repeatedly.
    next: { revalidate: 3600 },
  });

  // Large org repo listings intermittently 504 on GitHub's side. One retry
  // turns that into a success rather than a confusing error for the user.
  if (res.status >= 500) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    res = await fetch(`${API}${path}`, {
      headers: headers(),
      next: { revalidate: 3600 },
    });
  }

  const rate = readRateLimit(res);

  if (res.status === 404) {
    throw new GitHubError("That GitHub user doesn't exist.", 404);
  }
  if (res.status === 403 || res.status === 429) {
    const exhausted = rate?.remaining === 0;
    throw new GitHubError(
      exhausted
        ? "GitHub API rate limit reached. Try again later, or set a GITHUB_TOKEN."
        : "GitHub refused the request. Try again shortly.",
      429,
    );
  }
  if (!res.ok) {
    throw new GitHubError(`GitHub returned ${res.status}.`, res.status);
  }

  return { data: await res.json(), rate };
}

/** Counts each repo's primary language. Byte-level accuracy would cost one
 *  request per repo, which the unauthenticated budget can't absorb. */
function aggregateLanguages(repos: GitHubRepo[]): LanguageStat[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }

  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  if (total === 0) return [];

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count);
}

function toSummary(repo: GitHubRepo): RepoSummary {
  return {
    name: repo.name,
    url: repo.html_url,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics ?? [],
    homepage: repo.homepage?.trim() ? repo.homepage : null,
  };
}

export async function fetchProfile(
  username: string,
): Promise<{ profile: ProfileData; rateLimit: RateLimit | null }> {
  const [userRes, reposRes] = await Promise.all([
    ghFetch(`/users/${username}`),
    ghFetch(`/users/${username}/repos?per_page=100&sort=pushed&type=owner`),
  ]);

  const user = userRes.data as GitHubUser;
  const allRepos = reposRes.data as GitHubRepo[];

  // Forks and archives skew both the language mix and the "top projects" list.
  const owned = allRepos.filter((r) => !r.fork && !r.archived);

  const topRepos = [...owned]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6)
    .map(toSummary);

  const profile: ProfileData = {
    login: user.login,
    name: user.name?.trim() || user.login,
    bio: user.bio?.trim() || null,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    blog: user.blog?.trim() ? user.blog : null,
    location: user.location?.trim() || null,
    company: user.company?.trim() || null,
    twitter: user.twitter_username?.trim() || null,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    joinedYear: new Date(user.created_at).getFullYear(),
    totalStars: owned.reduce((sum, r) => sum + r.stargazers_count, 0),
    totalForks: owned.reduce((sum, r) => sum + r.forks_count, 0),
    languages: aggregateLanguages(owned),
    topRepos,
  };

  // Whichever call ran second has the more current remaining count.
  return { profile, rateLimit: reposRes.rate ?? userRes.rate };
}
