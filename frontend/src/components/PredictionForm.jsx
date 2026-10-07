import React, { useState, useEffect } from 'react';
import { 
  Bike, Calendar, Gauge, Fuel, Award, MapPin, UserCheck, 
  Flame, Zap, BatteryCharging, RotateCcw, ArrowRight, Sliders, CheckCircle2 
} from 'lucide-react';

export default function PredictionForm({ modelMeta, onSubmit, isLoading, initialValues }) {
  const [formData, setFormData] = useState({});
  const [availableModels, setAvailableModels] = useState([]);

  const numMeta = modelMeta?.feature_metadata?.numerical || {};
  const catMeta = modelMeta?.feature_metadata?.categorical || {};
  const brandModelMap = modelMeta?.brand_model_mapping || {};

  // Initialize or reset form defaults based on metadata
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData(initialValues);
      if (initialValues.brand && brandModelMap[initialValues.brand]) {
        setAvailableModels(brandModelMap[initialValues.brand]);
      }
      return;
    }

    const defaultState = {};
    
    // Set default numerical values
    Object.keys(numMeta).forEach((col) => {
      defaultState[col] = numMeta[col].default ?? numMeta[col].median ?? 0;
    });

    // Set default categorical values
    Object.keys(catMeta).forEach((col) => {
      defaultState[col] = catMeta[col].default || (catMeta[col].options ? catMeta[col].options[0] : '');
    });

    setFormData(defaultState);

    // Update models if brand exists
    if (defaultState.brand && brandModelMap[defaultState.brand]) {
      setAvailableModels(brandModelMap[defaultState.brand]);
    }
  }, [modelMeta, initialValues]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // If brand changed, update cascading model choices
      if (field === 'brand') {
        const models = brandModelMap[value] || [];
        setAvailableModels(models);
        if (models.length > 0 && !models.includes(updated.model)) {
          updated.model = models[0];
        }
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    const defaultState = {};
    Object.keys(numMeta).forEach((col) => {
      defaultState[col] = numMeta[col].default ?? numMeta[col].median ?? 0;
    });
    Object.keys(catMeta).forEach((col) => {
      defaultState[col] = catMeta[col].default || (catMeta[col].options ? catMeta[col].options[0] : '');
    });
    setFormData(defaultState);
    if (defaultState.brand && brandModelMap[defaultState.brand]) {
      setAvailableModels(brandModelMap[defaultState.brand]);
    }
  };

  // Helper labels & icons
  const getFieldLabel = (key) => {
    const map = {
      brand: 'Bike Brand / Manufacturer',
      model: 'Model Name',
      model_year: 'Manufacturing Year',
      year: 'Manufacturing Year',
      kms_driven: 'Kilometers Driven (Odometer)',
      km_driven: 'Kilometers Driven',
      engine_cc: 'Engine Capacity (CC)',
      power_bhp: 'Max Power (BHP)',
      mileage_kmpl: 'Fuel Economy / Mileage (kmpl or km/charge)',
      owner: 'Ownership History',
      location: 'Registration City / Location',
      fuel_type: 'Fuel / Propulsion Type',
      condition: 'Overall Bike Condition',
    };
    return map[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const brandsList = catMeta.brand?.options || Object.keys(brandModelMap);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative">
      
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white">Bike Specifications</h2>
            <p className="text-xs text-slate-400">Configure parameters for accurate resale calculation</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Brand & Model Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Brand Dropdown */}
          {brandsList.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                <Bike className="w-3.5 h-3.5 text-teal-400" />
                <span>{getFieldLabel('brand')}</span>
              </label>
              <select
                value={formData.brand || ''}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all cursor-pointer"
              >
                {brandsList.map((brand) => (
                  <option key={brand} value={brand} className="bg-slate-900 text-white">
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Model Dropdown or Text */}
          {catMeta.model && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span>{getFieldLabel('model')}</span>
              </label>
              {availableModels.length > 0 ? (
                <select
                  value={formData.model || ''}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all cursor-pointer"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model} className="bg-slate-900 text-white">
                      {model}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.model || ''}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="e.g. Classic 350, Duke 390"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
              )}
            </div>
          )}

        </div>

        {/* Section 2: Year & Kilometers Driven Sliders / Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
          
          {/* Model Year */}
          {(numMeta.model_year || numMeta.year) && (
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>Manufacturing Year</span>
                </label>
                <span className="font-mono text-sm font-bold text-teal-300 px-2.5 py-0.5 rounded-md bg-teal-950 border border-teal-800/60">
                  {formData.model_year || formData.year || 2021}
                </span>
              </div>
              <input
                type="range"
                min={numMeta.model_year?.min || numMeta.year?.min || 2012}
                max={numMeta.model_year?.max || numMeta.year?.max || 2026}
                step="1"
                value={formData.model_year || formData.year || 2021}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (numMeta.model_year) handleChange('model_year', val);
                  else handleChange('year', val);
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>{numMeta.model_year?.min || numMeta.year?.min || 2012}</span>
                <span>{numMeta.model_year?.max || numMeta.year?.max || 2026}</span>
              </div>
            </div>
          )}

          {/* Kilometers Driven */}
          {(numMeta.kms_driven || numMeta.km_driven) && (
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Kilometers Driven</span>
                </label>
                <span className="font-mono text-sm font-bold text-indigo-300 px-2.5 py-0.5 rounded-md bg-indigo-950 border border-indigo-800/60">
                  {new Intl.NumberFormat('en-IN').format(formData.kms_driven || formData.km_driven || 15000)} km
                </span>
              </div>
              <input
                type="range"
                min="500"
                max={numMeta.kms_driven?.max || numMeta.km_driven?.max || 100000}
                step="500"
                value={formData.kms_driven || formData.km_driven || 15000}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (numMeta.kms_driven) handleChange('kms_driven', val);
                  else handleChange('km_driven', val);
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>500 km</span>
                <span>{new Intl.NumberFormat('en-IN').format(numMeta.kms_driven?.max || numMeta.km_driven?.max || 100000)} km</span>
              </div>
            </div>
          )}

        </div>

        {/* Section 3: Performance & Engine Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Engine CC */}
          {numMeta.engine_cc && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Engine CC</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="2500"
                  value={formData.engine_cc !== undefined ? formData.engine_cc : 350}
                  onChange={(e) => handleChange('engine_cc', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">cc (0 if EV)</span>
              </div>
            </div>
          )}

          {/* Power BHP */}
          {numMeta.power_bhp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Power (BHP)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="250"
                  value={formData.power_bhp !== undefined ? formData.power_bhp : 20}
                  onChange={(e) => handleChange('power_bhp', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">BHP</span>
              </div>
            </div>
          )}

          {/* Mileage */}
          {numMeta.mileage_kmpl && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mileage</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  max="200"
                  value={formData.mileage_kmpl !== undefined ? formData.mileage_kmpl : 35}
                  onChange={(e) => handleChange('mileage_kmpl', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">kmpl</span>
              </div>
            </div>
          )}

        </div>

        {/* Section 4: Categorical Attributes (Owner, Location, Fuel, Condition) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          
          {/* Owner */}
          {catMeta.owner && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{getFieldLabel('owner')}</span>
              </label>
              <select
                value={formData.owner || ''}
                onChange={(e) => handleChange('owner', e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                {catMeta.owner.options?.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Location */}
          {catMeta.location && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{getFieldLabel('location')}</span>
              </label>
              <select
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                {catMeta.location.options?.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fuel Type */}
          {catMeta.fuel_type && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-teal-400" />
                <span>{getFieldLabel('fuel_type')}</span>
              </label>
              <select
                value={formData.fuel_type || ''}
                onChange={(e) => handleChange('fuel_type', e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                {catMeta.fuel_type.options?.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Condition */}
          {catMeta.condition && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{getFieldLabel('condition')}</span>
              </label>
              <select
                value={formData.condition || ''}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                {catMeta.condition.options?.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>

        {/* Dynamic catch-all for any other columns in uploaded datasets */}
        {Object.keys(catMeta)
          .filter((k) => !['brand', 'model', 'owner', 'location', 'fuel_type', 'condition'].includes(k))
          .map((col) => (
            <div key={col} className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {getFieldLabel(col)}
              </label>
              <select
                value={formData[col] || ''}
                onChange={(e) => handleChange(col, e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                {catMeta[col].options?.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
        ))}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:via-cyan-400 hover:to-indigo-500 text-white font-heading font-bold text-base shadow-neon hover:shadow-cyan-500/40 transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Computing Real-Time Market Valuation...</span>
              </>
            ) : (
              <>
                <span>Calculate Estimated Resale Price</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
