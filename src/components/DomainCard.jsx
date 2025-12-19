import React from 'react'
import { Clock, Activity, AlertCircle, RefreshCw, Power, Trash2 } from 'lucide-react'

export function DomainCard({ domain, onScan, onToggle, onRemove }) {
  return (
    <div
      className={`relative overflow-hidden group p-5 rounded border transition-all duration-300 ${
        domain.enabled === false
          ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:border-slate-600'
          : domain.status === 'up'
          ? 'bg-slate-900/60 backdrop-blur-sm border-green-500/30 shadow-[inset_0_0_20px_rgba(34,197,94,0.05)] hover:border-green-500 hover:shadow-[inset_0_0_30px_rgba(34,197,94,0.1)]'
          : domain.status === 'down'
          ? 'bg-red-950/10 backdrop-blur-sm border-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)] hover:border-red-500 hover:bg-red-950/20'
          : 'bg-slate-900/60 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-500 hover:shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]'
      }`}
    >
      {/* Decorative Status Bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          domain.enabled === false
            ? 'bg-slate-700'
            : domain.status === 'up'
            ? 'bg-green-500 shadow-[0_0_10px_#22c55e]'
            : domain.status === 'down'
            ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
            : 'bg-yellow-500'
        }`}
      ></div>

      <div className="flex justify-between items-center pl-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <a
              href={domain.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xl tracking-wide font-light transition-colors decoration-1 underline-offset-4 break-all ${
                domain.enabled === false ? 'text-slate-500 cursor-not-allowed no-underline' : 'text-cyan-50 hover:text-cyan-400 hover:underline decoration-cyan-500/50'
              }`}
            >
              {domain.url}
            </a>
            <span
              className={`px-2 py-0.5 text-[10px] border tracking-widest uppercase ${
                domain.enabled === false
                  ? 'border-slate-700 text-slate-500 bg-slate-800'
                  : domain.status === 'up'
                  ? 'border-green-500/50 text-green-400 bg-green-500/10'
                  : domain.status === 'down'
                  ? 'border-red-500/50 text-red-500 bg-red-500/10 animate-pulse'
                  : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
              }`}
            >
              {domain.enabled === false ? 'SLEEP' : domain.status === 'up' ? 'ONLINE' : domain.status === 'down' ? 'OFFLINE' : 'PENDING'}
            </span>
          </div>

          <div className={`flex items-center gap-6 text-xs ${domain.enabled === false ? 'text-slate-600' : 'text-slate-400'}`}>
            <span className="flex items-center gap-1.5" title="Last Scan">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{domain.lastChecked ? new Date(domain.lastChecked).toLocaleTimeString() : '--:--:--'}</span>
            </span>

            {domain.responseTime !== null && (
              <span className="flex items-center gap-1.5" title="Latency">
                <Activity className="w-3 h-3" />
                <span className={`font-mono ${domain.responseTime > 500 && domain.enabled !== false ? 'text-yellow-400' : ''}`}>{domain.responseTime}ms</span>
              </span>
            )}

            {domain.statusCode !== undefined && domain.statusCode !== null && (
              <span
                className={`flex items-center gap-1.5 font-mono text-[10px] px-1.5 py-0.5 rounded ${
                  domain.statusCode >= 200 && domain.statusCode < 300
                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                    : domain.statusCode === 0
                    ? 'bg-red-900/30 text-red-400 border border-red-800'
                    : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                }`}
                title="Status Code"
              >
                [{domain.statusCode === 0 ? 'ERR' : domain.statusCode}]
              </span>
            )}

            {domain.error && domain.enabled !== false && (
              <span className="text-red-400 flex items-center gap-1.5 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/50">
                <AlertCircle className="w-3 h-3" />
                {domain.error}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onScan(domain.id)}
            className={`p-3 rounded transition-all duration-300 ${
              domain.enabled === false
                ? 'text-slate-700 cursor-not-allowed'
                : 'text-cyan-600 hover:text-cyan-300 hover:bg-cyan-900/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]'
            }`}
            disabled={domain.enabled === false || domain.isScanning}
            title="Quick Scan"
          >
            <RefreshCw className={`w-5 h-5 ${domain.isScanning ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => onToggle(domain.id)}
            className={`p-3 rounded transition-all duration-300 ${
              domain.enabled === false
                ? 'text-slate-600 hover:text-green-400 hover:bg-green-900/20'
                : 'text-cyan-600 hover:text-yellow-400 hover:bg-yellow-900/20 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]'
            }`}
            title={domain.enabled === false ? 'Enable Monitor' : 'Disable Monitor'}
          >
            <Power className={`w-5 h-5 ${domain.enabled !== false ? 'drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : ''}`} />
          </button>

          <button
            onClick={() => onRemove(domain.id)}
            className="p-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Terminate Monitor"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

