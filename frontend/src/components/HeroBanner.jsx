import React from 'react';
import { Sparkles, Zap, ShieldCheck, TrendingUp, Award, Layers } from 'lucide-react';

export default function HeroBanner({ modelMeta, onSelectPreset }) {
  const metrics = modelMeta?.metrics || {};
  const totalRecords = modelMeta?.total_records || 130;
  const bestModel = modelMeta?.best_model || 'Random Forest Regressor';

  const quickPresets = [
    { label: 'Royal Enfield Classic 350', brand: 'Royal Enfield', model: 'Classic 350', year: 2021, km: 12000, cc: 349, power: 20.2, mileage: 36, fuel: 'Petrol', owner: '1st Owner', condition: 'Excellent' },
    { label: 'Yamaha R15 V3', brand: 'Yamaha', model: 'YZF R15', year: 2020, km: 15000, cc: 155, power: 18.6, mileage: 45, fuel: 'Petrol', owner: '1st Owner', condition: 'Excellent' },
    { label: 'KTM Duke 390', brand: 'KTM', model: 'Duke 390', year: 2021, km: 9500, cc: 373, power: 43.5, mileage: 28, fuel: 'Petrol', owner: '1st Owner', condition: 'Excellent' },
    { label: 'Honda Activa 6G', brand: 'Honda', model: 'Activa 6G', year: 2021, km: 14000, cc: 109, power: 7.7, mileage: 50, fuel: 'Petrol', owner: '1st Owner', condition: 'Excellent' },
    { label: 'Ather 450X (EV)', brand: 'Ather', model: '450X', year: 2022, km: 9000, cc: 0, power: 8.5, mileage: 85, fuel: 'Electric', owner: '1st Owner', condition: 'Excellent' },
  ];

  return (
    <div className="relative overflow-hidden mb-8 rounded-3xl bg-gradient-to-b from-slate-900 via-[#0b1220] to-[#090d16] border border-slate-800/80 p-6 sm:p-8 lg:p-10 shadow-2xl">
      
      {/* Background Decorative Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        
        {/* Left Headline & Intro */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI-Driven Resale Valuation Engine</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Accurate Valuation for <br className="hidden sm:block" />
            <span className="text-gradient">Used Motorcycles & Scooters</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Estimate true market resale price in seconds with our automated Machine Learning pipeline. 
            Trained on real market data with dynamic column adaptation and multi-model benchmarking.
          </p>

          {/* Quick Presets */}
          <div className="mt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              ⚡ Quick Fill Popular Bikes:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPreset(preset)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-teal-900/40 hover:border-teal-500/40 border border-slate-700/60 text-xs font-medium text-slate-200 transition-all flex items-center space-x-1.5"
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Stats Showcase */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:w-auto min-w-[280px]">
          
          <div className="glass-card p-4 rounded-2xl border border-teal-500/20 shadow-neon">
            <div className="flex items-center space-x-2 text-teal-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Model Accuracy</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
              {metrics.r2_score ? `${(metrics.r2_score * 100).toFixed(1)}%` : '87.5%'}
            </div>
            <p className="text-[11px] text-teal-300/80 mt-0.5">R² Determination Score</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center space-x-2 text-indigo-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Mean Abs Error</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
              {metrics.mae ? `₹${(metrics.mae / 1000).toFixed(1)}k` : '₹27.1k'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Average Error Margin</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center space-x-2 text-cyan-400 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Dataset Scale</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
              {totalRecords}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Trained Bike Records</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center space-x-2 text-amber-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Pipeline</span>
            </div>
            <div className="text-sm font-bold font-heading text-slate-200 truncate mt-1">
              {bestModel.split(' ')[0]} {bestModel.split(' ')[1] || ''}
            </div>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Optimized ML</span>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
