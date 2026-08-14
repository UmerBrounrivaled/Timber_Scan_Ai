import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, FileCheck, X, AlertCircle } from 'lucide-react';

export default function UploadZone({ onImageSelected, isAnalyzing }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Image file is too large (> 15MB). Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRunAnalysis = () => {
    if (selectedFile) {
      onImageSelected(selectedFile, previewUrl);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !previewUrl && inputRef.current?.click()}
        className={`relative group rounded-2xl transition-all duration-300 ${
          previewUrl
            ? 'glass-panel p-4 border border-slate-700'
            : `border-2 border-dashed p-8 text-center cursor-pointer ${
                dragActive
                  ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                  : 'border-slate-700 hover:border-amber-500/50 bg-slate-900/40 hover:bg-slate-900/70'
              }`
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {!previewUrl ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 animate-bounce-slow" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-semibold text-white">
                Drag & drop your wood inspection image here
              </h4>
              <p className="text-xs text-slate-400">
                Supports standard high-resolution wood plank photos, cross-sections, and textures
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <ImageIcon className="w-4 h-4" />
              <span>Browse Local Files</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 font-mono">
              <span>PNG, JPG, WEBP</span>
              <span>•</span>
              <span>Auto-resized to 256×256</span>
              <span>•</span>
              <span>Max 15MB</span>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-200 truncate max-w-xs">
                  {selectedFile.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>

              <button
                onClick={handleClear}
                disabled={isAnalyzing}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Frame */}
            <div className="relative mx-auto w-full max-w-xs aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-slate-300">
                Ready for AI
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isAnalyzing
                  ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-semibold shadow-amber-500/20 active:scale-[0.99]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing through Autoencoder...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Wood for Defects</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
