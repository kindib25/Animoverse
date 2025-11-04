"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import  OnboardingLayout  from "../page"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useUserProfile, useSetUserGrade } from "@/lib/hooks/use-user"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function Onboarding() {
    const router = useRouter()
    const { toast } = useToast()
    const [userId, setUserId] = useState("")
    const [grade, setGrade] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [progress, setProgress] = useState(32)


    const { data: profile } = useUserProfile(userId)
    const updateProfileMutation = useSetUserGrade(userId)

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
            }
            finally {
                setIsLoading(false)
            }
        }

        loadUser()
    }, [router, toast])


    useEffect(() => {
        const timer = setTimeout(() => setProgress(48), 500)
        return () => clearTimeout(timer)
    }, [])


    useEffect(() => {
        if (profile) {
            setGrade(profile.grade || "")
        }
    }, [profile])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) return 
        updateProfileMutation.mutate({
            grade,
        })
    }

    if (isLoading) {
        return (
            <OnboardingLayout>
                <div className="w-full max-w-2xl px-4">
                    <Card>
                        <form className="space-y-6">
                            <CardHeader>
                                <Progress value={progress} />
                                <div className="py-15" />
                                <CardTitle className="flex items-center justify-center text-3xl">

                                </CardTitle>
                                <div className="space-y-2">
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                <Loader2 className="animate-spin text-black h-10 w-10" />
                            </CardContent>
                            <div className="py-30" />
                            <CardFooter className="flex justify-center">
                            </CardFooter>
                            <div className="py-5" />
                        </form>
                    </Card>
                </div>
            </OnboardingLayout>
        )
    }

    return (
        <OnboardingLayout>
            {/* Center Card */}
            <div className="w-full max-w-2xl px-4">
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <CardHeader>
                            <Progress value={48} />
                            <div className="py-10" />
                            <CardTitle className="flex items-center justify-center text-xl md:text-3xl">
                                What grade are you in?
                            </CardTitle>
                            <div className="space-y-2 pt-20 flex justify-center items-center flex-col ">
                                <Input
                                    id="grade"
                                    className="
                                    border-3 border-black
                                    selection:bg-background selection:text-white
                                    text-center py-7
                                    text-2xl md:text-[2rem]
                                    w-[90%] md:w-[450px]
                                    md:py-10 md:pr-6
                                    "
                                    placeholder="e.g., Grade 10"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    
                                />
                            </div>
                        </CardHeader>
                        <div className="py-5" />
                        <CardFooter className="flex justify-center">
                            <Button
                                type="submit"
                                className="shad-button_onboarding"
                                disabled={!userId || updateProfileMutation.isPending}
                            >
                                {updateProfileMutation.isPending ? "Saving..." : "Next"}
                            </Button>
                        </CardFooter>
                        <div className="py-5" />
                    </form>
                </Card>
            </div>
        </OnboardingLayout >

    )
}
