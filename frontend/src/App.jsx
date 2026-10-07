import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import PredictionForm from './components/PredictionForm';
import PriceResultCard from './components/PriceResultCard';
import MarketInsights from './components/MarketInsights';
import DatasetInspector from './components/DatasetInspector';
import HistoryTable from './components/HistoryTable';
import Footer from './components/Footer';
import { fetchMetadata, predictPrice } from './services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [modelMeta, setModelMeta] = useState(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isHealthy, setIsHealthy] = useState(true);

  // Load Model Metadata
  const loadMetadata = async () => {
    try {
      const data = await fetchMetadata();
      setModelMeta(data);
      setIsHealthy(true);
    } catch (err) {
      console.error("Failed to load metadata:", err);
      setErrorMessage("Could not connect to ML backend. Please make sure FastAPI backend is running.");
      setIsHealthy(false);
    } finally {
      setIsLoadingMeta(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  // Handle price estimation submission
  const handlePredict = async (features) => {
    setIsPredicting(true);
    setErrorMessage(null);
    try {
      const result = await predictPrice(features);
      setPredictionResult(result);
    } catch (err) {
      console.error("Prediction failed:", err);
      setErrorMessage(err.response?.data?.detail || "Failed to calculate valuation. Please verify your inputs.");
    } finally {
      setIsPredicting(false);
    }
  };

  // Handle quick preset selection
  const handleSelectPreset = (preset) => {
    const values = {
      brand: preset.brand,
      model: preset.model,
      model_year: preset.year,
      kms_driven: preset.km,
      engine_cc: preset.cc,
      power_bhp: preset.power,
      mileage_kmpl: preset.mileage,
      fuel_type: preset.fuel,
      owner: preset.owner,
      condition: preset.condition,
    };
    setFormInitialValues(values);
    setActiveTab('predict');
    handlePredict(values);
  };

  // Handle loading past record into form
  const handleLoadRecord = (recordData) => {
    setFormInitialValues(recordData);
    setActiveTab('predict');
    handlePredict(recordData);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-teal-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        modelMeta={modelMeta}
        isHealthy={isHealthy}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-white px-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Price Estimator (Default) */}
        {activeTab === 'predict' && (
          <div>
            <HeroBanner 
              modelMeta={modelMeta} 
              onSelectPreset={handleSelectPreset} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Adaptive Specifications Form */}
              <div className="lg:col-span-7">
                <PredictionForm 
                  modelMeta={modelMeta}
                  onSubmit={handlePredict}
                  isLoading={isPredicting}
                  initialValues={formInitialValues}
                />
              </div>

              {/* Right Column: Instant Valuation Card & Key Drivers */}
              <div className="lg:col-span-5 sticky top-24">
                <PriceResultCard 
                  result={predictionResult}
                />
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Machine Learning & Market Insights */}
        {activeTab === 'insights' && (
          <MarketInsights modelMeta={modelMeta} />
        )}

        {/* Tab 3: Dataset Management & Inspector */}
        {activeTab === 'datasets' && (
          <DatasetInspector onModelRetrained={loadMetadata} />
        )}

        {/* Tab 4: Valuation History */}
        {activeTab === 'history' && (
          <HistoryTable onLoadRecord={handleLoadRecord} />
        )}

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
