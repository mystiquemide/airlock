"use client"
import { Inbox } from "lucide-react"

interface EmptyStateProps {
  message: string
  subMessage?: string
}

export default function EmptyState({ message, subMessage }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="w-8 h-8 text-white/10 mb-4" />
      <div className="text-xs font-mono text-white/20 uppercase tracking-widest">{message}</div>
      {subMessage && (
        <div className="text-xs font-mono text-white/10 mt-2">{subMessage}</div>
      )}
    </div>
  )
}
