import React from 'react'
import { Activity } from 'lucide-react'
import { DomainCard } from './DomainCard'

export function DomainList({ domains, hasAnyDomains, onScan, onToggle, onRemove }) {
  if (!hasAnyDomains) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
        NO_TARGETS_DETECTED
      </div>
    )
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center opacity-20">
          <span className="text-4xl">∅</span>
        </div>
        NO_MATCHING_RESULTS
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {domains.map((domain) => (
        <DomainCard
          key={domain.id}
          domain={domain}
          onScan={onScan}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

