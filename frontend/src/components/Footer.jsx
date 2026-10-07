import React from 'react';
import { Bike, ShieldCheck, Cpu, Code2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#070a12] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-white text-sm">
                Moto<span className="text-gradient">Valuate</span> ML Engine
              </span>
              <p className="text-[11px] text-slate-500">
                Lightweight Used Bike Price Prediction & Resale Analytics
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>Scikit-Learn Regression</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>PostgreSQL / Neon Ready</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>FastAPI & React Vite</span>
            </span>
          </div>

          <div className="text-slate-400 text-center md:text-right">
            <span>Production ML System &bull; &lt;500MB Footprint</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
