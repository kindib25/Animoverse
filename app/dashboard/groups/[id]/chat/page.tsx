"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone } from "lucide-react"
import { useStreamChat } from "@/lib/context/stream-context"
import { Channel, MessageInput, MessageList, Window, Chat } from "stream-chat-react"
import { useGroup } from "@/lib/hooks/use-groups"
import "stream-chat-react/dist/css/v2/index.css"

export default function GroupChatPage() {
  const params = useParams()
  const groupId = params.id as string
  const { chatClient, isReady } = useStreamChat()
  const { data: group } = useGroup(groupId)
  const [channel, setChannel] = useState<any>(null)

  useEffect(() => {
    if (!chatClient || !isReady || !groupId) return

    const initChannel = async () => {
      try {
        const newChannel = chatClient.channel("messaging", groupId, {
          name: group?.name || `Group ${groupId}`,
        })

        await newChannel.watch()
        setChannel(newChannel)
      } catch (error) {
        console.error("[Stream Channel Error]", error)
      }
    }

    initChannel()

    return () => {
      if (channel) {
        channel.stopWatching()
      }
    }
  }, [chatClient, isReady, groupId, group?.name])

  if (!isReady || !channel) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <Card className="flex h-[calc(100vh-8rem)] flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/groups/${params.id}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <CardTitle>{group?.name || "Group Chat"}</CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild className="bg-transparent">
                <Link href={`/dashboard/groups/${params.id}/call`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Join Call
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <Chat client={chatClient} theme="str-chat__theme-light">
              <Channel channel={channel}>
                <Window>
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            </Chat>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
