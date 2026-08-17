import { fetchProfile, GitHubError, parseGitHubInput } from "@/lib/github";

export async function POST(request: Request) {
  let input: unknown;
  try {
    const body = await request.json();
    input = (body as { input?: unknown })?.input;
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  if (typeof input !== "string") {
    return Response.json(
      { error: "Provide a GitHub username or profile URL." },
      { status: 400 },
    );
  }

  try {
    const username = parseGitHubInput(input);
    const { profile, rateLimit } = await fetchProfile(username);
    return Response.json({ profile, rateLimit });
  } catch (error) {
    if (error instanceof GitHubError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("analyze failed:", error);
    return Response.json(
      { error: "Couldn't reach GitHub. Check your connection and try again." },
      { status: 502 },
    );
  }
}
