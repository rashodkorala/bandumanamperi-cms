import { cn } from "@/lib/utils"

interface AlertProps {
  children: React.ReactNode
  variant?: "default" | "warning" | "info" | "success"
  className?: string
}

export function Alert({ children, variant = "default", className }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 mt-6",
        variant === "default" && "bg-muted/50 border-border",
        variant === "warning" && "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
        variant === "info" && "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
        variant === "success" && "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AlertTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={cn("mb-1 font-semibold leading-none tracking-tight", className)}>
      {children}
    </h4>
  )
}

export function AlertDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)}>
      {children}
    </div>
  )
}

