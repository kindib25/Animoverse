"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OnboardingLayout } from "../page"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/onboarding/logo"
import { Progress } from "@/components/ui/progress"

export default function Onboarding() {
    const router = useRouter()
    const { toast } = useToast()
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadUser() {
            try {
                const userResult = await clientGetCurrentUser()

                if (!userResult.success || !userResult.user) {
                    router.push("/login")
                    return
                }

                setUserId(userResult.user.$id)
            } catch (error) {
                console.error("Error loading user:", error)
                toast({
                    title: "Error",
                    description: "Failed to load user data.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadUser()
    }, [router, toast])

    const handleClick = () => {
        router.push('/onboarding/username');
    };

    if (isLoading) {
        return (
            <OnboardingLayout>
                <div className="flex items-center justify-center">
                    <div className="flex items-center pt-50 space-x-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-white text-2xl">Loading...</p>
                    </div>
                </div>
            </OnboardingLayout>
        )
    }

    return (
        <OnboardingLayout>
            {/* Center Card */}
            <div className="w-full max-w-2xl px-4">
                <Card>
                    <CardHeader>
                        <Progress value={16} />
                        <div className="py-15" />
                        <CardTitle className="flex items-center justify-center text-3xl">
                            Welcome to Animoverse
                        </CardTitle>
                        <p className="flex items-center justify-center">
                            Let’s set up your study profile
                        </p>
                    </CardHeader>

                    <div className="py-20" />

                    <CardFooter className="flex justify-center">
                        <Button className="shad-button_onboarding" onClick={handleClick}>
                            Get Started
                        </Button>
                    </CardFooter>

                    <div className="py-5" />
                </Card>
            </div>
        </OnboardingLayout>
    )
}
