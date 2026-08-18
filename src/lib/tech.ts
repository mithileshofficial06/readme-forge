/** Badge metadata for a single technology. `color`/`logo` map onto shields.io
 *  and simple-icons; `aliases` are the GitHub repo topics that imply it. */
export interface TechSpec {
  label: string;
  color: string;
  logo: string;
  logoColor?: string;
  aliases?: string[];
}

export type TechCategory = "languages" | "frameworks" | "tools";

/** Keyed by the exact `language` string GitHub reports. */
const LANGUAGES: Record<string, TechSpec> = {
  TypeScript: { label: "TypeScript", color: "3178C6", logo: "typescript" },
  JavaScript: { label: "JavaScript", color: "F7DF1E", logo: "javascript", logoColor: "black" },
  Python: { label: "Python", color: "3776AB", logo: "python" },
  Java: { label: "Java", color: "ED8B00", logo: "openjdk" },
  "C++": { label: "C++", color: "00599C", logo: "cplusplus" },
  C: { label: "C", color: "A8B9CC", logo: "c", logoColor: "black" },
  "C#": { label: "C#", color: "512BD4", logo: "dotnet" },
  Go: { label: "Go", color: "00ADD8", logo: "go" },
  Rust: { label: "Rust", color: "000000", logo: "rust" },
  Ruby: { label: "Ruby", color: "CC342D", logo: "ruby" },
  PHP: { label: "PHP", color: "777BB4", logo: "php" },
  Swift: { label: "Swift", color: "F05138", logo: "swift" },
  Kotlin: { label: "Kotlin", color: "7F52FF", logo: "kotlin" },
  Dart: { label: "Dart", color: "0175C2", logo: "dart" },
  Scala: { label: "Scala", color: "DC322F", logo: "scala" },
  Elixir: { label: "Elixir", color: "4B275F", logo: "elixir" },
  Haskell: { label: "Haskell", color: "5D4F85", logo: "haskell" },
  Lua: { label: "Lua", color: "2C2D72", logo: "lua" },
  R: { label: "R", color: "276DC3", logo: "r" },
  Perl: { label: "Perl", color: "39457E", logo: "perl" },
  Shell: { label: "Shell", color: "4EAA25", logo: "gnubash" },
  PowerShell: { label: "PowerShell", color: "5391FE", logo: "powershell" },
  HTML: { label: "HTML5", color: "E34F26", logo: "html5" },
  CSS: { label: "CSS3", color: "1572B6", logo: "css3" },
  SCSS: { label: "Sass", color: "CC6699", logo: "sass" },
  Vue: { label: "Vue", color: "4FC08D", logo: "vuedotjs" },
  Svelte: { label: "Svelte", color: "FF3E00", logo: "svelte" },
  Astro: { label: "Astro", color: "BC52EE", logo: "astro" },
  "Jupyter Notebook": { label: "Jupyter", color: "F37626", logo: "jupyter" },
  Dockerfile: { label: "Docker", color: "2496ED", logo: "docker" },
  Solidity: { label: "Solidity", color: "363636", logo: "solidity" },
  Zig: { label: "Zig", color: "F7A41D", logo: "zig", logoColor: "black" },
  Nix: { label: "Nix", color: "5277C3", logo: "nixos" },
  "Objective-C": { label: "Objective-C", color: "438EFF", logo: "apple" },
  MATLAB: { label: "MATLAB", color: "0076A8", logo: "mathworks" },
  TeX: { label: "LaTeX", color: "008080", logo: "latex" },
  "Vim Script": { label: "Vim", color: "019733", logo: "vim" },
  Makefile: { label: "Make", color: "427819", logo: "cmake" },
};

/** Detected from repo topics rather than the language field. */
const FRAMEWORKS: Record<string, TechSpec> = {
  react: { label: "React", color: "20232A", logo: "react", aliases: ["reactjs", "react-js"] },
  nextjs: { label: "Next.js", color: "000000", logo: "nextdotjs", aliases: ["next-js", "nextjs14", "nextjs15"] },
  vue: { label: "Vue.js", color: "35495E", logo: "vuedotjs", aliases: ["vuejs", "vue-js"] },
  angular: { label: "Angular", color: "DD0031", logo: "angular", aliases: ["angularjs"] },
  svelte: { label: "Svelte", color: "FF3E00", logo: "svelte", aliases: ["sveltekit"] },
  astro: { label: "Astro", color: "BC52EE", logo: "astro" },
  nodejs: { label: "Node.js", color: "339933", logo: "nodedotjs", aliases: ["node", "node-js"] },
  express: { label: "Express", color: "000000", logo: "express", aliases: ["expressjs", "express-js"] },
  nestjs: { label: "NestJS", color: "E0234E", logo: "nestjs", aliases: ["nest"] },
  django: { label: "Django", color: "092E20", logo: "django" },
  flask: { label: "Flask", color: "000000", logo: "flask" },
  fastapi: { label: "FastAPI", color: "009688", logo: "fastapi" },
  spring: { label: "Spring", color: "6DB33F", logo: "spring", aliases: ["spring-boot", "springboot"] },
  laravel: { label: "Laravel", color: "FF2D20", logo: "laravel" },
  rails: { label: "Rails", color: "CC0000", logo: "rubyonrails", aliases: ["ruby-on-rails"] },
  flutter: { label: "Flutter", color: "02569B", logo: "flutter" },
  "react-native": { label: "React Native", color: "20232A", logo: "react", aliases: ["reactnative"] },
  electron: { label: "Electron", color: "191970", logo: "electron" },
  tailwindcss: { label: "Tailwind CSS", color: "06B6D4", logo: "tailwindcss", aliases: ["tailwind"] },
  bootstrap: { label: "Bootstrap", color: "7952B3", logo: "bootstrap" },
  mui: { label: "Material UI", color: "007FFF", logo: "mui", aliases: ["material-ui", "materialui"] },
  redux: { label: "Redux", color: "593D88", logo: "redux" },
  graphql: { label: "GraphQL", color: "E10098", logo: "graphql" },
  threejs: { label: "Three.js", color: "000000", logo: "threedotjs", aliases: ["three-js"] },
  socketio: { label: "Socket.io", color: "010101", logo: "socketdotio", aliases: ["socket-io", "websocket", "websockets"] },
  tensorflow: { label: "TensorFlow", color: "FF6F00", logo: "tensorflow" },
  pytorch: { label: "PyTorch", color: "EE4C2C", logo: "pytorch" },
  opencv: { label: "OpenCV", color: "5C3EE8", logo: "opencv" },
  pandas: { label: "Pandas", color: "150458", logo: "pandas" },
  numpy: { label: "NumPy", color: "013243", logo: "numpy" },
  "scikit-learn": { label: "scikit-learn", color: "F7931E", logo: "scikitlearn", aliases: ["sklearn"] },
  streamlit: { label: "Streamlit", color: "FF4B4B", logo: "streamlit" },
  langchain: { label: "LangChain", color: "1C3C3C", logo: "langchain" },
  openai: { label: "OpenAI", color: "412991", logo: "openai", aliases: ["gpt", "chatgpt"] },
  hardhat: { label: "Hardhat", color: "FFF100", logo: "ethereum", logoColor: "black" },
  ethereum: { label: "Ethereum", color: "3C3C3D", logo: "ethereum", aliases: ["web3", "blockchain", "solidity"] },
  prisma: { label: "Prisma", color: "2D3748", logo: "prisma" },
  vite: { label: "Vite", color: "646CFF", logo: "vite" },
  jest: { label: "Jest", color: "C21325", logo: "jest" },
  cypress: { label: "Cypress", color: "17202C", logo: "cypress" },
  playwright: { label: "Playwright", color: "2EAD33", logo: "playwright" },
};

/** Infrastructure, databases and services — also topic-driven. */
const TOOLS: Record<string, TechSpec> = {
  docker: { label: "Docker", color: "2496ED", logo: "docker" },
  kubernetes: { label: "Kubernetes", color: "326CE5", logo: "kubernetes", aliases: ["k8s"] },
  aws: { label: "AWS", color: "232F3E", logo: "amazonwebservices", aliases: ["amazon-web-services", "ec2", "lambda"] },
  gcp: { label: "Google Cloud", color: "4285F4", logo: "googlecloud", aliases: ["google-cloud"] },
  azure: { label: "Azure", color: "0078D4", logo: "microsoftazure" },
  vercel: { label: "Vercel", color: "000000", logo: "vercel" },
  netlify: { label: "Netlify", color: "00C7B7", logo: "netlify" },
  firebase: { label: "Firebase", color: "FFCA28", logo: "firebase", logoColor: "black" },
  supabase: { label: "Supabase", color: "3ECF8E", logo: "supabase", logoColor: "black" },
  mongodb: { label: "MongoDB", color: "47A248", logo: "mongodb", aliases: ["mongo", "mongoose"] },
  postgresql: { label: "PostgreSQL", color: "4169E1", logo: "postgresql", aliases: ["postgres"] },
  mysql: { label: "MySQL", color: "4479A1", logo: "mysql" },
  sqlite: { label: "SQLite", color: "003B57", logo: "sqlite" },
  redis: { label: "Redis", color: "DC382D", logo: "redis" },
  nginx: { label: "Nginx", color: "009639", logo: "nginx" },
  linux: { label: "Linux", color: "FCC624", logo: "linux", logoColor: "black" },
  git: { label: "Git", color: "F05032", logo: "git" },
  "github-actions": { label: "GitHub Actions", color: "2088FF", logo: "githubactions", aliases: ["ci-cd", "cicd"] },
  figma: { label: "Figma", color: "F24E1E", logo: "figma" },
  postman: { label: "Postman", color: "FF6C37", logo: "postman" },
  stripe: { label: "Stripe", color: "008CDD", logo: "stripe" },
  jwt: { label: "JWT", color: "000000", logo: "jsonwebtokens" },
};

function toBadge(spec: TechSpec): string {
  const label = encodeURIComponent(spec.label);
  const logoColor = spec.logoColor ?? "white";
  return `![${spec.label}](https://img.shields.io/badge/${label}-${spec.color}?style=for-the-badge&logo=${spec.logo}&logoColor=${logoColor})`;
}

/** Neutral fallback so an unmapped language still produces a badge. */
export function badgeForLanguage(language: string): string {
  const spec = LANGUAGES[language] ?? {
    label: language,
    color: "3F3F46",
    logo: "git",
  };
  return toBadge(spec);
}

/** Builds the topic -> spec index once, expanding every alias. */
function buildTopicIndex(registry: Record<string, TechSpec>) {
  const index = new Map<string, TechSpec>();
  for (const [key, spec] of Object.entries(registry)) {
    index.set(key, spec);
    for (const alias of spec.aliases ?? []) index.set(alias, spec);
  }
  return index;
}

const FRAMEWORK_INDEX = buildTopicIndex(FRAMEWORKS);
const TOOL_INDEX = buildTopicIndex(TOOLS);

/** Regex-safe escape so aliases containing `.`, `+` or `-` match literally. */
function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Most accounts never tag their repos, so topics alone detect almost nothing.
 * Matching against repo names and descriptions as well recovers the stack for
 * ordinary users. Word boundaries keep `git` from matching inside `github`.
 */
function matchCorpus(corpus: string, index: Map<string, TechSpec>): string[] {
  const haystack = corpus.toLowerCase();
  // Dedupe by label: several terms can resolve to one spec (`web3` and
  // `blockchain` both mean Ethereum).
  const seen = new Map<string, TechSpec>();

  for (const [term, spec] of index) {
    if (seen.has(spec.label)) continue;
    const pattern = new RegExp(`(?<![a-z0-9])${escapeRe(term)}(?![a-z0-9])`);
    if (pattern.test(haystack)) seen.set(spec.label, spec);
  }

  return [...seen.values()].map(toBadge);
}

export function frameworkBadges(corpus: string): string[] {
  return matchCorpus(corpus, FRAMEWORK_INDEX);
}

export function toolBadges(corpus: string): string[] {
  return matchCorpus(corpus, TOOL_INDEX);
}
