"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useVideoClient } from "@/lib/hooks/use-video-client"
import { StreamVideo, StreamCall, CallControls, SpeakerLayout, StreamTheme } from "@stream-io/video-react-sdk"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import "@stream-io/video-react-sdk/dist/css/styles.css"

export default function VideoCallPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { videoClient, isReady } = useVideoClient()
  const [call, setCall] = useState<any>(null)
  const [isCallActive, setIsCallActive] = useState(false)

  useEffect(() => {
    if (!videoClient || !isReady || !groupId) return

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
  }, [videoClient, isReady, groupId])

  const handleLeaveCall = async () => {
    if (call) {
      await call.leave()
      setIsCallActive(false)
    }
    router.push(`/dashboard/groups/${groupId}/chat`)
  }

  if (!isReady || !call || !videoClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <p className="text-white">Loading call...</p>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <StreamVideo client={videoClient}>
        <StreamTheme>
          <StreamCall call={call}>
            {/* Back button */}
            <div className="absolute left-4 top-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70"
                asChild
              >
                <Link href={`/dashboard/groups/${groupId}/chat`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Video layout */}
            <div className="flex flex-1 items-center justify-center p-4">
              <SpeakerLayout participantsBarPosition="bottom" />
            </div>

            {/* Call controls */}
            <div className="flex items-center justify-center pb-8">
              <CallControls onLeave={handleLeaveCall} />
            </div>
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    </div>
  )
}
