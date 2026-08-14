import React from 'react';
import { Layers, Activity, Cpu, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

export default function Header({ isOnline, threshold, onOpenDocs }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                TimberScan <span className="gradient-text-amber">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                MVTec Model
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Deep Learning Autoencoder Anomaly Detection
            </p>
          </div>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center gap-3">
          {/* Server Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-300 hidden md:inline">
              {isOnline ? 'Model Server Ready' : 'Server Connecting...'}
            </span>
          </div>

          {/* Threshold Badge */}
          {threshold && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Cutoff: {Number(threshold).toFixed(6)}</span>
            </div>
          )}

          {/* Docs / Diagnostic info button */}
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700/60 transition cursor-pointer"
            title="Model Architecture & Info"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Model Info</span>
          </button>
        </div>
      </div>
    </header>
  );
}
