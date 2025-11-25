"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import OnboardingLayout from "../page"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useUserProfile, useSetUserGrade } from "@/lib/hooks/use-user"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDownIcon, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
                            {/* SELECT FIELD */}
                            <div className="pt-20 flex justify-center items-center flex-col">
                                <Select value={grade} onValueChange={setGrade}>
                                    <SelectTrigger
                                        className="
                                        border-3 border-black
                                        w-[90%] md:w-[450px]
                                        py-7 md:py-10
                                        text-2xl md:text-[2rem]
                                        relative
                                        justify-center
                                        [&>svg]:hidden  
                                        "
                                    >
                                        <SelectValue className="text-center" placeholder="Select Grade Level" />

                                        <span className="absolute right-4">
                                            <ChevronDownIcon />
                                        </span>
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Grade 7">Grade 7</SelectItem>
                                        <SelectItem value="Greade 8">Grade 8</SelectItem>
                                        <SelectItem value="Grade 9">Grade 9</SelectItem>
                                        <SelectItem value="Grade 10">Grade 10</SelectItem>
                                        <SelectItem value="Grade 11">Grade 11</SelectItem>
                                        <SelectItem value="Grade 12">Grade 12</SelectItem>
                                    </SelectContent>
                                </Select>
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
