"use client"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A]">
      <div className="text-xs font-mono text-white/20 uppercase tracking-widest mb-4">
        404
      </div>
      <div className="text-5xl font-bold text-white mb-4">Page not found.</div>
      <div className="text-xs font-mono text-white/30 mb-8">
        This route does not exist or you do not have access.
      </div>
      <button
        onClick={() => router.push('/dashboard')}
        className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm px-6 py-3 rounded-sm"
      >
        Back to Dashboard
      </button>
    </div>
  )
}
