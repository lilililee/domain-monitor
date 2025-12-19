import React from 'react'
import { AlertCircle } from 'lucide-react'

export function PermissionWarning() {
  // Use Notification.permission directly or pass as prop if needed reactive update from parent
  // Assuming parent handles the permission state update and re-renders this
  if (Notification.permission !== 'denied') return null

  return (
    <div className="bg-red-950/30 border border-red-500/50 text-red-400 p-4 mb-6 rounded backdrop-blur-sm flex items-start gap-3">
      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-bold tracking-wide mb-1">WARNING // ACCESS_DENIED</p>
        <p className="text-sm opacity-80">Notification permission blocked. System cannot push desktop alerts.</p>
      </div>
    </div>
  )
}

