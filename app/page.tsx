"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, PlayIcon } from "lucide-react";
import RotatingCard from "@/components/home-card/rotating-card";
import { useState } from "react";
import { Menu, X } from "lucide-react"; 


export default function HomePage() {
const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#16213e] to-[#0f1729] text-white relative overflow-hidden`}
    >
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0  opacity-20"
          style={{
            backgroundImage: `
          linear-gradient(to right, #444 1px, transparent 1px),
          linear-gradient(to bottom, #444 1px, transparent 1px)
        `,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Nebula glow effects */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-green/15 rounded-full blur-[120px] animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-green-600/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[9999] bg-black/10 md:bg-transparent backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/">
            <img
              src="/logonamelsu.svg"
              alt="logo"
              className="w-40 md:w-50 h-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 text-lg font-normal">
            <Link href="#" className="hover:text-green-400 transition-colors">
              Docs
            </Link>
            <Link href="#" className="hover:text-green-400 transition-colors">
              Blog
            </Link>
            <Link href="#" className="hover:text-green-400 transition-colors">
              Developer
            </Link>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              asChild
              size="lg"
              className="cursor-pointer bg-transparent text-white text-lg hover:text-black hover:bg-white transition font-mono"
            >
              <Link href="/login">Log In</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="cursor-pointer bg-green text-black text-lg hover:bg-green/90 transition font-mono"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white focus:outline-none cursor-pointer"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden bg-black/60 text-white px-6 py-4 space-y-4">
            <nav className="flex flex-col space-y-4 text-lg">
              <Link
                href="#"
                className="hover:text-green-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Docs
              </Link>
              <Link
                href="#"
                className="hover:text-green-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="#"
                className="hover:text-green-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Developer
              </Link>
            </nav>

            <div className="flex flex-col space-y-3 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-transparent border border-white text-white hover:bg-white hover:text-black transition font-mono"
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-green text-black hover:bg-green/90 transition font-mono"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </header>


      {/* Hero Content */}
      <main className="relative flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto px-8 py-16 z-50 lg:py-24 gap-12">
        {/* Left Section */}
        <div className="flex-1 lg:pr-16 text-center lg:text-left mt-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-wide">
            Welcome to 
          </h1>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-peace-sans leading-tight mb-6 tracking-wide">Animoverse</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Connect with study partners and collaborate on your learning journey
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-16">
            <Link href="/admin/login">
              <Button className="shad-button_press">
                <span className="text-xs tracking-widest opacity-70 font-semibold">
                  TEACHERS
                </span>
                <span className="flex items-center gap-1 text-lg font-bold">
                  Sign in <ArrowRightIcon className="w-5 h-5" />
                </span>
              </Button>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 text-lg text-gray-300 hover:text-green-400 transition-colors font-normal"
            >
              <div className="w-12 h-12 rounded-full border border-green-600 flex items-center justify-center hover:bg-green-600/20 transition-colors">
                <PlayIcon className="w-6 h-6" />
              </div>
              Watch Launch
            </Link>
          </div>

          {/* Statistics */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-x-12 gap-y-6 text-center lg:text-left">
            <div>
              <div className="text-4xl font-bold tracking-wide text-green-400">
                10K+
              </div>
              <div className="text-gray-400 text-sm font-normal">Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold tracking-wide text-green-400">
                100
              </div>
              <div className="text-gray-400 text-sm font-normal">Groups</div>
            </div>
            <div>
              <div className="text-4xl font-bold tracking-wide text-green-400">
                ∞
              </div>
              <div className="text-gray-400 text-sm font-normal">
                Sessions to Explore
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Rotating Card */}
        <div className="relative flex-1 flex justify-center items-center min-h-[400px] lg:min-h-[auto] lg:w-1/2 mt-10 md:mt-10 lg:mt-0">
          <div className="relative w-[350px] h-[220px] transform rotate-[-20deg] scale-85 md:scale-105">
            <RotatingCard
              frontImageSrc="/stunning-view-of-earth-from-space-with-stars-and-m.jpg"
              backImageSrc="/colorful-nebula-with-purple-and-blue-cosmic-clouds.jpg"
              className="w-full h-full"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
