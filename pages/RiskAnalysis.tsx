import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { analyzeAnomalies, fetchInvoices } from '../services/api';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowRight, 
  Loader2, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap,
  ChevronRight,
  TrendingDown,
  BarChart3,
  Scale
} from 'lucide-react';
import { AnomalyRecord, AnomalyCategory } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DrcVarianceAnalyzer } from '../components/DrcVarianceAnalyzer';

const RiskAnalysis: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId = user?.currentTenantId || 't1';
  
  const [activeTab, setActiveTab] = useState<'HEURISTIC' | 'DRC'>('DRC');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [filterCategory, setFilterCategory] = useState<AnomalyCategory | 'ALL'>('ALL');

  // Fetch invoices to analyze
  const { data: invoices } = useQuery({
    queryKey: ['invoices', tenantId],
    queryFn: () => fetchInvoices(tenantId)
  });

  const { 
    data: anomalies, 
    mutate: runAnalysis, 
    isPending: isAnalyzing 
  } = useMutation({
    mutationKey: ['analyze-anomalies', tenantId],
    mutationFn: () => {
        // Map invoices to a simpler format for the heuristic engine
        const transactions = (invoices || []).map(inv => ({
            invoiceNumber: inv.invoiceNumber,
            taxableValue: inv.amount,
            taxAmount: inv.taxAmount,
            taxRate: inv.items?.[0]?.taxRate || 18,
            partyGstin: inv.gstin
        }));
        return analyzeAnomalies(tenantId, transactions);
    }
  });

  const filteredAnomalies = (anomalies || []).filter(a => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterCategory !== 'ALL' && a.category !== filterCategory) return false;
    return true;
  });

  const stats = {
    high: (anomalies || []).filter(a => a.severity === 'HIGH').length,
    medium: (anomalies || []).filter(a => a.severity === 'MEDIUM').length,
    low: (anomalies || []).filter(a => a.severity === 'LOW').length,
    impact: (anomalies || []).reduce((sum, a) => sum + a.potentialImpact, 0)
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-100';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'LOW': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Risk Analytics</h2>
          <p className="text-slate-500 mt-1">AI-powered heuristic analysis and DRC-01B/01C variance detection</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('HEURISTIC')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'HEURISTIC' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck size={16} /> Heuristic Analysis
          </button>
          <button 
            onClick={() => setActiveTab('DRC')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'DRC' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Scale size={16} /> DRC Variance Analyzer
          </button>
        </div>
      </div>

      {activeTab === 'HEURISTIC' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Heuristic Engine Summary</h3>
            <button 
              onClick={() => runAnalysis()}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 group"
            >
              {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="group-hover:scale-110 transition-transform" />}
              {isAnalyzing ? 'Analyzing Patterns...' : 'Run Analysis Engine'}
            </button>
          </div>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle size={20} />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">High Priority</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Critical Risks</p>
          <h4 className="text-3xl font-bold text-slate-800 mt-1">{stats.high}</h4>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Info size={20} />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Action Needed</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Medium Risks</p>
          <h4 className="text-3xl font-bold text-slate-800 mt-1">{stats.medium}</h4>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ShieldCheck size={20} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Monitoring</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Low Risks</p>
          <h4 className="text-3xl font-bold text-slate-800 mt-1">{stats.low}</h4>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/10 text-white rounded-lg">
                <TrendingDown size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Est. Exposure</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Potential Impact</p>
          <h4 className="text-3xl font-bold text-white mt-1">₹{stats.impact.toLocaleString('en-IN')}</h4>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Anomaly Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search anomalies..." 
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:border-indigo-500 w-64"
                    />
                </div>
                <select 
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium text-slate-600 outline-none"
                >
                    <option value="ALL">All Severities</option>
                    <option value="HIGH">High Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="LOW">Low Risk</option>
                </select>
             </div>
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {filteredAnomalies.length} Flagged Items
             </div>
          </div>

          <div className="space-y-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Zap size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
                </div>
                <p className="text-slate-500 font-bold mt-6">Scanning transaction patterns...</p>
                <p className="text-slate-400 text-sm">Applying 8 heuristic compliance rules</p>
              </div>
            ) : filteredAnomalies.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredAnomalies.map((anomaly, idx) => (
                  <motion.div 
                    key={anomaly.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow group relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                        anomaly.severity === 'HIGH' ? 'bg-red-500' : 
                        anomaly.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    
                    <div className="flex gap-4">
                        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                            anomaly.severity === 'HIGH' ? 'bg-red-50 text-red-600' : 
                            anomaly.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h5 className="font-bold text-slate-800 flex items-center gap-2">
                                    {getCategoryLabel(anomaly.category)}
                                    {anomaly.invoiceNumber && (
                                        <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                                            {anomaly.invoiceNumber}
                                        </span>
                                    )}
                                </h5>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${getSeverityColor(anomaly.severity)}`}>
                                    {anomaly.severity}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                {anomaly.description}
                            </p>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                        <Clock size={12} />
                                        {new Date(anomaly.detectedAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                        <BarChart3 size={12} />
                                        {anomaly.confidence}% Confidence
                                    </div>
                                </div>
                                <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 group-hover:gap-2 transition-all">
                                    View Details <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation Tooltip-like Area */}
                    <div className="mt-4 bg-slate-50 rounded-lg p-3 flex items-start gap-3 border border-slate-100">
                         <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                         <div>
                            <p className="text-xs font-bold text-slate-700">AI Recommendation</p>
                            <p className="text-xs text-slate-500 mt-0.5">{anomaly.recommendation}</p>
                         </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800">No active anomalies detected</h4>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">Run the analysis engine to scan for unusual patterns in your transactions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Search size={18} className="text-slate-400" />
                Heuristic Rules
            </h5>
            <div className="space-y-3">
                {[
                    { label: 'Tax Rate Mismatch', active: true },
                    { label: 'Duplicate Pattern', active: true },
                    { label: 'Round Number Bias', active: true },
                    { label: 'GSTIN Validation', active: true },
                    { label: 'HSN/SAC Anomaly', active: false },
                    { label: 'Vendor Risk Rating', active: true },
                    { label: 'Late Filing Probability', active: true },
                ].map(rule => (
                    <div key={rule.label} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                        <span className="text-sm font-medium text-slate-600">{rule.label}</span>
                        {rule.active ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">BETA</div>
                        )}
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-bold text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors">
                Configure Rule Weights
            </button>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl text-white">
            <h5 className="font-bold mb-2 flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                Predictive Audit
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
                The engine uses historical filing data and cross-industry benchmarks to predict potential scrutiny risks.
            </p>
            <div className="mt-6 space-y-4">
                <div>
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-300">Audit Scrutiny Risk</span>
                        <span className="font-bold text-amber-400">Moderate</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[45%]"></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-300">Data Consistency</span>
                        <span className="font-bold text-emerald-400">High</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-[92%]"></div>
                    </div>
                </div>
            </div>
            <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                Download Risk Report <ArrowRight size={14} />
            </button>
          </div>

          <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
             <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                    <Info size={18} />
                </div>
                <h6 className="font-bold text-indigo-900">Compliance Tip</h6>
             </div>
             <p className="text-sm text-indigo-700/80 leading-relaxed">
                Over 60% of flagged anomalies in this FY are related to <strong>GSTIN formatting</strong> from manual data entry. Consider using the OCR Scanner to reduce errors.
             </p>
          </div>
        </div>
      </div>
        </div>
      )}

      {activeTab === 'DRC' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <DrcVarianceAnalyzer />
        </div>
      )}
    </div>
  );
};

export default RiskAnalysis;
