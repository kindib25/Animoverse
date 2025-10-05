import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SavedPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 px-20 pt-10 text-black">
        <div className="flex col-2">
          <Bookmark className="h-10 w-10 text-black" />
          <h1 className="text-3xl font-bold ml-1">Saved Groups</h1>
        </div>

        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Bookmark className="h-10 w-10 text-black" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">No saved groups yet</h3>
          <p className="mt-2 max-w-sm text-balance text-muted-foreground">
            Save groups you're interested in to easily find them later.
          </p>
          <Button asChild className="mt-6 cursor-pointer bg-accent py-8 text-[#172232] hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono" variant="outline">
            <Link href="/dashboard/explore">Explore Groups</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
