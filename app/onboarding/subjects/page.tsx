"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import  OnboardingLayout  from "../page"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useUserProfile, useSetUserSubjects } from "@/lib/hooks/use-user"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

const subjects = ["Math", "Science", "English", "Filipino", "ICT", "Others"]

export default function Onboarding() {
    const router = useRouter()
    const { toast } = useToast()
    const [userId, setUserId] = useState("")
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
    const [isCustomSubject, setIsCustomSubject] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [progress, setProgress] = useState(48)

    const { data: profile } = useUserProfile(userId)
    const updateProfileMutation = useSetUserSubjects(userId)

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

    useEffect(() => {
        const timer = setTimeout(() => setProgress(64), 500)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (profile) {
            setSelectedSubjects(profile.subjects || [])
        }
    }, [profile])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) return
        updateProfileMutation.mutate({
            subjects: selectedSubjects,
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
            <div className="w-full max-w-2xl px-4">
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <CardHeader>
                            <Progress value={64} />
                            <div className="py-5" />
                            <CardTitle className="flex items-center text-center justify-center text-2xl md:text-3xl">
                                What subject do you want to focus on?
                            </CardTitle>

                            <div className="space-y-2 pt-5 flex justify-center items-center flex-col">
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        {subjects.map((subject) => {
                                            const isSelected =
                                                subject === "Others"
                                                    ? isCustomSubject
                                                    : selectedSubjects.includes(subject)

                                            return (
                                                <Button
                                                    key={subject}
                                                    type="button"
                                                    onClick={() => {
                                                        if (subject === "Others") {
                                                            setIsCustomSubject((prev) => !prev)
                                                            if (isCustomSubject) {
                                                                // If unchecking "Others", clear custom subject
                                                                setSelectedSubjects((prev) =>
                                                                    prev.filter((s) => subjects.includes(s))
                                                                )
                                                            }
                                                        } else {
                                                            setSelectedSubjects((prev) =>
                                                                prev.includes(subject)
                                                                    ? prev.filter((s) => s !== subject)
                                                                    : [...prev, subject]
                                                            )
                                                        }
                                                    }}
                                                    className={`w-full justify-center ${isSelected
                                                            ? "shad-button_subjectSelected"
                                                            : "shad-button_subjectUnselected"
                                                        }`}
                                                >
                                                    {subject}
                                                </Button>
                                            )
                                        })}
                                    </div>

                                    {isCustomSubject && (
                                        <div className="mt-10 flex justify-center">
                                            <Input
                                                id="custom-subject"
                                                placeholder="Enter custom subject"
                                                value={
                                                    selectedSubjects.find((s) => !subjects.includes(s)) || ""
                                                }
                                                onChange={(e) => {
                                                    const value = e.target.value.trim()
                                                    setSelectedSubjects((prev) => {
                                                        const filtered = prev.filter((s) =>
                                                            subjects.includes(s)
                                                        )
                                                        return value ? [...filtered, value] : filtered
                                                    })
                                                }}
                                                className="py-7 pr-6 border-2 border-black selection:bg-background selection:text-white"
                                                style={{ fontSize: '1rem', width: '250px', textAlign: 'center' }}
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <div className="py-2" />
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
        </OnboardingLayout>
    )
}
