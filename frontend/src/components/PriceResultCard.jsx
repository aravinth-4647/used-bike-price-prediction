import React, { useState } from 'react';
import { 
  CheckCircle2, Sparkles, TrendingDown, Gauge, ShieldAlert, 
  Share2, Copy, Bookmark, Check, Info, Award, Calendar, HelpCircle 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function PriceResultCard({ result, onSave }) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 text-center flex flex-col items-center justify-center min-h-[420px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-slate-500">
          <Gauge className="w-8 h-8" />
        </div>
        <h3 className="font-heading text-lg font-bold text-slate-300">Ready for Valuation</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
          Configure the bike parameters on the left and click calculate to generate an instant ML-backed price estimate.
        </p>
      </div>
    );
  }

  const { predicted_price, price_range, confidence_score, model_used, insights, input_features_used } = result;

  const handleCopy = () => {
    const text = `Used Bike Valuation: ${formatCurrency(predicted_price)} (${price_range?.formatted}) | Model: ${model_used}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const healthScore = insights?.resale_health_score || 75;

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-teal-500/30 shadow-neon relative overflow-hidden">
      
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Estimated Market Valuation</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            title="Copy Valuation"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center space-x-1"
          >
            {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Price Display */}
      <div className="py-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
          Fair Resale Price
        </span>
        <div className="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tight text-gradient">
          {formatCurrency(predicted_price)}
        </div>
        
        {/* Confidence Interval / Price Band */}
        <div className="mt-3 inline-flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300">
          <span className="text-slate-400">Expected Range:</span>
          <span className="font-bold text-white font-mono">{price_range?.formatted}</span>
        </div>
      </div>

      {/* Insight Badges & Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 pb-4">
        
        {/* Resale Health Score */}
        <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
            Resale Demand
          </span>
          <div className="flex items-center space-x-2">
            <div className="font-bold text-sm text-teal-300">
              {insights?.market_demand || 'High Demand'}
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full rounded-full transition-all duration-700" 
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* Depreciation Rate */}
        <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
            Depreciation
          </span>
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-sm">
            <TrendingDown className="w-4 h-4" />
            <span>~{insights?.estimated_depreciation_percentage || 25}%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Over {insights?.bike_age_years || 2} Years Age
          </span>
        </div>

        {/* Model Confidence */}
        <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
            ML Confidence
          </span>
          <div className="font-bold text-sm text-indigo-300 font-mono">
            {confidence_score}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block truncate">
            via {model_used.split(' ')[0]}
          </span>
        </div>

      </div>

      {/* Summary Valuation Factors */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 mt-2">
        <h4 className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Valuation Key Drivers</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
            <span>Power & Engine:</span>
            <span className="text-slate-200 font-medium">{input_features_used?.power_bhp || 0} BHP / {input_features_used?.engine_cc || 0} CC</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
            <span>Mileage & Odo:</span>
            <span className="text-slate-200 font-medium">{input_features_used?.kms_driven ? `${input_features_used.kms_driven.toLocaleString()} km` : 'Standard'}</span>
          </div>
          <div className="flex justify-between py-1 text-slate-400">
            <span>Condition / Owner:</span>
            <span className="text-slate-200 font-medium">{input_features_used?.condition || 'Good'} • {input_features_used?.owner || '1st'}</span>
          </div>
          <div className="flex justify-between py-1 text-slate-400">
            <span>Fuel / City:</span>
            <span className="text-slate-200 font-medium">{input_features_used?.fuel_type || 'Petrol'} • {input_features_used?.location || 'General'}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
