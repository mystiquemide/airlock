"use client"
import { useRouter } from "next/navigation"

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A]">
      <div className="text-xs font-mono text-[#E8503A] uppercase tracking-widest mb-4">
        SYSTEM ERROR
      </div>
      <div className="text-2xl font-bold text-white mb-2">Something went wrong.</div>
      <div className="text-xs font-mono text-white/30 mb-8 max-w-md text-center">
        {error.message || "An unexpected error occurred. The error has been logged."}
      </div>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm px-6 py-3 rounded-sm"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="border border-white/20 text-white/60 hover:text-white text-sm px-6 py-3 rounded-sm"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
