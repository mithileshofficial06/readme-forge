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

  async function analyze(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
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
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            README Forge
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Turn any GitHub account into a ready-to-paste profile README. Drop it
            in a repo named after your username to make it show up on your
            profile.
          </p>
        </header>

        <form onSubmit={analyze} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="octocat  ·  github.com/octocat  ·  https://github.com/octocat/repo"
            aria-label="GitHub username or profile URL"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {loading ? "Analyzing…" : "Generate"}
          </button>
        </form>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}

        {profile && (
          <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-6">
              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  {/* Plain <img>: avatars are remote and next/image would need
                      a configured remote pattern for no real benefit here. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{profile.name}</p>
                    <p className="truncate text-sm text-zinc-500">
                      @{profile.login}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Repos", profile.publicRepos],
                    ["Stars", profile.totalStars],
                    ["Followers", profile.followers],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <dt className="text-xs text-zinc-500">{label}</dt>
                      <dd className="text-sm font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-3 text-sm font-semibold">Sections</h2>
                <div className="space-y-2">
                  {SECTION_TOGGLES.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(options[key])}
                        onChange={() => toggle(key)}
                        className="size-4 rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-100"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <label
                  htmlFor="theme"
                  className="mb-3 block text-sm font-semibold"
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
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  {THEMES.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
              </section>
            </aside>

            <main className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-zinc-300 p-1 dark:border-zinc-700">
                  {(["preview", "markdown"] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => setTab(value)}
                      className={`rounded px-3 py-1.5 text-sm capitalize transition-colors ${
                        tab === value
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <div className="ml-auto flex gap-2">
                  <button
                    onClick={copyMarkdown}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    {copied ? "Copied ✓" : "Copy markdown"}
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Download
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                {tab === "preview" ? (
                  <div className="overflow-x-auto p-6">
                    <MarkdownPreview markdown={markdown} />
                  </div>
                ) : (
                  <pre className="overflow-x-auto p-6 text-xs leading-relaxed">
                    <code>{markdown}</code>
                  </pre>
                )}
              </div>

              <p className="mt-4 text-sm text-zinc-500">
                Next step: create a public repo named{" "}
                <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  {profile.login}/{profile.login}
                </code>{" "}
                and save this as its README.md.
              </p>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
