import React, { useState, useRef } from 'react'
import { Zap, Upload, Download, Trash2 } from 'lucide-react'

export function SettingsModal({
  settings,
  permission,
  debugLog,
  onRequestPermission,
  onTestNotification,
  onTestDelayedNotification,
  onSaveSettings,
  onImportConfig,
  onExportConfig,
  onClearAll
}) {
  const [localInterval, setLocalInterval] = useState(settings.interval)
  const [startHour, setStartHour] = useState(settings.startHour ?? 9)
  const [endHour, setEndHour] = useState(settings.endHour ?? 20)
  const fileInputRef = useRef(null)

  const handleSave = (e) => {
    e.preventDefault()
    onSaveSettings({
      interval: localInterval,
      startHour: parseInt(startHour),
      endHour: parseInt(endHour)
    })
  }

  const handleFileChange = (e) => {
    onImportConfig(e)
  }

  const triggerImport = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-lg border border-purple-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-8 animate-in fade-in slide-in-from-top-4 h-[344px] flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-none">
        <h2 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          SYSTEM_CONFIGURATION
        </h2>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
          <button
            type="button"
            onClick={triggerImport}
            className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-600 hover:border-cyan-500 hover:text-cyan-400 transition-colors text-xs flex items-center justify-center gap-2 rounded h-7"
            title="Import Config"
          >
            <Upload className="w-3 h-3 relative -top-[1px]" /> <span className="hidden sm:inline leading-none">IMPORT</span>
          </button>
          <button
            type="button"
            onClick={onExportConfig}
            className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-600 hover:border-cyan-500 hover:text-cyan-400 transition-colors text-xs flex items-center justify-center gap-2 rounded h-7"
            title="Export Config"
          >
            <Download className="w-3 h-3 relative -top-[1px]" /> <span className="hidden sm:inline leading-none">EXPORT</span>
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="px-3 py-1 bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-900/50 hover:border-red-500 transition-colors text-xs flex items-center justify-center gap-2 rounded h-7"
            title="Purge All Data"
          >
            <Trash2 className="w-3 h-3 relative -top-[1px]" /> <span className="hidden sm:inline leading-none">PURGE</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="space-y-3 flex flex-col overflow-y-auto custom-scrollbar pr-2">
          <div className="p-3 bg-slate-950/50 rounded border border-slate-800 flex-none">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notification Subsystem</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <span
                className={`px-2 py-1 text-xs border ${
                  permission === 'granted' ? 'border-green-500 text-green-400 bg-green-950/30' : 'border-yellow-500 text-yellow-400 bg-yellow-950/30'
                }`}
              >
                STATUS: {permission === 'granted' ? 'GRANTED' : permission === 'denied' ? 'DENIED' : 'UNKNOWN'}
              </span>

              {permission !== 'granted' && (
                <button onClick={onRequestPermission} className="text-xs px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600/40 transition-colors">
                  INITIALIZE
                </button>
              )}

              <button onClick={onTestNotification} className="text-xs px-3 py-1 bg-slate-800 text-slate-300 border border-slate-600 hover:border-slate-400 transition-colors">
                TEST PING
              </button>
              <button
                onClick={onTestDelayedNotification}
                className="text-xs px-3 py-1 bg-purple-900/20 text-purple-400 border border-purple-500/30 hover:bg-purple-900/40 transition-colors"
              >
                TEST DELAY (5s)
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-3 bg-slate-950/50 rounded border border-slate-800 flex-none">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Scan Parameters</h3>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs text-cyan-600 mb-1">INTERVAL (SEC)</label>
                  <input
                    type="number"
                    min="5"
                    value={localInterval}
                    onChange={(e) => setLocalInterval(e.target.value)}
                    className="w-full bg-black/50 border border-cyan-900 text-cyan-400 px-3 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-cyan-600 mb-1">START HOUR</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      placeholder="0-23"
                      className="w-full bg-black/50 border border-cyan-900 text-cyan-400 pl-3 pr-8 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-700 pointer-events-none text-xs">:00</span>
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-cyan-600 mb-1">END HOUR</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
                      placeholder="0-24"
                      className="w-full bg-black/50 border border-cyan-900 text-cyan-400 pl-3 pr-8 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-700 pointer-events-none text-xs">:00</span>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-1.5 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-600/40 transition-colors text-sm">
                SAVE CONFIGURATION
              </button>
            </div>
          </form>
        </div>

        <div className="p-4 bg-black rounded border border-slate-800 font-mono text-xs h-full overflow-hidden flex flex-col">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">System Log</h3>
          <div className="overflow-y-auto flex-1 space-y-1 custom-scrollbar">
            {debugLog.length === 0 ? (
              <span className="text-slate-700 animate-pulse">Waiting for signals...</span>
            ) : (
              debugLog.map((log, i) => (
                <div key={i} className="text-green-500/80 border-l-2 border-green-900 pl-2 hover:bg-green-900/10">
                  <span className="opacity-50 mr-2">&gt;</span>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
