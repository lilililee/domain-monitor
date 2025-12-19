import React from 'react'
import { Plus } from 'lucide-react'

export function BatchImportModal({ value, onChange, onSubmit, onCancel }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-lg border border-purple-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-8 animate-in fade-in slide-in-from-top-4 h-[344px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-purple-400 flex items-center gap-2 flex-none">
        <Plus className="w-5 h-5" />
        BATCH_DATA_INGESTION
      </h2>
      <form onSubmit={onSubmit} className="space-y-4 flex-1 flex flex-col min-h-0">
        <div className="relative flex-1">
          <textarea
            value={value}
            onChange={onChange}
            placeholder={`https://example.com/api/v1\nhttps://monitor.test/health\ngoogle.com`}
            className="w-full h-full bg-slate-950/50 border border-slate-700 rounded p-4 text-cyan-400 font-mono text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none placeholder-slate-700"
          />
          <div className="absolute top-2 right-2 text-[10px] text-slate-600 border border-slate-800 px-2 py-0.5 rounded bg-black/50">ONE URL PER LINE</div>
        </div>
        <div className="flex justify-end gap-3 flex-none">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-transparent text-slate-400 border border-slate-700 hover:border-slate-500 rounded text-xs tracking-widest"
          >
            CANCEL
          </button>
          <button type="submit" className="px-6 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/50 hover:bg-purple-600/40 rounded text-xs tracking-widest font-bold">
            INGEST_DATA
          </button>
        </div>
      </form>
    </div>
  )
}
