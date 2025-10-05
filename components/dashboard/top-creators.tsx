import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const creators = [
  { id: "1", name: "Kean Baba", username: "@keanbaba", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "2", name: "Russel", username: "@russel", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "3", name: "Maricar", username: "@maricar", avatar: "/placeholder.svg?height=40&width=40" },
]

export function TopCreators() {
  return (
    <div className="mx-4 hidden w-80 lg:block lg:sticky lg:top-6">
    <Card className="hidden w-80 lg:block bg-card shadow-lg sticky top-6 h-fit">
      <CardHeader className="pb-6">
        <CardTitle>Top Creators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {creators.map((creator) => (
          <div key={creator.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={creator.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {creator.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{creator.name}</span>
                <span className="text-xs text-muted-foreground">{creator.username}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="cursor-pointer py-1 px-3 text-xs bg-green hover:bg-[#172232] hover:text-[#FFFFFF] transition font-mono">
              Follow
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
    </div>
  )
}
