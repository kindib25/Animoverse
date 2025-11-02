"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useVideoClient } from "@/lib/hooks/use-video-client"
import { StreamVideo, StreamCall, CallControls, SpeakerLayout, StreamTheme } from "@stream-io/video-react-sdk"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import "@stream-io/video-react-sdk/dist/css/styles.css"
import { useCallTracking } from "@/lib/hooks/use-call-tracking"
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config"

export default function VideoCallPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { videoClient, isReady } = useVideoClient()
  const [call, setCall] = useState<any>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [schedule, setSchedule] = useState<{ day: string; startTime: string; endTime: string } | null>(null)
  const [isWithinSchedule, setIsWithinSchedule] = useState(false)
  const { saveCallSession } = useCallTracking(call, groupId)

  // Fetch the real schedule from Appwrite
  useEffect(() => {
    const fetchGroupSchedule = async () => {
      try {
        const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId)
        const scheduleStr = group.schedule // e.g. "Tue 17:08 - 18:08"

        if (!scheduleStr) return

        // Parse string -> day + start/end time
        const parts = scheduleStr.split(" ")
        const day = parts[0]
        const times = parts.slice(1).join(" ").split("-").map((t: string) => t.trim())
        const startTime = times[0]
        const endTime = times[1]

        setSchedule({ day, startTime, endTime })
      } catch (error) {
        console.error("Error fetching group schedule:", error)
      }
    }

    if (groupId) fetchGroupSchedule()
  }, [groupId])

  // ⏱ Helper to check if current time is within schedule
  const checkIfWithinSchedule = (sch: { day: string; startTime: string; endTime: string }) => {
    const now = new Date()
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const currentDay = days[now.getDay()]

    if (currentDay !== sch.day) return false

    const [startH, startM] = sch.startTime.split(":").map(Number)
    const [endH, endM] = sch.endTime.split(":").map(Number)

    const start = new Date()
    start.setHours(startH, startM, 0, 0)
    const end = new Date()
    end.setHours(endH, endM, 0, 0)

    return now >= start && now <= end
  }

  // Check schedule periodically
  useEffect(() => {
    if (!schedule) return

    const updateScheduleStatus = () => {
      setIsWithinSchedule(checkIfWithinSchedule(schedule))
    }

    updateScheduleStatus()
    const interval = setInterval(updateScheduleStatus, 5 * 1000) // every 5s
    return () => clearInterval(interval)
  }, [schedule])

  // Initialize video call only when schedule allows
  useEffect(() => {
    if (!videoClient || !isReady || !groupId || !isWithinSchedule) return

    const initCall = async () => {
      try {
        const newCall = videoClient.call("default", groupId)
        await newCall.join({ create: true })
        setCall(newCall)
        setIsCallActive(true)
      } catch (error) {
        console.error("[Stream Video Call Error]", error)
      }
    }

    initCall()

    return () => {
      if (call) {
        call.leave()
        setCall(null)
        setIsCallActive(false)
      }
    }
  }, [videoClient, isReady, groupId, isWithinSchedule])

  // Automatically end call when schedule time ends
  useEffect(() => {
    if (!isWithinSchedule && call && isCallActive) {
      handleLeaveCall()
    }
  }, [isWithinSchedule])

  // Save call session on unmount
  useEffect(() => {
    return () => {
      saveCallSession()
    }
  }, [saveCallSession])

  const handleLeaveCall = async () => {
    if (call && call.active) {
      await saveCallSession()
      await call.leave()
      setIsCallActive(false)
    }
    router.push(`/dashboard/groups/${groupId}/chat`)
  }

  // If not scheduled yet
  if (!schedule || !isWithinSchedule) {
    return (
      <div className="relative flex h-screen flex-col items-center justify-center bg-[url('/call-bgMobile.svg')] md:bg-[url('/call-bg.svg')] bg-cover bg-center bg-no-repeat overflow-hidden">
        <div className="p-6 text-center bg-white/80 rounded-xl shadow-lg">
          <div className="absolute left-4 top-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 hover:text-white"
              asChild
            >
              <Link href={`/dashboard/groups/${groupId}/chat`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="flex items-center justify-center text-2xl font-semibold text-gray-800 mb-2 gap-2">
            <Clock className="h-6 w-6 mr-2 text-gray-700" />
            Scheduled time awaits
          </p>
          {schedule ? (
            <p className="text-gray-600">
              This group’s call will be available on <strong>{schedule.day}</strong> from{" "}
              <strong>{schedule.startTime}</strong> to <strong>{schedule.endTime}</strong>.
            </p>
          ) : (
            <p className="text-gray-600">Loading group schedule...</p>
          )}
        </div>
      </div>
    )
  }

  // Loading screen
  if (!isReady || !call || !videoClient) {
    return (
      <div className="relative flex h-screen flex-col bg-[url('/call-bgMobile.svg')] md:bg-[url('/call-bg.svg')] bg-cover bg-center bg-no-repeat overflow-hidden">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-background border-t-transparent" />
            <p className="text-black text-2xl">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Main call UI
  return (
    <div className="relative flex h-screen flex-col bg-[url('/call-bgMobile.svg')] md:bg-[url('/call-bg.svg')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <StreamVideo client={videoClient}>
        <StreamTheme>
          <StreamCall call={call}>
            <div className="absolute left-4 top-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 hover:text-white"
                asChild
              >
                <Link href={`/dashboard/groups/${groupId}/chat`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-1 items-center justify-center p-4 mt-20 md:mt-0">
              <SpeakerLayout participantsBarPosition="bottom" />
            </div>

            <div className="flex items-center justify-center pb-8">
              <CallControls onLeave={handleLeaveCall} />
            </div>
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    </div>
  )
}
