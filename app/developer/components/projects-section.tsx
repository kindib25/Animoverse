// Projects section showcasing your work
// Update project titles, descriptions, tags, and links with your own projects

"use client"

import { Github } from "lucide-react"
import GitHubProjects from "./github-projects"

export function ProjectsSection() {
  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-white/80 text-lg">Explore my latest work and contributions on GitHub</p>
        </div>

        <GitHubProjects />

        {/* View All Projects Link */}
        <div className="mt-12 text-center">
          <a
            href="https://github.com/kindib25"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green hover:bg-green/90 text-black rounded-lg transition-all hover:gap-3 font-medium"
          >
            <Github size={20} />
            View All Projects on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
