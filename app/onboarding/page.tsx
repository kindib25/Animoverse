"use client"

import { usePathname } from "next/navigation"
import { use } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { Logo } from "@/components/onboarding/logo"

interface OnboardingLayoutProps {
    children: React.ReactNode
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {

    const router = useRouter()
    const { profile, isLoading } = useAuth()


    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-white text-2xl">Loading...</p>
                </div>
            </div>


        )
    }


    return (
        <div className="flex-1 min-h-screen bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
            <Logo />
            <main className="flex-1 flex items-center justify-center py-10 lg:px-12">
                {children}
            </main>
        </div>
    )
}
