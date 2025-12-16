// API route to fetch GitHub repositories
// This runs on the server and handles GitHub API calls safely

import { getGitHubRepos } from "@/app/developer/lib/github"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "6", 10)

    const repos = await getGitHubRepos(limit)

    return Response.json(repos, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return Response.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}
