import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Gauge,
  Scale,
  Clock,
  FileSpreadsheet,
  Share2,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultView({ result, onOpenReport }) {
  const {
    isDefect,
    score,
    threshold,
    scoreRatio,
    severity,
    anomalyAreaPct,
    inferenceTimeMs,
    filename,
    metadata,
  } = result;

  // Trigger celebration confetti for clean / defect-free wood!
  useEffect(() => {
    if (!isDefect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
    }
  }, [isDefect, filename]);

  const ratioPercentage = Math.min(100, (score / (threshold * 3)) * 100);

  return (
    <div className="space-y-4">
      {/* 1. Main Inspection Verdict Banner */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-300 ${
          isDefect
            ? 'bg-gradient-to-r from-rose-950/70 via-red-900/40 to-slate-900/90 border-rose-500/40 shadow-lg shadow-rose-950/50'
            : 'bg-gradient-to-r from-emerald-950/70 via-teal-900/40 to-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${
                isDefect
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {isDefect ? (
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-6 h-6 animate-bounce-slow" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold tracking-tight text-white">
                  {isDefect ? 'DEFECT DETECTED' : 'DEFECT FREE (PASSED)'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    isDefect
                      ? 'bg-rose-500 text-slate-950'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {severity}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isDefect
                  ? `Reconstruction error exceeds safety cutoff threshold by ${(scoreRatio).toFixed(2)}×`
                  : 'Sample matches expected normal uniform wood grain characteristics within tolerance.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenReport}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>Inspection Report</span>
          </button>
        </div>
      </div>

      {/* 2. Key Diagnostic Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: MSE Error Score */}
        <div className="glass-card p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" /> MSE Score
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Error</span>
          </div>
          <div className="text-base font-mono font-bold text-white tracking-tight">
            {Number(score).toFixed(8)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Cutoff: {Number(threshold).toFixed(8)}
          </div>
        </div>

        {/* Card 2: Anomaly Ratio */}
        <div className="glass-card p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-amber-400" /> Score / Cutoff
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Ratio</span>
          </div>
          <div
            className={`text-base font-mono font-bold tracking-tight ${
              isDefect ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {scoreRatio.toFixed(2)}×
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {scoreRatio <= 1.0 ? 'Below threshold' : 'Exceeds threshold'}
          </div>
        </div>

        {/* Card 3: Defect Area Pct */}
        <div className="glass-card p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Anomaly Area
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Pixels</span>
          </div>
          <div className="text-base font-mono font-bold text-white tracking-tight">
            {anomalyAreaPct}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            High-error surface region
          </div>
        </div>

        {/* Card 4: Model Latency */}
        <div className="glass-card p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Inference Time
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Latency</span>
          </div>
          <div className="text-base font-mono font-bold text-cyan-300 tracking-tight">
            {inferenceTimeMs} ms
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            TF Autoencoder 256×256
          </div>
        </div>
      </div>

      {/* 3. Visual Anomaly Threshold Progress Meter */}
      <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-300">Anomaly Anomaly Score Gauge</span>
          <span className="text-slate-400 font-mono text-[11px]">
            {isDefect ? 'Defect Threshold Breached' : 'Within Normal Bounds'}
          </span>
        </div>

        <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isDefect
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-sm shadow-rose-500/50'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
            }`}
            style={{ width: `${Math.max(5, ratioPercentage)}%` }}
          />
          {/* Threshold marker tick at 33.3% */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md z-10"
            style={{ left: '33.3%' }}
            title="Threshold (1.0x)"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
          <span>0.0 (Pristine)</span>
          <span className="text-amber-400 font-semibold">Cutoff (1.0×)</span>
          <span>3.0×+ (Severe Defect)</span>
        </div>
      </div>
    </div>
  );
}
