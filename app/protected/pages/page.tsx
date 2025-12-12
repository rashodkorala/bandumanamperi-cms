import { IconListDetails } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PagesPage() {
  return (
    <div className="flex flex-grow flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-muted p-4">
                    <IconListDetails className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Pages</CardTitle>
                <CardDescription className="text-base">
                  Coming Soon
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  The Pages feature is currently under development. 
                  You&apos;ll be able to create and manage static website pages soon.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

