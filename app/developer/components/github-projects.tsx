"use client"

import { useEffect, useState } from "react"
import { Github, Star, Code2 } from "lucide-react"

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

/**
 * GitHubProjects Component
 * Displays a grid of your GitHub repositories with real-time data
 * Fetches projects from GitHub API and displays them with stars, language, and links
 */
export default function GitHubProjects() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true)
        const response = await fetch("/developer/api/github?limit=3")

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.error || data.length === 0) {
          setError("Unable to load projects from GitHub")
        } else {
          setRepos(data)
        }
      } catch (err) {
        console.error("[v0] Error in GitHubProjects:", err)
        setError("Failed to load projects")
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-lg p-6 animate-pulse h-64" />
        ))}
      </div>
    )
  }

  // Error state with fallback
  if (error || repos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">{error || "No projects found"}</p>
        <a
          href="https://github.com/kindib25"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Github size={20} />
          View on GitHub
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map((repo) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-slate-800 hover:bg-slate-700 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 border border-slate-700 hover:border-green-500/50"
        >
          {/* Project Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors truncate">
                {repo.name}
              </h3>
            </div>
            <Github size={20} className="text-slate-400 flex-shrink-0 ml-2" />
          </div>

          {/* Project Description */}
          <p className="text-slate-400 text-sm mb-4 line-clamp-2 min-h-10">
            {repo.description || "No description available"}
          </p>

          {/* Project Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {repo.language && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/30 text-green-300 text-xs rounded-full">
                <Code2 size={12} />
                {repo.language}
              </span>
            )}
            {repo.topics &&
              repo.topics.slice(0, 2).map((topic) => (
                <span key={topic} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                  {topic}
                </span>
              ))}
          </div>

          {/* Stars and Link */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div className="flex items-center gap-1 text-slate-400">
              <Star size={16} />
              <span className="text-sm">{repo.stargazers_count}</span>
            </div>
            <span className="text-green-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              View →
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}
