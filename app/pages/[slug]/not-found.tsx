import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconHome } from "@tabler/icons-react"

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The page you're looking for doesn't exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/">
          <IconHome className="h-4 w-4 mr-2" />
          Go Home
        </Link>
      </Button>
    </div>
  )
}

