import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UpcomingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 px-20 pt-10 text-black">
        <div>
          <h1 className="text-3xl font-bold">Upcoming Schedules</h1>
        </div>

        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="h-10 w-10 text-black" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">No upcoming sessions</h3>
          <p className="mt-2 max-w-sm text-balance text-muted-foreground">
            Join or create study groups to see your upcoming sessions here.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline" className="cursor-pointer bg-accent py-8 text-[#172232] hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono" >
              <Link href="/dashboard/create-group">Create Group</Link>
            </Button>
            <Button variant="outline" asChild className="cursor-pointer py-8 gap-2 text-white hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono">
              <Link href="/dashboard/explore">Explore Groups</Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
