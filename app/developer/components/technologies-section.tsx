// Technologies section showcasing tech stack

export function TechnologiesSection() {
  const technologies = [
    "React JS",
    "Vercel",
    "Next.js",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Appwrite",
    "Getstream.io",
    "GitHub",
    "MongoDB",
    "Figma",
    "Tailwind CSS",
    "mySQL",
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 text-center">Technologies I Work With</h2>
        <p className="text-white/80 text-center mb-12 max-w-2xl mx-auto">
          A diverse toolkit for building scalable and modern applications
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="px-6 py-3 border border-border rounded-full text-sm font-medium hover:border-green transition-colors"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
