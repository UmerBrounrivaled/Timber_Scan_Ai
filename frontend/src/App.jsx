import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  FileCheck,
  AlertCircle,
  Eye,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from 'lucide-react';

import Header from './components/Header';
import UploadZone from './components/UploadZone';
import SamplePicker from './components/SamplePicker';
import ResultView from './components/ResultView';
import ImageComparisonStudio from './components/ImageComparisonStudio';
import ReportModal from './components/ReportModal';
import DocsModal from './components/DocsModal';

import {
  fetchHealth,
  fetchSamples,
  predictSample,
  predictUpload,
} from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'samples'
  const [isOnline, setIsOnline] = useState(false);
  const [threshold, setThreshold] = useState(0.000637013);
  const [samples, setSamples] = useState([]);
  const [activeSampleFilename, setActiveSampleFilename] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Initialize server connection & fetch samples with auto-retry for cold-starting services
  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    async function checkHealthAndSamples() {
      try {
        const health = await fetchHealth();
        if (health && isMounted) {
          setIsOnline(true);
          if (health.threshold) setThreshold(health.threshold);

          // Once connected, fetch benchmark samples if not loaded yet
          const sampleData = await fetchSamples();
          if (sampleData && sampleData.samples && isMounted) {
            setSamples(sampleData.samples);
          }
          return true;
        } else if (isMounted) {
          setIsOnline(false);
        }
      } catch (err) {
        if (isMounted) setIsOnline(false);
      }
      return false;
    }

    // Initial connection attempt
    checkHealthAndSamples();

    // Poll every 3 seconds if offline (retry waking server), or every 30 seconds if online
    const interval = setInterval(async () => {
      const connected = await checkHealthAndSamples();
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle user file upload analysis
  const handleUploadAnalysis = async (file) => {
    setIsAnalyzing(true);
    setError(null);
    setActiveSampleFilename(null);

    try {
      const data = await predictUpload(file);
      setResult(data);
      setIsOnline(true);
    } catch (err) {
      setError(err.message || 'Failed to process image inference.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle sample selection & inference
  const handleSelectSample = async (sample) => {
    setIsAnalyzing(true);
    setError(null);
    setActiveSampleFilename(sample.filename);

    try {
      const data = await predictSample(sample.filename);
      setResult(data);
      setIsOnline(true);
    } catch (err) {
      setError(err.message || 'Failed to process sample inference.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setActiveSampleFilename(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
      {/* Top Navigation */}
      <Header
        isOnline={isOnline}
        threshold={threshold}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Industrial Quality Control & Defect Localization</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-white">
            Automated <span className="gradient-text-amber">Wood Defect</span> Visual Inspection
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Upload your own wood plank imagery or choose from calibrated benchmark samples to detect, classify, and localize knots, cracks, holes, and abrasions in real-time.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Inspection Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Selection (Upload or Samples) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Input Mode Switcher Tabs */}
            <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-2 border border-slate-800">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Custom Image</span>
              </button>

              <button
                onClick={() => setActiveTab('samples')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'samples'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Choose From Samples ({samples.length})</span>
              </button>
            </div>

            {/* Input Panels */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
              {activeTab === 'upload' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Inspect Custom Wood Image
                    </h3>
                    {result && (
                      <button
                        onClick={handleReset}
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                  <UploadZone
                    onImageSelected={handleUploadAnalysis}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Benchmark Sample Library
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Click any sample below for one-touch AI inference
                      </p>
                    </div>
                    {result && (
                      <button
                        onClick={handleReset}
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                  <SamplePicker
                    samples={samples}
                    onSelectSample={handleSelectSample}
                    activeSampleFilename={activeSampleFilename}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Results Studio */}
          <div className="lg:col-span-7 space-y-6">
            {result ? (
              <div className="space-y-6">
                {/* 1. Results Metrics Banner */}
                <ResultView
                  result={result}
                  onOpenReport={() => setIsReportOpen(true)}
                />

                {/* 2. Visual Comparison Studio (Split Slider / Heatmap / Recon) */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                  <ImageComparisonStudio
                    originalSrc={result.originalImage}
                    heatmapSrc={result.heatmap}
                    rawHeatmapSrc={result.rawHeatmap}
                    reconstructionSrc={result.reconstruction}
                    isDefect={result.isDefect}
                    filename={result.filename}
                  />
                </div>
              </div>
            ) : (
              /* Empty / Placeholder State */
              <div className="glass-panel p-12 rounded-2xl border border-slate-800/80 text-center flex flex-col items-center justify-center space-y-4 min-h-[420px]">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shadow-inner">
                  <Eye className="w-10 h-10" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-semibold text-white">
                    Awaiting Image Input
                  </h3>
                  <p className="text-xs text-slate-400">
                    Upload a custom wood photo or select a sample image from the left library to view reconstruction heatmaps and defect analysis.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        result={result}
      />

      <DocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        threshold={threshold}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TimberScan AI • MVTec Wood Anomaly Detection System</span>
          <span className="font-mono text-[11px] text-slate-600">
            Powered by Keras Autoencoder & FastAPI
          </span>
        </div>
      </footer>
    </div>
  );
}
