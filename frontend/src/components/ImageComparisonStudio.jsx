import React, { useState, useRef } from 'react';
import {
  SlidersHorizontal,
  Flame,
  Layers,
  Sparkles,
  Maximize2,
  Download,
  Eye,
  Minimize2,
} from 'lucide-react';

export default function ImageComparisonStudio({
  originalSrc,
  heatmapSrc,
  rawHeatmapSrc,
  reconstructionSrc,
  isDefect,
  filename,
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeTab, setActiveTab] = useState('split'); // 'split' | 'blend' | 'thermal' | 'reconstruction'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const handleSliderMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleDownload = () => {
    let srcToDownload = heatmapSrc;
    if (activeTab === 'thermal') srcToDownload = rawHeatmapSrc;
    else if (activeTab === 'reconstruction') srcToDownload = reconstructionSrc;
    else if (activeTab === 'original') srcToDownload = originalSrc;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${srcToDownload}`;
    link.download = `timberscan_${activeTab}_${filename || 'inspection'}.png`;
    link.click();
  };

  const originalImgData = `data:image/png;base64,${originalSrc}`;
  const blendedImgData = `data:image/png;base64,${heatmapSrc}`;
  const rawHeatmapImgData = `data:image/png;base64,${rawHeatmapSrc}`;
  const reconImgData = `data:image/png;base64,${reconstructionSrc}`;

  return (
    <div className="space-y-4">
      {/* Studio Header & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'split'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>

          <button
            onClick={() => setActiveTab('blend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'blend'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI Heatmap Overlay</span>
          </button>

          <button
            onClick={() => setActiveTab('thermal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'thermal'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Pure Thermal</span>
          </button>

          <button
            onClick={() => setActiveTab('reconstruction')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'reconstruction'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AE Reconstruction</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Download current view PNG"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition cursor-pointer"
            title="Toggle fullscreen inspect mode"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Visual Display Frame */}
      <div
        className={`relative mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all ${
          isFullscreen
            ? 'fixed inset-4 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl max-w-4xl max-h-[85vh] m-auto'
            : 'w-full max-w-lg aspect-square'
        }`}
      >
        {/* Fullscreen Close Button */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-slate-900/90 text-slate-200 hover:text-white border border-slate-700 cursor-pointer"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        )}

        {/* 1. Split Slider Mode */}
        {activeTab === 'split' && (
          <div
            ref={containerRef}
            onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e)}
            onTouchMove={handleSliderMove}
            onClick={handleSliderMove}
            className="relative w-full h-full select-none cursor-ew-resize overflow-hidden"
          >
            {/* Blended Heatmap Background (Right layer) */}
            <img
              src={blendedImgData}
              alt="AI Defect Heatmap"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Original Image Layer (Left clipped layer) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={originalImgData}
                alt="Original Wood"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
              />
            </div>

            {/* Split Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-lg shadow-amber-400/50 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-950 shadow-xl flex items-center justify-center text-slate-950">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-none">
              Original Grain
            </div>
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-amber-300 pointer-events-none">
              AI Anomaly Blend
            </div>
          </div>
        )}

        {/* 2. Blended Heatmap Full View */}
        {activeTab === 'blend' && (
          <div className="relative w-full h-full">
            <img
              src={blendedImgData}
              alt="Blended Anomaly Map"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-amber-300">
              60% Thermal / 40% Original Blend
            </div>
          </div>
        )}

        {/* 3. Pure Thermal Colormap Full View */}
        {activeTab === 'thermal' && (
          <div className="relative w-full h-full">
            <img
              src={rawHeatmapImgData}
              alt="Pure Error Colormap"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-cyan-300">
              Per-Pixel Jet Colormap
            </div>
          </div>
        )}

        {/* 4. Reconstruction Autoencoder View */}
        {activeTab === 'reconstruction' && (
          <div className="relative w-full h-full">
            <img
              src={reconImgData}
              alt="Autoencoder Reconstruction"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-slate-300">
              Autoencoder Clean Synthesis
            </div>
          </div>
        )}
      </div>

      {/* Heatmap Colorbar Legend */}
      <div className="glass-card p-3 rounded-xl flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Reconstruction Error Scale:</span>
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-mono text-[11px]">0.0 (Normal)</span>
          <div
            className="w-36 sm:w-48 h-3 rounded-full border border-slate-700 shadow-inner"
            style={{
              background: 'linear-gradient(to right, #000080, #0000ff, #00ffff, #ffff00, #ff0000, #800000)',
            }}
          />
          <span className="text-rose-400 font-mono text-[11px]">Max (Anomaly)</span>
        </div>
      </div>
    </div>
  );
}
