import { badgeFor } from "./badges";
import type { GeneratorOptions, ProfileData } from "./types";

const STATS_HOST = "https://github-readme-stats.vercel.app";
const STREAK_HOST = "https://streak-stats.demolab.com";

/** Bios, names and repo descriptions all come from GitHub accounts we don't
 *  control, and several sections interpolate them into raw HTML. Neutralize
 *  markup at the source. */
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

/** As `inline`, plus the pipe escaping that only table rows need. An em dash
 *  stands in for empty values so the column never collapses. */
function tableCell(text: string | null): string {
  const value = inline(text);
  return value ? value.replace(/\|/g, "\\|") : "—";
}

function socialBadge(
  label: string,
  color: string,
  logo: string,
  href: string,
): string {
  return `[![${label}](https://img.shields.io/badge/-${encodeURIComponent(label)}-${color}?style=for-the-badge&logo=${logo}&logoColor=white)](${href})`;
}

/** Normalizes a user-entered website that may be missing its scheme. */
function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function generateReadme(
  profile: ProfileData,
  options: GeneratorOptions,
): string {
  const { login, name } = profile;
  const { theme } = options;

  const blocks: string[] = [];

  if (options.includeHeader) {
    const header = [
      `<h1 align="center">Hi 👋, I'm ${inline(name)}</h1>`,
      profile.bio
        ? `<h3 align="center">${inline(profile.bio)}</h3>`
        : `<h3 align="center">A developer building things on GitHub</h3>`,
    ];
    blocks.push(header.join("\n"));
  }

  if (options.includeAbout) {
    const facts: string[] = [];
    if (profile.company) {
      facts.push(`- 🏢 I'm currently working at **${inline(profile.company)}**`);
    }
    if (profile.location) {
      facts.push(`- 📍 Based in **${inline(profile.location)}**`);
    }
    facts.push(`- 📦 I maintain **${profile.publicRepos}** public repositories`);
    if (profile.totalStars > 0) {
      facts.push(`- ⭐ My projects have earned **${profile.totalStars}** stars`);
    }
    if (profile.languages.length > 0) {
      const top = profile.languages.slice(0, 3).map((l) => `**${l.name}**`);
      facts.push(`- 💬 Ask me about ${top.join(", ")}`);
    }
    facts.push(`- 🌱 On GitHub since **${profile.joinedYear}**`);
    if (profile.blog) {
      facts.push(`- 🔗 More about me at [${profile.blog}](${normalizeUrl(profile.blog)})`);
    }

    blocks.push(["## 🚀 About Me", "", ...facts].join("\n"));
  }

  if (options.includeTechStack && profile.languages.length > 0) {
    // Deliberately no <p> wrapper: a raw HTML block suspends markdown parsing
    // until the next blank line, which would leave these badges as literal text.
    const badges = profile.languages
      .slice(0, 12)
      .map((lang) => badgeFor(lang.name))
      .join("\n");
    blocks.push(["## 🛠️ Tech Stack", "", badges].join("\n"));
  }

  const statCards: string[] = [];
  if (options.includeStats) {
    statCards.push(
      `<img height="180em" src="${STATS_HOST}/api?username=${login}&show_icons=true&theme=${theme}&include_all_commits=true&count_private=true&hide_border=true" alt="${login}'s GitHub stats" />`,
    );
  }
  if (options.includeTopLanguages && profile.languages.length > 0) {
    statCards.push(
      `<img height="180em" src="${STATS_HOST}/api/top-langs/?username=${login}&layout=compact&theme=${theme}&hide_border=true&langs_count=8" alt="Top languages" />`,
    );
  }
  if (statCards.length > 0) {
    blocks.push(
      ["## 📊 GitHub Stats", "", `<p align="center">`, ...statCards, `</p>`].join("\n"),
    );
  }

  if (options.includeStreak) {
    blocks.push(
      [
        `<p align="center">`,
        `<img src="${STREAK_HOST}?user=${login}&theme=${theme}&hide_border=true" alt="GitHub streak" />`,
        `</p>`,
      ].join("\n"),
    );
  }

  if (options.includeTopProjects && profile.topRepos.length > 0) {
    const rows = profile.topRepos.map((repo) => {
      const title = repo.homepage
        ? `[${tableCell(repo.name)}](${repo.url}) · [demo](${normalizeUrl(repo.homepage)})`
        : `[${tableCell(repo.name)}](${repo.url})`;
      return `| ${title} | ${tableCell(repo.description)} | ${tableCell(repo.language)} | ⭐ ${repo.stars} |`;
    });

    blocks.push(
      [
        "## 📌 Featured Projects",
        "",
        "| Project | Description | Language | Stars |",
        "| :--- | :--- | :--- | ---: |",
        ...rows,
      ].join("\n"),
    );
  }

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
        socialBadge("Website", "0A0A0A", "googlechrome", normalizeUrl(profile.blog)),
      );
    }

    // Same HTML-block caveat as the tech stack badges — keep these as markdown.
    blocks.push(["## 🤝 Connect With Me", "", socials.join("\n")].join("\n"));
  }

  if (options.includeVisitorBadge) {
    blocks.push(
      [
        `<p align="center">`,
        `<img src="https://komarev.com/ghpvc/?username=${login}&label=Profile%20views&color=0e75b6&style=flat" alt="Profile views" />`,
        `</p>`,
      ].join("\n"),
    );
  }

  return blocks.join("\n\n---\n\n") + "\n";
}
