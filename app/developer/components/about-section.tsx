// About section with bio and skills display
// Update the bio text and skills list with your own information

export function AboutSection() {
  const skills = [
    {
      category: "Frontend",
      items: [
        { name: "React.js", level: 90 },
        { name: "TypeScript", level: 85 },
        { name: "Tailwind CSS", level: 90 },
        { name: "Next.js", level: 85 },
      ],
    },
    {
      category: "Backend",
      items: [
        { name: "Node.js", level: 85 },
        { name: "MongoDB", level: 85 },
        { name: "Java", level: 80 },
        { name: "API Design", level: 80 },
      ],
    },
    {
      category: "Mobile & Tools",
      items: [
        { name: "Android Development", level: 80 },
        { name: "Git", level: 90 },
        { name: "Problem Solving", level: 90 },
        { name: "UI/UX Design", level: 75 },
      ],
    },
  ]

  return (
    <section id="about" className="py-20 px-4 bg-card/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-12">About Me</h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Bio Section */}
          <div>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              I'm a passionate Software Engineering student from Ethiopia with a love for building web and mobile
              applications that solve real-world problems. My experience spans full-stack development, including
              React.js, Node.js, MongoDB, Java, and Android development.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              I enjoy creating clean, efficient, and scalable code, and I'm constantly learning new technologies to
              improve my skills. I'm particularly interested in product design, user experience, and building digital
              solutions that bring people together.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              When I'm not programming, I like exploring innovative tech ideas, improving my productivity, and
              experimenting with small projects that generate real value.
            </p>
          </div>

          {/* Skills Section with Progress Bars */}
          <div>
            <h3 className="text-2xl font-semibold mb-8">Skills & Expertise</h3>
            <div className="space-y-8">
              {skills.map((skillGroup) => (
                <div key={skillGroup.category}>
                  <h4 className="font-semibold text-accent mb-4">{skillGroup.category}</h4>
                  <div className="space-y-3">
                    {skillGroup.items.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <span className="text-sm text-muted-foreground">{skill.level}%</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-card border border-border rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-accent to-accent/60 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
