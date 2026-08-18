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
  /** Every topic across owned repos, most frequent first. */
  topics: string[];
  /** Repo names, descriptions and topics joined — the haystack tech detection
   *  scans, since most accounts never tag their repos. */
  techCorpus: string;
  /** Most recently pushed repo, used for the "currently working on" line. */
  recentRepo: RepoSummary | null;
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
  includeQuickStats: boolean;
  includeAbout: boolean;
  includeTechStack: boolean;
  includeStats: boolean;
  includeStreak: boolean;
  includeTopLanguages: boolean;
  includeActivityGraph: boolean;
  includeTrophies: boolean;
  includeTopProjects: boolean;
  includeCurrentWork: boolean;
  includeSocials: boolean;
  includeVisitorBadge: boolean;
  includeFooter: boolean;
  theme: StatsTheme;
}

export const DEFAULT_OPTIONS: GeneratorOptions = {
  includeHeader: true,
  includeQuickStats: true,
  includeAbout: true,
  includeTechStack: true,
  includeStats: true,
  includeStreak: true,
  includeTopLanguages: true,
  includeActivityGraph: true,
  includeTrophies: true,
  includeTopProjects: true,
  includeCurrentWork: true,
  includeSocials: true,
  includeVisitorBadge: true,
  includeFooter: true,
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
