"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Bell, Trash2, CheckCircle, AlertCircle, Clock, FileText } from "lucide-react"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useRouter } from "next/navigation"
import {
  useNotifications,
  useMarkNotificationAsRead,
  useDeleteNotification,
  useMarkAllNotificationsAsRead,
} from "@/lib/hooks/use-notifications"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function NotificationsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>("")
  const { data: notifications = [], isLoading } = useNotifications(userId)
  const { mutate: markAsRead } = useMarkNotificationAsRead()
  const { mutate: deleteNotif } = useDeleteNotification()
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead()


  useEffect(() => {
    async function checkAuth() {
      const userResult = await clientGetCurrentUser()
      if (!userResult.success || !userResult.user) {
        router.push("/login")
        return
      }
      setUserId(userResult.user.$id)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    console.log("Fetched notifications:", notifications)
  }, [notifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "group_approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "group_rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "join_request":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "join_approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "join_rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "group_submitted":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "group_approved":
      case "join_approved":
        return "bg-green-50 border-green-200"
      case "group_rejected":
      case "join_rejected":
        return "bg-red-50 border-red-200"
      case "join_request":
        return "bg-blue-50 border-blue-200"
      case "group_submitted":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead(userId)}>
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">
              You'll see notifications here when there's activity on your groups or requests.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification: any) => (
              <Card
                key={notification.$id}
                className={`p-4 border-l-4 transition-colors ${getNotificationColor(notification.type)} ${!notification.isRead ? "border-l-blue-500 bg-blue-50" : "border-l-gray-300"
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.$createdAt && !isNaN(new Date(notification.$createdAt).getTime())
                          ? `${new Date(notification.$createdAt).toLocaleDateString()} at ${new Date(
                            notification.$createdAt
                          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : "Date not available"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.$id)}
                        className="text-xs"
                      >
                        Mark read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotif(notification.$id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
