import React from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ReportModal({ isOpen, onClose, result }) {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `inspection_report_${result.filename || 'log'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Quality Inspection Report
              </h3>
              <p className="text-xs text-slate-400">
                TimberScan AI Automated Defect Analysis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-sm">
          {/* Summary Box */}
          <div
            className={`p-4 rounded-xl border ${
              result.isDefect
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-base">
              {result.isDefect ? (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
              <span>
                Verdict: {result.isDefect ? 'DEFECT DETECTED' : 'PASSED (DEFECT-FREE)'}
              </span>
            </div>
            <p className="text-xs mt-1 text-slate-300">
              Severity classification:{' '}
              <strong className="text-white">{result.severity}</strong>
            </p>
          </div>

          {/* Table Metrics */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <tbody>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <td className="py-2.5 px-4 text-slate-400 font-medium">Image Identifier</td>
                  <td className="py-2.5 px-4 text-white font-mono">{result.filename || 'Custom Upload'}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2.5 px-4 text-slate-400 font-medium">Reconstruction MSE</td>
                  <td className="py-2.5 px-4 text-amber-300 font-mono">{Number(result.score).toFixed(8)}</td>
                </tr>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <td className="py-2.5 px-4 text-slate-400 font-medium">Youden's Cutoff Threshold</td>
                  <td className="py-2.5 px-4 text-slate-300 font-mono">{Number(result.threshold).toFixed(8)}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2.5 px-4 text-slate-400 font-medium">Ratio (MSE / Cutoff)</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-white">{result.scoreRatio.toFixed(2)}×</td>
                </tr>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <td className="py-2.5 px-4 text-slate-400 font-medium">Surface Anomaly Area</td>
                  <td className="py-2.5 px-4 text-white font-mono">{result.anomalyAreaPct}%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400 font-medium">Inference Latency</td>
                  <td className="py-2.5 px-4 text-cyan-400 font-mono">{result.inferenceTimeMs} ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
