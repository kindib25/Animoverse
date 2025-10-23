"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OnboardingLayout } from "../page"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getUserProfile } from "@/lib/appwrite/database"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Onboarding() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [progress, setProgress] = useState(80)

    useEffect(() => {
        async function loadProfile() {
            const userResult = await clientGetCurrentUser()

            if (!userResult.success || !userResult.user) {
                router.push("/login")
                return
            }

            const profileResult = await getUserProfile(userResult.user.$id)

            if (profileResult.success) {
                setProfile(profileResult.profile)
            }

            setIsLoading(false)
        }

        loadProfile()
    }, [router])



    useEffect(() => {
        const timer = setTimeout(() => setProgress(100), 500)
        return () => clearTimeout(timer)
    }, [])

    const handleClick = () => {
        router.push('/onboarding/matches');
    };


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
                    <CardHeader>
                        <Progress value={100} />
                        <div className="py-3" />
                        <CardTitle className="flex items-center justify-center text-3xl">
                            All Set!
                        </CardTitle>
                        <p className="flex items-center justify-center text-lg">Here's your study profile.</p>
                        <div className="space-y-2 flex justify-center items-center flex-col ">
                        </div>
                        <CardContent className="pt-3">
                            <div className="flex flex-col items-center gap-6 text-center">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={profile.avatarUrl} />
                                    <AvatarFallback className="text-3xl">
                                        {profile?.name
                                            ?.split(" ")
                                            .map((n: string) => n[0])
                                            .join("") || "U"}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <h1 className="text-xl font-bold">{profile?.name || "User"}</h1>
                                    <p className="text-muted-foreground">@{profile?.username || "username"}</p>
                                </div>

                                {profile?.grade && (
                                    <Badge variant="secondary" className="text-base px-4 py-1">
                                        {profile.grade}
                                    </Badge>
                                )}

                                {/* Subjects - now in horizontal flex row */}
                                <div className="flex flex-wrap justify-center gap-2">
                                    {profile.subjects.map((subject: string) => (
                                        <Badge key={subject} variant="secondary" className="py-2 px-5">
                                            {subject}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Study Preferences - keep as-is */}
                                <div className="flex flex-wrap justify-center gap-2">
                                    {profile.studyPreferences.map((pref: string) => (
                                        <Badge key={pref} variant="outline" className="text-black text-sm p-3 px-5 border-black">
                                            {pref}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </CardHeader>
                    <div />
                    <CardFooter className="flex justify-center">
                        <Button
                            type="submit"
                            className="shad-button_onboarding"
                            onClick={handleClick}
                        >
                            Find My Match
                        </Button>
                    </CardFooter>
                    <div className="py-5" />
                </Card>
            </div>
        </OnboardingLayout >

    )
}
