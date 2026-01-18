import { LoadingSpinner } from "@/components/LoadingSpinner"

export default function GettingReadyLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <LoadingSpinner />
      <p className="text-muted-foreground text-sm">Getting things ready...</p>
    </div>
  )
}
