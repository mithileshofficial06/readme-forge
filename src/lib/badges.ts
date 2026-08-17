/** Brand color + simple-icons slug per language, used to build shields.io badges.
 *  `logoColor` overrides the default white wordmark where contrast demands it. */
interface BadgeSpec {
  color: string;
  logo: string;
  logoColor?: string;
}

const BADGES: Record<string, BadgeSpec> = {
  TypeScript: { color: "3178C6", logo: "typescript" },
  JavaScript: { color: "F7DF1E", logo: "javascript", logoColor: "black" },
  Python: { color: "3776AB", logo: "python" },
  Java: { color: "ED8B00", logo: "openjdk" },
  "C++": { color: "00599C", logo: "cplusplus" },
  C: { color: "A8B9CC", logo: "c", logoColor: "black" },
  "C#": { color: "239120", logo: "csharp" },
  Go: { color: "00ADD8", logo: "go" },
  Rust: { color: "000000", logo: "rust" },
  Ruby: { color: "CC342D", logo: "ruby" },
  PHP: { color: "777BB4", logo: "php" },
  Swift: { color: "F05138", logo: "swift" },
  Kotlin: { color: "7F52FF", logo: "kotlin" },
  Dart: { color: "0175C2", logo: "dart" },
  Scala: { color: "DC322F", logo: "scala" },
  Elixir: { color: "4B275F", logo: "elixir" },
  Haskell: { color: "5D4F85", logo: "haskell" },
  Lua: { color: "2C2D72", logo: "lua" },
  R: { color: "276DC3", logo: "r" },
  Perl: { color: "39457E", logo: "perl" },
  Shell: { color: "4EAA25", logo: "gnubash" },
  PowerShell: { color: "5391FE", logo: "powershell" },
  HTML: { color: "E34F26", logo: "html5" },
  CSS: { color: "1572B6", logo: "css3" },
  SCSS: { color: "CC6699", logo: "sass" },
  Vue: { color: "4FC08D", logo: "vuedotjs" },
  Svelte: { color: "FF3E00", logo: "svelte" },
  Astro: { color: "BC52EE", logo: "astro" },
  Jupyter: { color: "F37626", logo: "jupyter" },
  "Jupyter Notebook": { color: "F37626", logo: "jupyter" },
  Dockerfile: { color: "2496ED", logo: "docker" },
  Makefile: { color: "427819", logo: "cmake" },
  Solidity: { color: "363636", logo: "solidity" },
  Zig: { color: "F7A41D", logo: "zig", logoColor: "black" },
  Nix: { color: "5277C3", logo: "nixos" },
  Vim: { color: "019733", logo: "vim" },
  "Vim Script": { color: "019733", logo: "vim" },
  "Objective-C": { color: "438EFF", logo: "apple" },
  MATLAB: { color: "0076A8", logo: "mathworks" },
  Assembly: { color: "6E4C13", logo: "assemblyscript" },
  TeX: { color: "008080", logo: "latex" },
};

/** Falls back to a neutral slate badge so unmapped languages still render. */
export function badgeFor(language: string): string {
  const spec = BADGES[language] ?? { color: "475569", logo: "git" };
  const label = encodeURIComponent(language);
  const logoColor = spec.logoColor ?? "white";
  return `![${language}](https://img.shields.io/badge/-${label}-${spec.color}?style=for-the-badge&logo=${spec.logo}&logoColor=${logoColor})`;
}
