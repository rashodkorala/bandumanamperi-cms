import { Suspense } from "react"
import { Performances } from "@/components/performances"
import { getPerformances } from "@/lib/actions/performances"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Performances | CMS",
  description: "Manage your performances",
}

async function PerformancesContent() {
  const performances = await getPerformances()

  return <Performances initialPerformances={performances} />
}

function PerformancesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  )
}

export default function PerformancesPage() {
  return (
    <Suspense fallback={<PerformancesLoading />}>
      <PerformancesContent />
    </Suspense>
  )
}


