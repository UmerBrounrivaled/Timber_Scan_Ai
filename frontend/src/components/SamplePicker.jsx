import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Layers, Filter } from 'lucide-react';
import { getSampleFileUrl } from '../api/client';

export default function SamplePicker({ samples, onSelectSample, activeSampleFilename, isAnalyzing }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Normal / Good', 'Knot', 'Crack', 'Hole', 'Scratch', 'Discoloration'];

  const filteredSamples = samples.filter((sample) => {
    if (selectedCategory === 'All') return true;
    return sample.category === selectedCategory;
  });

  return (
    <div className="space-y-4">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of sample cards */}
      {filteredSamples.length === 0 ? (
        <div className="p-8 text-center glass-card rounded-xl text-slate-400 text-sm">
          No sample images found for category "{selectedCategory}".
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredSamples.map((sample) => {
            const isSelected = activeSampleFilename === sample.filename;
            const isDefectType = sample.expected === 'Defective';

            return (
              <div
                key={sample.filename}
                onClick={() => !isAnalyzing && onSelectSample(sample)}
                className={`group relative rounded-xl overflow-hidden glass-card transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-700 hover:scale-[1.01]'
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                  <img
                    src={getSampleFileUrl(sample.filename)}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback relative url
                      e.target.src = `/samples/files/${sample.filename}`;
                    }}
                  />

                  {/* Gradient Overlay for labels */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Expected Tag Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold backdrop-blur-md ${
                        isDefectType
                          ? 'bg-rose-500/80 text-rose-100 border border-rose-400/30'
                          : 'bg-emerald-500/80 text-emerald-100 border border-emerald-400/30'
                      }`}
                    >
                      {isDefectType ? (
                        <AlertTriangle className="w-2.5 h-2.5" />
                      ) : (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      )}
                      {sample.category}
                    </span>
                  </div>

                  {/* Active selection pulse */}
                  {isSelected && isAnalyzing && (
                    <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-xs flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Details Footer */}
                <div className="p-2.5">
                  <h5 className="text-xs font-semibold text-slate-200 truncate">
                    {sample.name}
                  </h5>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {sample.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
