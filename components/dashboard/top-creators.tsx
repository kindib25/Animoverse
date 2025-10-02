import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const creators = [
  { id: "1", name: "Kean Baba", username: "@keanbaba", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "2", name: "Russel", username: "@russel", avatar: "/placeholder.svg?height=40&width=40" },
]

export function TopCreators() {
  return (
    <Card className="hidden h-fit w-80 lg:block">
      <CardHeader>
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
            <Button size="sm" variant="outline">
              Follow
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
