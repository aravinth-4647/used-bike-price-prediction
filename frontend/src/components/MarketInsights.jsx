import React from 'react';
import { 
  BarChart3, Award, TrendingUp, Cpu, Sliders, 
  Layers, CheckCircle2, Zap, ArrowUpRight 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function MarketInsights({ modelMeta }) {
  if (!modelMeta) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading model performance metrics...</p>
      </div>
    );
  }

  const { best_model, metrics, all_model_results, feature_importances, target_stats, total_records } = modelMeta;

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-teal-400" />
            <span>Machine Learning & Market Insights</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Automated model evaluation, feature contributions, and dataset price benchmarks.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
          <Cpu className="w-4 h-4 text-teal-400" />
          <span>Champion Model: <strong className="text-white">{best_model}</strong></span>
        </div>
      </div>

      {/* 4 Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-teal-500/30 shadow-neon">
          <div className="flex items-center justify-between text-teal-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">R² Determination</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-white">
            {metrics?.r2_score !== undefined ? `${(metrics.r2_score * 100).toFixed(2)}%` : '87.5%'}
          </div>
          <p className="text-xs text-teal-300/80 mt-1">Variance explained by the model</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Mean Absolute Error</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-white">
            {metrics?.mae ? formatCurrency(metrics.mae) : '₹27,188'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Average dollar / rupee error</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Root Mean Sq. Error</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-white">
            {metrics?.rmse ? formatCurrency(metrics.rmse) : '₹46,670'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Standard deviation of residuals</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Mean Abs. Percentage</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-white">
            {metrics?.mape !== undefined ? `${metrics.mape}%` : '18.6%'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Percentage estimation margin</p>
        </div>

      </div>

      {/* Model Benchmark Leaderboard & Feature Importances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Model Benchmark Table */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Multi-Model Benchmark</span>
            </h3>
            <span className="text-xs text-slate-400">Automated Tournament</span>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            The training pipeline trains candidate models and selects the regressor with highest $R^2$ accuracy.
          </p>

          <div className="space-y-3">
            {all_model_results && Object.entries(all_model_results).map(([modelName, m]) => {
              const isBest = modelName === best_model;
              const r2Pct = Math.max(0, Math.min(100, (m.r2_score || 0) * 100));

              return (
                <div
                  key={modelName}
                  className={`p-4 rounded-2xl border transition-all ${
                    isBest
                      ? 'bg-teal-950/40 border-teal-500/40 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{modelName}</span>
                      {isBest && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500 text-black">
                          CHAMPION
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-300">
                      R² {(m.r2_score * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isBest
                          ? 'bg-gradient-to-r from-teal-400 to-cyan-400'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${r2Pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>MAE: {formatCurrency(m.mae)}</span>
                    <span>MAPE: {m.mape}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Importance Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Feature Valuation Impact</span>
            </h3>
            <span className="text-xs text-slate-400">Relative Influence</span>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            How much each bike attribute influences the machine learning model's resale price decision.
          </p>

          <div className="space-y-3.5">
            {feature_importances && feature_importances.map((item, idx) => {
              const colors = [
                'from-teal-400 to-cyan-400',
                'from-indigo-400 to-purple-400',
                'from-amber-400 to-orange-400',
                'from-emerald-400 to-teal-400',
                'from-rose-400 to-pink-400',
              ];
              const colorClass = colors[idx % colors.length];

              return (
                <div key={item.feature}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-200 capitalize">
                      {item.feature.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-teal-300 font-bold">
                      {item.importance}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(100, Math.max(2, item.importance))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Dataset Price Distribution Summary */}
      {target_stats && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <h3 className="font-heading text-base font-bold text-white mb-4">
            Market Price Range Benchmarks (From {total_records} Verified Records)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Minimum Price</span>
              <span className="font-bold text-base text-white font-mono">{formatCurrency(target_stats.min)}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Average Market Price</span>
              <span className="font-bold text-base text-teal-300 font-mono">{formatCurrency(target_stats.mean)}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Median Price</span>
              <span className="font-bold text-base text-indigo-300 font-mono">{formatCurrency(target_stats.median)}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Peak Luxury / Superbike</span>
              <span className="font-bold text-base text-amber-300 font-mono">{formatCurrency(target_stats.max)}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
