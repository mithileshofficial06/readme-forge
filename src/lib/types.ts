/** Shape of the GitHub REST `/users/:login` payload, narrowed to what we use. */
export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  blog: string | null;
  location: string | null;
  company: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

/** Shape of the GitHub REST `/users/:login/repos` payload, narrowed to what we use. */
export interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[] | null;
  fork: boolean;
  archived: boolean;
  homepage: string | null;
  pushed_at: string;
}

export interface LanguageStat {
  name: string;
  count: number;
  percentage: number;
}

export interface RepoSummary {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  homepage: string | null;
}

/** Everything the generator needs, already normalized away from GitHub's raw shapes. */
export interface ProfileData {
  login: string;
  name: string;
  bio: string | null;
  avatarUrl: string;
  profileUrl: string;
  blog: string | null;
  location: string | null;
  company: string | null;
  twitter: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  joinedYear: number;
  totalStars: number;
  totalForks: number;
  languages: LanguageStat[];
  topRepos: RepoSummary[];
}

export type StatsTheme =
  | "default"
  | "dark"
  | "radical"
  | "tokyonight"
  | "dracula"
  | "gruvbox"
  | "merko"
  | "onedark";

export interface GeneratorOptions {
  includeHeader: boolean;
  includeAbout: boolean;
  includeTechStack: boolean;
  includeStats: boolean;
  includeStreak: boolean;
  includeTopLanguages: boolean;
  includeTopProjects: boolean;
  includeSocials: boolean;
  includeVisitorBadge: boolean;
  theme: StatsTheme;
}

export const DEFAULT_OPTIONS: GeneratorOptions = {
  includeHeader: true,
  includeAbout: true,
  includeTechStack: true,
  includeStats: true,
  includeStreak: true,
  includeTopLanguages: true,
  includeTopProjects: true,
  includeSocials: true,
  includeVisitorBadge: false,
  theme: "tokyonight",
};

/** Successful response from `POST /api/analyze`. */
export interface AnalyzeSuccess {
  profile: ProfileData;
  rateLimit: { remaining: number; limit: number } | null;
}

/** Error response from `POST /api/analyze`. */
export interface AnalyzeError {
  error: string;
}
