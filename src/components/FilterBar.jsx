import React from 'react'

export function FilterBar({ filterStatus, setFilterStatus, domains }) {
  const filters = [
    { id: 'all', label: 'ALL_TARGETS', color: 'slate' },
    { id: 'up', label: 'ONLINE', color: 'green' },
    { id: 'down', label: 'OFFLINE', color: 'red' },
    { id: 'disabled', label: 'SLEEP', color: 'yellow' }
  ]

  const getCount = (id) => {
    if (id === 'all') return domains.length
    if (id === 'disabled') return domains.filter((d) => d.enabled === false).length
    return domains.filter((d) => d.enabled !== false && d.status === id).length
  }

  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      {filters.map((status) => (
        <button
          key={status.id}
          onClick={() => setFilterStatus(status.id)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider border transition-all ${
            filterStatus === status.id
              ? `bg-${status.color}-500/20 text-${status.color === 'slate' ? 'white' : status.color + '-400'} border-${status.color}-500 shadow-[0_0_10px_rgba(var(--color-${
                  status.color
                }-500),0.3)]`
              : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600'
          }`}
        >
          {status.label}
          <span className="ml-2 opacity-60">
            {getCount(status.id)}
          </span>
        </button>
      ))}
    </div>
  )
}

