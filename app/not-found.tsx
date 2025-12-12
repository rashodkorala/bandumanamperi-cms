import Link from "next/link"
import { IconHome, IconSearch } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/protected/dashboard">
                <IconHome className="size-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/protected">
                <IconSearch className="size-4" />
                Browse Pages
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

