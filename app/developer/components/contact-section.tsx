"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Github, Linkedin, Send } from "lucide-react"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Replace with your actual form submission endpoint
      // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
      console.log("Form submitted:", formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSubmitStatus("success")
      setFormData({ name: "", email: "", message: "" })

      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-6">Let's Connect</h2>
          <p className="text-xl text-white/80">
            I'm always interested in hearing about new projects and opportunities. Feel free to reach out!
          </p>
        </div>

        {/* Social Links */}
        <div className="flex gap-6 justify-center mb-12 flex-wrap">
          <a
            href="keandheb.baba@lsu.edu.ph"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green text-black rounded-lg hover:bg-green/90 transition-colors font-medium"
          >
            <Mail size={20} /> Email Me
          </a>
          <a
            href="https://github.com/kindib25"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:border-green hover:text-green transition-colors font-medium"
          >
            <Github size={20} /> GitHub
          </a>
          <a
            href="https://linkedin.com/in/kean-dheb-baba-4518962b8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:border-green hover:text-green transition-colors font-medium"
          >
            <Linkedin size={20} /> LinkedIn
          </a>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Kean Dheb Baba"
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="kean@example.com"
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell me about your project or opportunity..."
              rows={5}
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full shad-button_Login flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Send Message</span>
              </>
            )}
          </button>

          {/* Status Messages */}
          {submitStatus === "success" && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-center">
              ✓ Message sent successfully! I'll get back to you soon.
            </div>
          )}
          {submitStatus === "error" && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-center">
              ✗ Error sending message. Please try again or email me directly.
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
