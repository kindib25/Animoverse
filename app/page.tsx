import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-8 overflow-hidden">
      {/* Animated Deep Space Gradient Background */}
      <div className="absolute inset-0 -z-20 h-full w-full animate-gradient 
                      bg-[linear-gradient(135deg,#408cd8,#2a5e92,#18395a,#172232,#0B1016,#58621f,#C3DB3F)] 
                      bg-[length:400%_400%]" />

      {/* Subtle Star Dust Layer */}
      <div className="absolute inset-0 -z-10 h-full w-full 
                      bg-[radial-gradient(white,transparent_1px)] 
                      [background-size:4px_4px] opacity-[0.05]" />

      {/* Content */}
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl text-white font-mono drop-shadow">
          Welcome to Animoverse
        </h1>
        <p className="text-lg text-gray-300 md:text-xl max-w-xl font-mono">
          Connect with study groups and collaborate on your learning journey
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg" className="cursor-pointer bg-[#C3DB3F] text-[#172232] hover:bg-white hover:text-[#172232] transition font-mono">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="cursor-pointer border-[#C3DB3F] text-white hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  )
}
