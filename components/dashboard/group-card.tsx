import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GroupCardProps {
  group: {
    id: string
    name: string
    image: string
    schedule: string
    members: { current: number; max: number }
    type: string
  }
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/dashboard/groups/${group.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="p-0">
          <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
            <img src={group.image || "/placeholder.svg"} alt={group.name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold">{group.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {group.members.current}/{group.members.max}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{group.schedule}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {group.type}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
