import React, { useState, useEffect } from 'react';
import { 
  History, Trash2, Download, Search, RefreshCw, 
  ExternalLink, Calendar, Gauge, Award, ArrowUpRight 
} from 'lucide-react';
import { fetchHistory, deleteHistoryItem, clearAllHistory } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function HistoryTable({ onLoadRecord }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterBrand, setFilterBrand] = useState('');

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await fetchHistory(50, 0, filterBrand || null);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [filterBrand]);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all prediction history?")) return;
    try {
      await clearAllHistory();
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ["ID", "Bike Name", "Brand", "Model", "Year", "Kms Driven", "Predicted Price", "Model Used", "Date"];
    const rows = history.map((h) => [
      h.id,
      `"${h.bike_name || ''}"`,
      `"${h.brand || ''}"`,
      `"${h.model || ''}"`,
      h.model_year || '',
      h.kms_driven || '',
      h.predicted_price || '',
      `"${h.model_used || ''}"`,
      `"${h.created_at || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bike_predictions_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white flex items-center space-x-2">
            <History className="w-6 h-6 text-teal-400" />
            <span>Valuation Logs & Prediction History</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Browse, export, and reload past bike valuations stored in database.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={history.length === 0}
            className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Filter by brand (e.g. Yamaha, Royal Enfield, KTM)..."
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        {filterBrand && (
          <button
            onClick={() => setFilterBrand('')}
            className="text-xs text-slate-400 hover:text-white px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading valuation logs...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16">
            <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="font-heading text-base font-bold text-slate-300">No Valuations Logged Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Run your first bike valuation in the Estimator tab to see logged predictions here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Bike Specification</th>
                  <th className="px-4 py-3.5">Year / Odometer</th>
                  <th className="px-4 py-3.5">Predicted Price</th>
                  <th className="px-4 py-3.5">Valuation Range</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-white text-sm">
                        {item.bike_name || `${item.brand || ''} ${item.model || ''}`.trim() || 'Used Bike'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Brand: <span className="text-slate-300">{item.brand || '—'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                      <div>{item.model_year || '—'}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.kms_driven ? `${item.kms_driven.toLocaleString()} km` : '—'}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-teal-300 text-sm">
                        {formatCurrency(item.predicted_price)}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {item.price_range_low && item.price_range_high
                        ? `${formatCurrency(item.price_range_low)} – ${formatCurrency(item.price_range_high)}`
                        : '—'}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                      {item.input_data && (
                        <button
                          onClick={() => onLoadRecord(item.input_data)}
                          title="Load into prediction form"
                          className="px-2.5 py-1 rounded-lg bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border border-teal-800/50 text-[11px] font-semibold inline-flex items-center space-x-1"
                        >
                          <span>Load</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete log"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition-colors inline-flex"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
