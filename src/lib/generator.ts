import { badgeForLanguage, frameworkBadges, toolBadges } from "./tech";
import type { GeneratorOptions, ProfileData, StatsTheme } from "./types";

const STATS_HOST = "https://github-readme-stats.vercel.app";
const STREAK_HOST = "https://streak-stats.demolab.com";
const ACTIVITY_HOST = "https://github-readme-activity-graph.vercel.app";
const TROPHY_HOST = "https://github-profile-trophy.vercel.app";

/** Each card service names its themes differently, so the single theme the user
 *  picks has to be translated per service or the image 404s / falls back ugly. */
const ACTIVITY_THEME: Record<StatsTheme, string> = {
  default: "github",
  dark: "github-dark",
  radical: "radical",
  tokyonight: "tokyo-night",
  dracula: "dracula",
  gruvbox: "gruvbox",
  merko: "merko",
  onedark: "react-dark",
};

const TROPHY_THEME: Record<StatsTheme, string> = {
  default: "flat",
  dark: "darkhub",
  radical: "radical",
  tokyonight: "tokyonight",
  dracula: "dracula",
  gruvbox: "gruvbox",
  merko: "darkhub",
  onedark: "onedark",
};

/** Bios, names and repo descriptions come from accounts we don't control, and
 *  several sections interpolate them into raw HTML. Neutralize markup here. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Untrusted text for a single-line context: no markup, no stray line breaks. */
function inline(text: string | null): string {
  if (!text) return "";
  return escapeHtml(text.replace(/\s*\r?\n\s*/g, " ").trim());
}

/** As `inline`, plus the pipe escaping only table rows need. */
function tableCell(text: string | null): string {
  const value = inline(text);
  return value ? value.replace(/\|/g, "\\|") : "—";
}

/**
 * Wraps markdown in a centered div. The blank lines are load-bearing: a raw
 * HTML block suspends markdown parsing until one appears, so without them the
 * badges inside would render as literal text.
 */
function centered(...lines: string[]): string {
  return ['<div align="center">', "", ...lines, "", "</div>"].join("\n");
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function socialBadge(label: string, color: string, logo: string, href: string) {
  return `[![${label}](https://img.shields.io/badge/${encodeURIComponent(label)}-${color}?style=for-the-badge&logo=${logo}&logoColor=white)](${href})`;
}

function heading(emoji: string, text: string): string {
  return `## ${emoji} ${text}`;
}

export function generateReadme(
  profile: ProfileData,
  options: GeneratorOptions,
): string {
  const { login, name } = profile;
  const { theme } = options;
  const blocks: string[] = [];

  /* ---- Header ---------------------------------------------------------- */
  if (options.includeHeader) {
    const lines = [
      `# Hi there 👋, I'm ${inline(name)}`,
      "",
      profile.bio
        ? `### ${inline(profile.bio)}`
        : "### Building things, one commit at a time",
    ];

    if (options.includeSocials) {
      const socials = [
        socialBadge("GitHub", "181717", "github", profile.profileUrl),
      ];
      if (profile.twitter) {
        socials.push(
          socialBadge("Twitter", "1DA1F2", "x", `https://twitter.com/${profile.twitter}`),
        );
      }
      if (profile.blog) {
        socials.push(
          socialBadge("Portfolio", "FF5722", "googlechrome", normalizeUrl(profile.blog)),
        );
      }
      lines.push("", socials.join("\n"));
    }

    blocks.push(centered(...lines));
  }

  /* ---- Quick stats ------------------------------------------------------ */
  if (options.includeQuickStats) {
    // Followers is a live shields endpoint; the other two are baked from the
    // data we fetched, so they reflect generation time rather than today.
    const badges = [
      `![Followers](https://img.shields.io/github/followers/${login}?label=Followers&style=for-the-badge&color=181717&logo=github&logoColor=white)`,
      `![Stars](https://img.shields.io/badge/Total%20Stars-${profile.totalStars}-FFD700?style=for-the-badge&logo=starship&logoColor=white)`,
      `![Repos](https://img.shields.io/badge/Repositories-${profile.publicRepos}-3178C6?style=for-the-badge&logo=github&logoColor=white)`,
    ];
    blocks.push(centered(badges.join("\n")));
  }

  /* ---- About ------------------------------------------------------------ */
  if (options.includeAbout) {
    const facts: string[] = [];

    if (profile.company) {
      facts.push(`- 🏢 &nbsp;Currently working at **${inline(profile.company)}**`);
    }
    if (profile.location) {
      facts.push(`- 🌍 &nbsp;Based in **${inline(profile.location)}**`);
    }
    if (profile.recentRepo) {
      facts.push(
        `- 🔭 &nbsp;Most recently working on [**${tableCell(profile.recentRepo.name)}**](${profile.recentRepo.url})`,
      );
    }
    if (profile.languages.length > 0) {
      const top = profile.languages.slice(0, 3).map((l) => `**${l.name}**`);
      facts.push(`- 💬 &nbsp;Ask me about ${top.join(", ")}`);
    }
    facts.push(
      `- 📊 &nbsp;Maintaining **${profile.publicRepos}** public repositories with **${profile.totalStars}** total stars`,
    );
    if (profile.blog) {
      facts.push(
        `- 🔗 &nbsp;Portfolio: [${inline(profile.blog)}](${normalizeUrl(profile.blog)})`,
      );
    }
    facts.push(`- ⚡ &nbsp;Building on GitHub since **${profile.joinedYear}**`);

    blocks.push([heading("🧭", "About Me"), "", ...facts].join("\n"));
  }

  /* ---- Tech stack ------------------------------------------------------- */
  if (options.includeTechStack) {
    const groups: string[] = [];

    if (profile.languages.length > 0) {
      const badges = profile.languages
        .slice(0, 12)
        .map((lang) => badgeForLanguage(lang.name));
      groups.push("**Languages**", "", badges.join("\n"));
    }

    const frameworks = frameworkBadges(profile.techCorpus);
    if (frameworks.length > 0) {
      groups.push("", "**Frameworks & Libraries**", "", frameworks.slice(0, 14).join("\n"));
    }

    const tools = toolBadges(profile.techCorpus);
    if (tools.length > 0) {
      groups.push("", "**Tools & Platforms**", "", tools.slice(0, 14).join("\n"));
    }

    if (groups.length > 0) {
      blocks.push([heading("🧰", "Tech Stack"), "", ...groups].join("\n"));
    }
  }

  /* ---- Stats cards ------------------------------------------------------ */
  const cards: string[] = [];
  if (options.includeStats) {
    cards.push(
      `<img height="180em" src="${STATS_HOST}/api?username=${login}&show_icons=true&theme=${theme}&include_all_commits=true&count_private=true&hide_border=true" alt="${login}'s GitHub stats" />`,
    );
  }
  if (options.includeTopLanguages && profile.languages.length > 0) {
    cards.push(
      `<img height="180em" src="${STATS_HOST}/api/top-langs/?username=${login}&layout=compact&theme=${theme}&hide_border=true&langs_count=8" alt="Top languages" />`,
    );
  }

  if (cards.length > 0 || options.includeStreak) {
    const inner: string[] = [];
    // These are raw <img> tags, so they need no blank-line separation and can
    // sit directly inside the div for side-by-side layout.
    if (cards.length > 0) inner.push(cards.join("\n"));
    if (options.includeStreak) {
      inner.push(
        `<img src="${STREAK_HOST}?user=${login}&theme=${theme}&hide_border=true" alt="GitHub streak" />`,
      );
    }
    blocks.push([heading("📊", "GitHub Analytics"), "", centered(...inner)].join("\n"));
  }

  if (options.includeActivityGraph) {
    blocks.push(
      centered(
        `<img src="${ACTIVITY_HOST}/graph?username=${login}&theme=${ACTIVITY_THEME[theme]}&hide_border=true&area=true" alt="Contribution activity graph" />`,
      ),
    );
  }

  if (options.includeTrophies) {
    blocks.push(
      [
        heading("🏆", "Trophy Case"),
        "",
        centered(
          `<img src="${TROPHY_HOST}?username=${login}&theme=${TROPHY_THEME[theme]}&no-frame=true&no-bg=true&column=7&margin-w=4" alt="GitHub trophies" />`,
        ),
      ].join("\n"),
    );
  }

  /* ---- Projects --------------------------------------------------------- */
  if (options.includeTopProjects && profile.topRepos.length > 0) {
    const rows = profile.topRepos.map((repo) => {
      const links = [`[**${tableCell(repo.name)}**](${repo.url})`];
      if (repo.homepage) {
        links.push(`[↗](${normalizeUrl(repo.homepage)})`);
      }
      // Language first, then a couple of topics, gives a readable stack column
      // without letting a heavily-tagged repo blow the table width out.
      const stack = [repo.language, ...repo.topics.slice(0, 2)]
        .filter(Boolean)
        .map((t) => `\`${tableCell(t)}\``)
        .join(" ");

      return `| ${links.join(" ")} | ${tableCell(repo.description)} | ${stack || "—"} | ⭐ ${repo.stars} | 🍴 ${repo.forks} |`;
    });

    blocks.push(
      [
        heading("📌", "Featured Projects"),
        "",
        "| Project | Description | Stack | Stars | Forks |",
        "| :--- | :--- | :--- | ---: | ---: |",
        ...rows,
      ].join("\n"),
    );
  }

  /* ---- Current work ----------------------------------------------------- */
  if (options.includeCurrentWork && profile.recentRepo) {
    const repo = profile.recentRepo;
    const lines = [
      heading("🔭", "Currently Working On"),
      "",
      `### [${tableCell(repo.name)}](${repo.url})`,
      "",
      repo.description
        ? `> ${inline(repo.description)}`
        : "> Latest project — more details coming soon.",
    ];
    if (repo.topics.length > 0) {
      lines.push(
        "",
        repo.topics
          .slice(0, 6)
          .map((t) => `\`${tableCell(t)}\``)
          .join(" "),
      );
    }
    blocks.push(lines.join("\n"));
  }

  /* ---- Footer ----------------------------------------------------------- */
  const footer: string[] = [];
  if (options.includeVisitorBadge) {
    footer.push(
      `![Profile views](https://komarev.com/ghpvc/?username=${login}&label=Profile%20views&color=181717&style=for-the-badge)`,
    );
  }
  if (options.includeFooter) {
    footer.push("", "⭐️ From [" + login + "](" + profile.profileUrl + ")");
  }
  if (footer.length > 0) {
    blocks.push(centered(...footer));
  }

  return blocks.join("\n\n---\n\n") + "\n";
}
