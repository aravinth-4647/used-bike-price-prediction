import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, Upload, FileText, CheckCircle2, 
  AlertCircle, Play, Layers, Eye, Table 
} from 'lucide-react';
import { fetchDatasets, analyzeDataset, trainModel, uploadDataset } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function DatasetInspector({ onModelRetrained }) {
  const [datasets, setDatasets] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load available datasets
  const loadDatasetsList = async () => {
    try {
      const data = await fetchDatasets();
      setDatasets(data.files || []);
      if (data.files && data.files.length > 0 && !selectedFile) {
        setSelectedFile(data.files[0].filename);
      }
    } catch (err) {
      console.error("Failed to load datasets:", err);
    }
  };

  useEffect(() => {
    loadDatasetsList();
  }, []);

  // Analyze whenever selected file changes
  useEffect(() => {
    if (!selectedFile) return;

    const runAnalysis = async () => {
      setIsLoadingAnalysis(true);
      try {
        const data = await analyzeDataset(selectedFile);
        setAnalysis(data);
      } catch (err) {
        console.error("Analysis failed:", err);
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    runAnalysis();
  }, [selectedFile]);

  // Trigger training
  const handleTrain = async () => {
    setIsTraining(true);
    setTrainStatus(null);
    try {
      const result = await trainModel(selectedFile);
      setTrainStatus({
        success: true,
        message: `Successfully trained ${result.best_model} on ${result.records_count} records with R² ${(result.metrics?.r2_score * 100).toFixed(1)}%!`,
      });
      if (onModelRetrained) onModelRetrained();
    } catch (err) {
      setTrainStatus({
        success: false,
        message: err.response?.data?.detail || 'Model training failed.',
      });
    } finally {
      setIsTraining(false);
    }
  };

  // Upload new CSV/Excel file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);
    try {
      const result = await uploadDataset(file);
      setUploadStatus({
        success: true,
        message: result.message,
      });
      await loadDatasetsList();
      setSelectedFile(file.name);
    } catch (err) {
      setUploadStatus({
        success: false,
        message: err.response?.data?.detail || 'Upload failed.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white flex items-center space-x-2">
            <Database className="w-6 h-6 text-teal-400" />
            <span>Dataset Management & Inspector</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Analyze columns, missing values, duplicates, and trigger dynamic retraining.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* File Upload Input */}
          <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-all">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>{isUploading ? 'Uploading...' : 'Upload CSV / Excel'}</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>

          {/* Train Button */}
          <button
            onClick={handleTrain}
            disabled={isTraining || !selectedFile}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-heading font-bold text-xs shadow-neon flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isTraining ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Training Models...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black text-black" />
                <span>Train / Retrain Model</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {trainStatus && (
        <div className={`p-4 rounded-2xl border flex items-center space-x-3 text-sm ${
          trainStatus.success 
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
        }`}>
          {trainStatus.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{trainStatus.message}</span>
        </div>
      )}

      {uploadStatus && (
        <div className={`p-4 rounded-2xl border flex items-center space-x-3 text-sm ${
          uploadStatus.success 
            ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300' 
            : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
        }`}>
          {uploadStatus.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* Datasets File Selector */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-teal-400" />
          <span>Available Datasets in `dataset/` Folder</span>
        </h3>
        
        {datasets.length === 0 ? (
          <p className="text-xs text-slate-500">No datasets found. Upload a .csv or .xlsx file to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {datasets.map((file) => {
              const isSelected = selectedFile === file.filename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file.filename)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-950/40 border-teal-500 text-white shadow-neon'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-mono text-xs font-bold truncate">{file.filename}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{file.size_kb} KB • {file.extension}</div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dataset Analysis Dashboard */}
      {isLoadingAnalysis ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Analyzing dataset structure...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          
          {/* High-Level Shape & Health Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">Total Rows</span>
              <div className="text-2xl font-bold font-heading text-white">{analysis.shape?.rows}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">Total Columns</span>
              <div className="text-2xl font-bold font-heading text-teal-300">{analysis.shape?.columns}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">Duplicate Rows</span>
              <div className="text-2xl font-bold font-heading text-indigo-300">{analysis.duplicate_rows}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">Target Price Column</span>
              <div className="text-lg font-bold font-heading text-amber-400 truncate">{analysis.target_column || 'None'}</div>
            </div>
          </div>

          {/* Columns & Data Types Breakdown */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 className="font-heading text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Columns & Data Types Schema</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.columns?.map((col) => {
                const dtype = analysis.data_types?.[col] || 'unknown';
                const isTarget = col === analysis.target_column;
                const isNum = analysis.numerical_columns?.includes(col);
                const missing = analysis.missing_values?.counts?.[col] || 0;

                return (
                  <div
                    key={col}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      isTarget
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : isNum
                        ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold flex items-center space-x-1.5">
                        <span>{col}</span>
                        {isTarget && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-black">
                            TARGET
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Type: <span className="font-mono text-slate-300">{dtype}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px]">
                      {missing > 0 ? (
                        <span className="text-rose-400">{missing} missing</span>
                      ) : (
                        <span className="text-emerald-400">0 nulls</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dataset Preview Table */}
          {analysis.preview && analysis.preview.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 overflow-hidden">
              <h3 className="font-heading text-base font-bold text-white mb-4 flex items-center space-x-2">
                <Table className="w-4 h-4 text-teal-400" />
                <span>Dataset Sample Preview (Top 5 Rows)</span>
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      {analysis.columns?.map((col) => (
                        <th key={col} className="px-4 py-3 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {analysis.preview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        {analysis.columns?.map((col) => (
                          <td key={col} className="px-4 py-2.5 whitespace-nowrap text-slate-200">
                            {row[col] !== undefined && row[col] !== null ? String(row[col]) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
}
