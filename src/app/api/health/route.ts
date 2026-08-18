/**
 * The generated README embeds images from third-party card services, and those
 * public instances go down (paused deployments, billing lapses) without notice.
 * Probing them here lets the UI disable dead sections instead of silently
 * producing a README full of broken images — and re-enable them when they return.
 */

const PROBES: Record<string, string> = {
  stats: "https://github-readme-stats.vercel.app/api?username=octocat",
  streak: "https://streak-stats.demolab.com?user=octocat",
  activity:
    "https://github-readme-activity-graph.vercel.app/graph?username=octocat",
  trophy: "https://github-profile-trophy.vercel.app/?username=octocat",
  visitors: "https://komarev.com/ghpvc/?username=octocat",
};

async function probe(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      // Generous: these card services render SVGs on demand and a cold one can
      // take several seconds. Too tight a budget reports a live host as dead.
      signal: AbortSignal.timeout(15000),
      // Cache the verdict: these are shared hosts, not per-user data, and an
      // unthrottled probe on every page load would be its own problem.
      next: { revalidate: 300 },
    });
    return res.ok;
  } catch {
    // Timeout, DNS failure or connection refused all mean "don't use this".
    return false;
  }
}

export async function GET() {
  const names = Object.keys(PROBES);
  const results = await Promise.all(names.map((n) => probe(PROBES[n])));

  const health = Object.fromEntries(
    names.map((name, i) => [name, results[i]]),
  ) as Record<string, boolean>;

  return Response.json(health);
}
