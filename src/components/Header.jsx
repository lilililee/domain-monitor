import React from 'react'
import { Activity, Upload, Settings, RefreshCw, Plus } from 'lucide-react'

export function Header({ loading, showBatchImport, onToggleBatchImport, showSettings, onToggleSettings, manualScan }) {
  return (
    <header className="flex justify-between items-center mb-10 border-b border-cyan-900/50 pb-6">
      <h1 className="text-3xl font-bold flex items-center gap-3 tracking-wider">
        <div className="relative">
          <Activity className={`w-8 h-8 text-cyan-400 ${loading ? 'animate-pulse' : ''}`} />
          <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-40 animate-pulse"></div>
        </div>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">DOMAIN_MONITOR</span>
      </h1>
      <div className="flex gap-3">
        <button
          onClick={onToggleBatchImport}
          className={`flex items-center gap-2 px-5 py-2 border rounded transition-all duration-300 ${
            showBatchImport
              ? 'bg-purple-900/40 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-300 hover:text-cyan-300 hover:border-cyan-700 hover:bg-indigo-900/50'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="tracking-widest text-sm pt-[2px]">ADD_TARGET</span>
        </button>
        <button
          onClick={onToggleSettings}
          className={`flex items-center gap-2 px-5 py-2 border rounded transition-all duration-300 ${
            showSettings
              ? 'bg-purple-900/40 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-300 hover:text-cyan-300 hover:border-cyan-700 hover:bg-indigo-900/50'
          }`}
        >
          <Settings className={`w-4 h-4 ${showSettings ? 'animate-spin-slow' : ''}`} />
          <span className="tracking-widest text-sm pt-[2px]">CONFIG</span>
        </button>
        <button
          onClick={manualScan}
          className="group relative flex items-center gap-2 px-5 py-2 bg-cyan-950/40 text-cyan-400 border border-cyan-500/50 rounded hover:bg-cyan-500/20 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="tracking-widest text-sm pt-[2px]">SCAN_NOW</span>
        </button>
      </div>
    </header>
  )
}
