import React from 'react';
import { X, Cpu, Info, Check, Shield, Layers, HelpCircle } from 'lucide-react';

export default function DocsModal({ isOpen, onClose, threshold }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                MVTec Wood Autoencoder Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Pipeline Mechanics & Anomaly Scoring Overview
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

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Unsupervised Visual Anomaly Detection
            </h4>
            <p>
              The model is trained exclusively on defect-free normal wood textures. Because the neural network learns to compress and reconstruct only normal grain patterns, any anomaly (knots, cracks, holes, scratches) causes high reconstruction errors in anomalous pixel regions.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">How Scoring & Classification Works:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Input Preprocessing:</strong> Images are normalized to 256×256 RGB float tensors.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Mean Squared Error (MSE):</strong> Calculated as <code className="font-mono text-amber-300">mean((Input - Reconstruction)²)</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Youden's J Cutoff Threshold:</strong> Preset at <code className="font-mono text-amber-300">{threshold || '0.000637013'}</code>. Scores exceeding this cutoff trigger a defect alert.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Per-pixel Heatmap:</strong> A Jet colormap overlay highlights the localized flaw position on the plank surface.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
