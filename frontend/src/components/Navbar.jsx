import React from 'react';
import { Bike, Gauge, BarChart3, Database, History, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, modelMeta, isHealthy }) {
  const navItems = [
    { id: 'predict', label: 'Price Estimator', icon: Gauge },
    { id: 'insights', label: 'ML Market Insights', icon: BarChart3 },
    { id: 'datasets', label: 'Dataset & Training', icon: Database },
    { id: 'history', label: 'Valuation History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('predict')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-600 p-[1.5px] shadow-neon">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Bike className="w-6 h-6 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Moto<span className="text-gradient">Valuate</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  ML v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Used Bike Resale Price Prediction System
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Model Status Indicator */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-xs text-slate-300 font-medium">
                {modelMeta?.best_model || 'Random Forest'}
              </span>
            </div>
            {modelMeta?.metrics?.r2_score && (
              <span className="text-[11px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full font-mono border border-teal-800/50">
                R² {Math.round(modelMeta.metrics.r2_score * 100)}%
              </span>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
