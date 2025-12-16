// Hero section with name, profession, and call-to-action buttons
// Customize the name, title, and bio with your own information

import Image from "next/image"

export function HeroSection() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-4 py-20 bg-transparent relative z-10">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div>
            <p className="text-green font-semibold mb-2">Hi, I'm Kean Baba</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Full-Stack Developer | Frontend & Backend Solutions
            </h1>
            <p className="text-lg text-white/80 mb-8 text-balance">
              I’m a Full-Stack Developer specializing in modern, high-performance web applications using React.js, Next.js, Tailwind CSS, Appwrite, and Node.js.
              I build clean, responsive, and scalable solutions focused on great user experience and reliable backend functionality.

            </p>

            {/* Location and stats */}
            <div className="flex gap-6 mb-8 flex-wrap">
              <div>
                <p className="text-green text-sm">Location</p>
                <p className="font-semibold">Cagayan De Oro City, <br /> Philippines</p>
              </div>
              <div>
                <p className="text-green text-sm">Repositories</p>
                <p className="font-semibold">1 repository</p>
              </div>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              <a
                href="#projects"
                className="shad-button_viewMyWork"
              >
                View My Work
              </a>
              <a
                href="#contact"
                className="shad-button_GetInTouch"
              >
                Get In Touch
              </a>
            </div>
          </div>

          {/* Right side - Profile image */}
          <div className="flex justify-center">
            <div className="w-90 h-90 rounded-lg overflow-hidden shadow-xl border border-border">
              <Image
                src="/baba_profilepic.png"
                alt="Kean Dheb Baba"
                width={256}
                height={256}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
