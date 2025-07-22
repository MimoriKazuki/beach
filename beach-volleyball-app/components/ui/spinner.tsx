import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-gray-300 border-t-primary",
          sizeClasses[size],
          className
        )}
      />
    </div>
  )
}

export function LoadingSpinner({ text = "読み込み中" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{text}...</p>
    </div>
  )
}