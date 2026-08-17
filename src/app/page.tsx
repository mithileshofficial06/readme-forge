"use client";

import { useMemo, useState } from "react";
import { generateReadme } from "@/lib/generator";
import {
  DEFAULT_OPTIONS,
  type AnalyzeError,
  type AnalyzeSuccess,
  type GeneratorOptions,
  type ProfileData,
  type StatsTheme,
} from "@/lib/types";
import { MarkdownPreview } from "./markdown-preview";

const THEMES: StatsTheme[] = [
  "default",
  "dark",
  "radical",
  "tokyonight",
  "dracula",
  "gruvbox",
  "merko",
  "onedark",
];

const SECTION_TOGGLES: { key: keyof GeneratorOptions; label: string }[] = [
  { key: "includeHeader", label: "Header" },
  { key: "includeAbout", label: "About me" },
  { key: "includeTechStack", label: "Tech stack" },
  { key: "includeStats", label: "Stats card" },
  { key: "includeTopLanguages", label: "Top languages" },
  { key: "includeStreak", label: "Streak" },
  { key: "includeTopProjects", label: "Projects" },
  { key: "includeSocials", label: "Socials" },
  { key: "includeVisitorBadge", label: "Visitor count" },
];

const EXAMPLES = ["torvalds", "sindresorhus", "octocat"];

export default function Home() {
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"preview" | "markdown">("preview");
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(
    () => (profile ? generateReadme(profile, options) : ""),
    [profile, options],
  );

  async function run(value: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: value }),
      });
      const data: AnalyzeSuccess | AnalyzeError = await res.json();

      if (!res.ok) {
        setError((data as AnalyzeError).error ?? "Something went wrong.");
        setProfile(null);
        return;
      }
      setProfile((data as AnalyzeSuccess).profile);
    } catch {
      setError("Network error — couldn't reach the server.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    link.click();
    URL.revokeObjectURL(url);
  }

  function toggle(key: keyof GeneratorOptions) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-widest text-[var(--muted)] uppercase backdrop-blur">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--lime)]" />
          Profile README generator
        </span>

        <h1 className="mt-7 text-6xl font-bold tracking-tighter sm:text-8xl">
          <span className="gradient-text">README</span>
          <span className="text-white"> Forge</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Turn any GitHub account into a ready-to-paste profile README. Drop it
          in a repo named after your username and it shows up on your profile.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(input);
        }}
        className="mx-auto mt-11 max-w-2xl"
      >
        <div className="glass glow-ring flex flex-col gap-2 rounded-2xl p-2 transition-all sm:flex-row sm:items-center">
          <span className="hidden pl-4 font-mono text-sm text-[var(--violet)] sm:block">
            github.com/
          </span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="your-username"
            aria-label="GitHub username or profile URL"
            className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-base text-white outline-none placeholder:text-white/25 sm:px-0"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary rounded-xl px-7 py-3 text-sm font-bold tracking-wide"
          >
            {loading ? "Forging…" : "Generate ✦"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--muted)]">
          <span>Try:</span>
          {EXAMPLES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setInput(name);
                void run(name);
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-white/70 transition-colors hover:border-[var(--violet)]/50 hover:text-white"
            >
              {name}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mx-auto mt-6 max-w-2xl rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-200 backdrop-blur"
        >
          {error}
        </p>
      )}

      {profile && (
        <div className="mt-14 grid gap-6 lg:grid-cols-[290px_1fr]">
          <aside className="space-y-5">
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3">
                {/* Plain <img>: avatars are remote and next/image would need a
                    configured remote pattern for no real benefit here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl}
                  alt=""
                  width={52}
                  height={52}
                  className="size-13 rounded-xl ring-2 ring-[var(--violet)]/40"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {profile.name}
                  </p>
                  <p className="truncate font-mono text-xs text-[var(--muted)]">
                    @{profile.login}
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
                {(
                  [
                    ["Repos", profile.publicRepos],
                    ["Stars", profile.totalStars],
                    ["Followers", profile.followers],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/5 bg-white/5 py-2.5"
                  >
                    <dd className="gradient-text text-lg font-bold">{value}</dd>
                    <dt className="text-[0.65rem] tracking-wider text-[var(--muted)] uppercase">
                      {label}
                    </dt>
                  </div>
                ))}
              </dl>
            </section>

            <section className="glass rounded-2xl p-5">
              <h2 className="mb-4 text-xs font-bold tracking-widest text-[var(--muted)] uppercase">
                Sections
              </h2>
              <div className="space-y-2.5">
                {SECTION_TOGGLES.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-3 text-sm text-white/80 transition-colors hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(options[key])}
                      onChange={() => toggle(key)}
                      className="tick"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </section>

            <section className="glass rounded-2xl p-5">
              <label
                htmlFor="theme"
                className="mb-3 block text-xs font-bold tracking-widest text-[var(--muted)] uppercase"
              >
                Card theme
              </label>
              <select
                id="theme"
                value={options.theme}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    theme: e.target.value as StatsTheme,
                  }))
                }
                className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-[var(--violet)]/60"
              >
                {THEMES.map((theme) => (
                  <option key={theme} value={theme} className="bg-[#12101c]">
                    {theme}
                  </option>
                ))}
              </select>
            </section>
          </aside>

          <main className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="glass flex rounded-xl p-1">
                {(["preview", "markdown"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setTab(value)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all ${
                      tab === value
                        ? "btn-primary"
                        : "text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={copyMarkdown}
                  className="glass rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[var(--violet)]/50"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
                <button
                  onClick={downloadMarkdown}
                  className="glass rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[var(--cyan)]/50"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="glass overflow-hidden rounded-2xl">
              {tab === "preview" ? (
                <div className="overflow-x-auto p-7">
                  <MarkdownPreview markdown={markdown} />
                </div>
              ) : (
                <pre className="overflow-x-auto p-7 font-mono text-xs leading-relaxed text-white/80">
                  <code>{markdown}</code>
                </pre>
              )}
            </div>

            <p className="mt-5 text-center text-sm text-[var(--muted)]">
              Next: create a public repo named{" "}
              <code className="rounded-md bg-[var(--violet)]/15 px-2 py-1 font-mono text-xs text-fuchsia-300">
                {profile.login}/{profile.login}
              </code>{" "}
              and save this as its README.md
            </p>
          </main>
        </div>
      )}
    </div>
  );
}
