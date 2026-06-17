"use client"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center justify-between border border-[#E8503A]/20 bg-[#E8503A]/5 px-6 py-4 rounded-sm">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-[#E8503A]" />
        <span className="text-xs font-mono text-[#E8503A]">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-xs font-mono text-[#E8503A]/60 hover:text-[#E8503A] border border-[#E8503A]/20 hover:border-[#E8503A]/40 px-3 py-1.5 rounded-sm transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          RETRY
        </button>
      )}
    </div>
  )
}
