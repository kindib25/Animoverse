"use client"

import { use } from "react"
import { useGroupMembers } from "@/lib/hooks/use-admin"
import { useGroup } from "@/lib/hooks/use-groups"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, MessageSquare, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AdminGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: group, isLoading: loadingGroup } = useGroup(id)
  const { data: members, isLoading: loadingMembers } = useGroupMembers(id)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMembers = members?.filter((member: any) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/groups">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          {loadingGroup ? (
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          ) : (
            <div>
              <h1 className="text-3xl font-bold">{group?.name}</h1>
              <p className="text-muted-foreground">{group?.subject}</p>
            </div>
          )}
        </div>

        <div className="mb-6 flex gap-3">
          <Button asChild className="border-1 bg-background">
            <Link href={`/admin/groups/${id}/chat`} className="text-white hover:text-black">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/groups/${id}/reports`}>
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>Manage group members and their status</CardDescription>
              </div>
              <Badge variant="secondary">{members?.length || 0} members</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {loadingMembers ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMembers && filteredMembers.length > 0 ? (
              <div className="space-y-3">
                {filteredMembers.map((member: any) => (
                  <div key={member.$id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {member.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">@{member.username}</p>
                      </div>
                    </div>
                    <Badge variant={member.role === "creator" ? "default" : "secondary"}>{member.role}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No members found</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
