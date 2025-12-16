// GitHub API utility to fetch user data and repositories
// This file handles all GitHub API calls for the portfolio

const GITHUB_USERNAME = "kindib25"
const GITHUB_API_BASE = "https://api.github.com"

// Interface for GitHub repository data
interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics: string[]
}

// Interface for GitHub user data
interface GitHubUser {
  login: string
  name: string | null
  bio: string | null
  avatar_url: string
  public_repos: number
  followers: number
  following: number
  html_url: string
}

/**
 * Fetch GitHub user profile information
 * @returns GitHub user data or null if fetch fails
 */
export async function getGitHubUser(): Promise<GitHubUser | null> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch GitHub user:", response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching GitHub user:", error)
    return null
  }
}

/**
 * Fetch GitHub repositories sorted by stars
 * @param limit Number of repositories to fetch (default: 6)
 * @returns Array of GitHub repositories or empty array if fetch fails
 */
export async function getGitHubRepos(limit = 6): Promise<GitHubRepo[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=stars&order=desc&per_page=${limit}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (!response.ok) {
      console.error("[v0] Failed to fetch GitHub repos:", response.status)
      return []
    }

    const repos = await response.json()
    // Filter out forked repositories and return only original projects
    return repos.filter((repo: any) => !repo.fork)
  } catch (error) {
    console.error("[v0] Error fetching GitHub repos:", error)
    return []
  }
}
