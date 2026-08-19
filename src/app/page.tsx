"use client";

import { useEffect, useMemo, useState } from "react";
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

/** `service` names the third-party host a section needs, or null if the section
 *  is pure markdown and can never break. */
const SECTIONS: {
  key: keyof GeneratorOptions;
  label: string;
  service: string | null;
}[] = [
  { key: "includeHeader", label: "Header", service: null },
  { key: "includeQuickStats", label: "Quick stats", service: null },
  { key: "includeAbout", label: "About me", service: null },
  { key: "includeTechStack", label: "Tech stack", service: null },
  { key: "includeStats", label: "Stats card", service: "stats" },
  { key: "includeTopLanguages", label: "Top languages", service: "stats" },
  { key: "includeStreak", label: "Streak", service: "streak" },
  { key: "includeActivityGraph", label: "Activity graph", service: "activity" },
  { key: "includeTrophies", label: "Trophy case", service: "trophy" },
  { key: "includeTopProjects", label: "Projects", service: null },
  { key: "includeCurrentWork", label: "Current work", service: null },
  { key: "includeSocials", label: "Socials", service: null },
  { key: "includeVisitorBadge", label: "Visitor count", service: "visitors" },
  { key: "includeFooter", label: "Footer", service: null },
];

const EXAMPLES = ["torvalds", "sindresorhus", "octocat"];

type Health = Record<string, boolean>;

function Marker({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="label text-[var(--muted-dim)]">.{n}</span>
      <span className="label">{title}</span>
      <span className="rule flex-1" />
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"preview" | "markdown">("preview");
  const [copied, setCopied] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);

  // Card services go down without notice. Probe once, then switch off any
  // section whose host is unreachable so we never emit a broken image.
  useEffect(() => {
    let cancelled = false;

    fetch("/api/health")
      .then((res) => res.json())
      .then((data: Health) => {
        if (cancelled) return;
        setHealth(data);
        setOptions((prev) => {
          const next = { ...prev };
          for (const { key, service } of SECTIONS) {
            if (service && data[service] === false) {
              (next[key] as boolean) = false;
            }
          }
          return next;
        });
      })
      .catch(() => {
        // A failed probe shouldn't block the tool — leave defaults alone.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const markdown = useMemo(
    () => (profile ? generateReadme(profile, options) : ""),
    [profile, options],
  );

  const downCount = useMemo(() => {
    if (!health) return 0;
    return new Set(
      SECTIONS.filter((s) => s.service && health[s.service] === false).map(
        (s) => s.service,
      ),
    ).size;
  }, [health]);

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

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      {/* ---- Masthead ---- */}
      <header className="border-b-2 border-[var(--line)] pb-10">
        <div className="flex items-start justify-between gap-4">
          <span className="label">Typography — Bricolage / Geist</span>
          <span className="label hidden sm:block">Color — Graphite</span>
        </div>

        <h1 className="display mt-8 text-[15vw] leading-[0.82] sm:text-[7.5rem]">
          README
          <br />
          <span className="text-[var(--muted)]">FORGE</span>
        </h1>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Turn any GitHub account into a ready-to-paste profile README. Drop it
            in a repo named after your username and it lands on your profile.
          </p>
          <div className="size-10 shrink-0 bg-white" aria-hidden="true" />
        </div>
      </header>

      {/* ---- Input ---- */}
      <section className="mt-12">
        <Marker n="01" title="Target account" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(input);
          }}
          className="brut flex flex-col sm:flex-row"
        >
          <span className="flex items-center border-b-2 border-[var(--hard)] bg-[#0d0d0d] px-4 py-3 text-xs tracking-widest text-[var(--muted)] sm:border-r-2 sm:border-b-0">
            GITHUB.COM/
          </span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="username"
            aria-label="GitHub username or profile URL"
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-base text-white outline-none placeholder:text-[var(--muted-dim)]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn m-2 px-7 py-3 text-xs"
          >
            {loading ? "Forging…" : "Generate"}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="label">Try</span>
          {EXAMPLES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setInput(name);
                void run(name);
              }}
              className="border border-[var(--line-bright)] px-3 py-1 text-xs text-[var(--muted)] transition-colors hover:bg-white hover:text-black"
            >
              {name}
            </button>
          ))}
        </div>

        {downCount > 0 && (
          <p className="mt-4 border-l-2 border-[#7a2626] bg-[#1a1010] px-4 py-3 text-xs leading-relaxed text-[var(--muted)]">
            <strong className="text-white">{downCount}</strong> third-party card
            service{downCount > 1 ? "s are" : " is"} unreachable right now. Those
            sections were switched off so your README won&apos;t contain broken
            images. Re-enable any of them below if you want them anyway.
          </p>
        )}
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 border-2 border-[#7a2626] bg-[#1a1010] px-4 py-3 text-sm text-[#e8a0a0]"
        >
          {error}
        </p>
      )}

      {profile && (
        <>
          {/* ---- Configure ---- */}
          <section className="mt-14 grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
            <aside className="space-y-6">
              <div>
                <Marker n="02" title="Profile" />
                <div className="brut-thin p-4">
                  <div className="flex items-center gap-3">
                    {/* Plain <img>: remote avatars would need a next/image
                        remote pattern for no real benefit. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      width={52}
                      height={52}
                      className="size-13 border-2 border-[var(--hard)] grayscale"
                    />
                    <div className="min-w-0">
                      <p className="display truncate text-lg">{profile.name}</p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        @{profile.login}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 border-t border-[var(--line)]">
                    {(
                      [
                        ["Repos", profile.publicRepos],
                        ["Stars", profile.totalStars],
                        ["Followers", profile.followers],
                      ] as const
                    ).map(([label, value], i) => (
                      <div
                        key={label}
                        className={`py-3 text-center ${i > 0 ? "border-l border-[var(--line)]" : ""}`}
                      >
                        <dd className="display text-xl">{value}</dd>
                        <dt className="label mt-1 text-[0.55rem]">{label}</dt>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div>
                <Marker n="03" title="Sections" />
                <div className="brut-thin space-y-2.5 p-4">
                  {SECTIONS.map(({ key, label, service }) => {
                    const dead = Boolean(
                      service && health && health[service] === false,
                    );
                    return (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-3 text-xs text-[#cfcfcf] transition-colors hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(options[key])}
                          onChange={() =>
                            setOptions((p) => ({ ...p, [key]: !p[key] }))
                          }
                          className="tick"
                        />
                        <span className="flex-1">{label}</span>
                        {service && (
                          <span
                            className="pip"
                            data-state={
                              !health ? "unknown" : dead ? "down" : "up"
                            }
                            title={
                              !health
                                ? "Checking service…"
                                : dead
                                  ? `${service} is unreachable`
                                  : `${service} is up`
                            }
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <Marker n="04" title="Card theme" />
                <select
                  aria-label="Card theme"
                  value={options.theme}
                  onChange={(e) =>
                    setOptions((p) => ({
                      ...p,
                      theme: e.target.value as StatsTheme,
                    }))
                  }
                  className="brut-thin w-full cursor-pointer px-3 py-2.5 text-xs text-white outline-none"
                >
                  {THEMES.map((t) => (
                    <option key={t} value={t} className="bg-[#171717]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </aside>

            {/* ---- Output ---- */}
            <div className="min-w-0">
              <Marker n="05" title="Output" />

              <div className="mb-4 flex flex-wrap items-center gap-2">
                {(["preview", "markdown"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setTab(v)}
                    className={`px-4 py-2 text-xs font-bold tracking-widest uppercase transition-all ${
                      tab === v
                        ? "btn"
                        : "border-2 border-[var(--line)] text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    {v}
                  </button>
                ))}

                <div className="ml-auto flex gap-2">
                  <button
                    onClick={copyMarkdown}
                    className="btn-ghost px-4 py-2 text-xs"
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    className="btn-ghost px-4 py-2 text-xs"
                  >
                    Download
                  </button>
                </div>
              </div>

              <div className="brut overflow-hidden">
                {tab === "preview" ? (
                  <div className="overflow-x-auto p-6">
                    <MarkdownPreview markdown={markdown} />
                  </div>
                ) : (
                  <pre className="overflow-x-auto p-6 text-[0.7rem] leading-relaxed text-[#c8c8c8]">
                    <code>{markdown}</code>
                  </pre>
                )}
              </div>

              <p className="mt-5 border-l-2 border-[var(--line-bright)] py-1 pl-4 text-xs leading-relaxed text-[var(--muted)]">
                Create a public repo named{" "}
                <code className="bg-[#0d0d0d] px-1.5 py-0.5 text-white">
                  {profile.login}/{profile.login}
                </code>{" "}
                and save this as its README.md
              </p>
            </div>
          </section>
        </>
      )}

      <footer className="mt-20 border-t-2 border-[var(--line)] pt-6 text-center">
        <span className="label">Thanks for watching</span>
      </footer>
    </div>
  );
}
