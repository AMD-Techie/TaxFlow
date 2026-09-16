import React, { useState, useMemo } from 'react';
import { 
  Calculator, Search, Percent, ArrowRight, CheckCircle2, Copy, 
  Filter, ShieldCheck, AlertCircle, IndianRupee, Layers, 
  Sparkles, RefreshCw, FileText, Check, BookOpen, Info,
  ArrowDownRight, Tag, HelpCircle, ArrowUpRight, Scale
} from 'lucide-react';
import { HSN_DIRECTORY } from '../data/hsnData';
import { HSNCode } from '../types';
import { STATUTORY_SCHEDULES } from '../services/gstEngine/taxCalculator';

export const GstRateCalculatorPage: React.FC = () => {
  // Calculator Form State
  const [selectedHsnId, setSelectedHsnId] = useState<string>('hsn-8471'); // default to 8471 Laptops (18%)
  const [customTaxRate, setCustomTaxRate] = useState<number | null>(null);
  const [calculationMode, setCalculationMode] = useState<'EXCLUSIVE' | 'INCLUSIVE'>('EXCLUSIVE');
  const [amountMode, setAmountMode] = useState<'TOTAL' | 'QTY_RATE'>('TOTAL');
  const [taxableAmount, setTaxableAmount] = useState<string>('50000');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitRate, setUnitRate] = useState<string>('50000');
  const [supplyType, setSupplyType] = useState<'INTRA' | 'INTER'>('INTRA');
  const [isUnionTerritory, setIsUnionTerritory] = useState<boolean>(false);
  const [applyCess, setApplyCess] = useState<boolean>(true);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Directory Search & Filter State
  const [directorySearch, setDirectorySearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'GOODS' | 'SERVICES' | 'RCM' | 'CESS'>('ALL');
  const [slabFilter, setSlabFilter] = useState<number | 'ALL'>('ALL');

  // Currently selected HSN record
  const selectedItem: HSNCode = useMemo(() => {
    return HSN_DIRECTORY.find(item => item.id === selectedHsnId) || HSN_DIRECTORY[0];
  }, [selectedHsnId]);

  // Effective Tax Rate
  const effectiveTaxRate = customTaxRate !== null ? customTaxRate : selectedItem.taxRate;
  const effectiveCessRate = (applyCess && selectedItem.cessRate) ? selectedItem.cessRate : 0;

  // Amount computation
  const rawInputAmount = useMemo(() => {
    if (amountMode === 'QTY_RATE') {
      const q = parseFloat(quantity) || 0;
      const r = parseFloat(unitRate) || 0;
      return q * r;
    }
    return parseFloat(taxableAmount) || 0;
  }, [amountMode, quantity, unitRate, taxableAmount]);

  // Calculation Results
  const calculationResult = useMemo(() => {
    const rate = effectiveTaxRate;
    const cess = effectiveCessRate;
    const totalTaxPct = rate + cess;

    if (calculationMode === 'EXCLUSIVE') {
      // Amount entered is Taxable / Net Amount
      const netTaxable = rawInputAmount;
      const totalTax = (netTaxable * rate) / 100;
      const cessAmount = (netTaxable * cess) / 100;
      const grossAmount = netTaxable + totalTax + cessAmount;

      const cgst = supplyType === 'INTRA' ? totalTax / 2 : 0;
      const sgstOrUtgst = supplyType === 'INTRA' ? totalTax / 2 : 0;
      const igst = supplyType === 'INTER' ? totalTax : 0;

      return {
        netTaxable,
        rate,
        cessRate: cess,
        totalTax,
        cessAmount,
        grossAmount,
        cgst,
        sgstOrUtgst,
        igst,
        cgstRate: supplyType === 'INTRA' ? rate / 2 : 0,
        sgstRate: supplyType === 'INTRA' ? rate / 2 : 0,
        igstRate: supplyType === 'INTER' ? rate : 0,
      };
    } else {
      // Inclusive Mode: Amount entered is Gross Amount (MRP)
      const grossAmount = rawInputAmount;
      const netTaxable = totalTaxPct > 0 ? (grossAmount / (1 + totalTaxPct / 100)) : grossAmount;
      const totalTax = (netTaxable * rate) / 100;
      const cessAmount = (netTaxable * cess) / 100;

      const cgst = supplyType === 'INTRA' ? totalTax / 2 : 0;
      const sgstOrUtgst = supplyType === 'INTRA' ? totalTax / 2 : 0;
      const igst = supplyType === 'INTER' ? totalTax : 0;

      return {
        netTaxable,
        rate,
        cessRate: cess,
        totalTax,
        cessAmount,
        grossAmount,
        cgst,
        sgstOrUtgst,
        igst,
        cgstRate: supplyType === 'INTRA' ? rate / 2 : 0,
        sgstRate: supplyType === 'INTRA' ? rate / 2 : 0,
        igstRate: supplyType === 'INTER' ? rate : 0,
      };
    }
  }, [rawInputAmount, effectiveTaxRate, effectiveCessRate, calculationMode, supplyType]);

  // Filtered HSN directory list
  const filteredDirectory = useMemo(() => {
    return HSN_DIRECTORY.filter(item => {
      // Category filter
      if (categoryFilter === 'GOODS' && item.category !== 'GOODS') return false;
      if (categoryFilter === 'SERVICES' && item.category !== 'SERVICES') return false;
      if (categoryFilter === 'RCM' && !item.rcmApplicable) return false;
      if (categoryFilter === 'CESS' && (!item.cessRate || item.cessRate <= 0)) return false;

      // Slab filter
      if (slabFilter !== 'ALL' && item.taxRate !== slabFilter) return false;

      // Search query
      if (directorySearch.trim()) {
        const query = directorySearch.toLowerCase();
        const matchesCode = item.code.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesChapter = item.chapter ? item.chapter.toLowerCase().includes(query) : false;
        const matchesConditions = item.conditions ? item.conditions.toLowerCase().includes(query) : false;
        return matchesCode || matchesDesc || matchesChapter || matchesConditions;
      }

      return true;
    });
  }, [categoryFilter, slabFilter, directorySearch]);

  const handleSelectHsn = (item: HSNCode) => {
    setSelectedHsnId(item.id || item.code);
    setCustomTaxRate(null);
    // Smooth scroll to calculator on mobile/desktop
    const calcElement = document.getElementById('gst-calculator-tool-box');
    if (calcElement) {
      calcElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const copyBreakdownToClipboard = () => {
    const formatted = `--- TaxFlow GST Computation Breakdown ---
HSN/SAC Code: ${selectedItem.code} (${selectedItem.category})
Description: ${selectedItem.description}
Supply Type: ${supplyType === 'INTRA' ? (isUnionTerritory ? 'Intra-State (UTGST + CGST)' : 'Intra-State (CGST + SGST)') : 'Inter-State (IGST)'}
Computation Mode: ${calculationMode === 'EXCLUSIVE' ? 'Base + GST (Exclusive)' : 'MRP / Gross (Inclusive)'}
Taxable Net Amount: ₹${calculationResult.netTaxable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
Applicable GST Rate: ${calculationResult.rate}%
${supplyType === 'INTRA' 
  ? `CGST (${calculationResult.cgstRate}%): ₹${calculationResult.cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}\n${isUnionTerritory ? 'UTGST' : 'SGST'} (${calculationResult.sgstRate}%): ₹${calculationResult.sgstOrUtgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  : `IGST (${calculationResult.igstRate}%): ₹${calculationResult.igst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}
${calculationResult.cessRate > 0 ? `Compensation Cess (${calculationResult.cessRate}%): ₹${calculationResult.cessAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}\n` : ''}Total Invoice Amount: ₹${calculationResult.grossAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
Generated via TaxFlow Enterprise GST Rate Engine`;

    navigator.clipboard.writeText(formatted);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute right-32 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
                <Calculator size={22} />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  GST Rate & HSN/SAC Calculator
                </h1>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/30">
                  Statutory 2026 Engine
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Determine statutory GST tax slabs, calculate CGST, SGST, UTGST, and IGST breakdowns, simulate inclusive/exclusive values, and look up verified HSN/SAC classifications across Goods and Services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={copyBreakdownToClipboard}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 text-white text-xs font-bold rounded-xl border border-slate-700/80 transition-all flex items-center gap-2 shadow-sm"
            >
              {copiedNotification ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-slate-300" />
                  <span>Copy Calculation</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                window.location.hash = '/invoices';
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <FileText size={16} />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Calculator & Selected HSN Details */}
      <div id="gst-calculator-tool-box" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Calculator Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h2 className="text-base font-bold text-slate-800">
                  Tax Calculation Parameters
                </h2>
              </div>
              <button
                onClick={() => {
                  setTaxableAmount('50000');
                  setCalculationMode('EXCLUSIVE');
                  setSupplyType('INTRA');
                  setIsUnionTerritory(false);
                  setCustomTaxRate(null);
                  setApplyCess(true);
                }}
                className="text-xs text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={13} />
                <span>Reset</span>
              </button>
            </div>

            {/* 1. HSN / SAC Code Selector Dropdown with Search */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={13} className="text-blue-600" />
                  Select HSN / SAC Classification
                </label>
                <span className="text-[11px] font-bold text-slate-500">
                  {selectedItem.category === 'GOODS' ? 'Goods (HSN)' : 'Services (SAC)'}
                </span>
              </div>
              
              <div className="relative">
                <select
                  value={selectedHsnId}
                  onChange={(e) => {
                    setSelectedHsnId(e.target.value);
                    setCustomTaxRate(null);
                  }}
                  className="w-full h-12 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  {HSN_DIRECTORY.map((hsn) => (
                    <option key={hsn.id || `${hsn.code}-${hsn.taxRate}`} value={hsn.id || hsn.code}>
                      [{hsn.code}] {hsn.description.slice(0, 60)}{hsn.description.length > 60 ? '...' : ''} — {hsn.taxRate}% {hsn.category}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Filter size={16} />
                </div>
              </div>
            </div>

            {/* 2. Amount Input & Calculation Mode (Inclusive vs Exclusive) */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee size={13} className="text-blue-600" />
                  Transaction Amount
                </label>

                {/* Exclusive vs Inclusive Switch */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setCalculationMode('EXCLUSIVE')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      calculationMode === 'EXCLUSIVE'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Exclusive (Base + GST)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalculationMode('INCLUSIVE')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      calculationMode === 'INCLUSIVE'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Inclusive (MRP / Total)
                  </button>
                </div>
              </div>

              {/* Amount Mode Toggle: Total or Qty x Rate */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 pb-1">
                <button
                  type="button"
                  onClick={() => setAmountMode('TOTAL')}
                  className={`px-3 py-1 rounded-lg border text-[11px] transition-all ${
                    amountMode === 'TOTAL' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Direct Total Value
                </button>
                <button
                  type="button"
                  onClick={() => setAmountMode('QTY_RATE')}
                  className={`px-3 py-1 rounded-lg border text-[11px] transition-all ${
                    amountMode === 'QTY_RATE' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Quantity × Unit Price
                </button>
              </div>

              {amountMode === 'TOTAL' ? (
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={taxableAmount}
                      onChange={(e) => setTaxableAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full h-12 pl-8 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                  
                  {/* Quick Preset Amount Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Presets:</span>
                    {['10000', '25000', '50000', '100000', '500000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTaxableAmount(preset)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all border ${
                          taxableAmount === preset 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        ₹{(parseInt(preset) / 1000)}k
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Quantity ({selectedItem.uqc || 'NOS'})
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Unit Rate (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={unitRate}
                        onChange={(e) => setUnitRate(e.target.value)}
                        className="w-full h-11 pl-7 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Tax Slabs & Rate Adjustment */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent size={13} className="text-blue-600" />
                  Statutory GST Slab
                </label>
                <span className="text-xs font-black text-blue-600 font-mono">
                  {effectiveTaxRate}% GST
                </span>
              </div>

              {/* Slabs Pill Selection */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {[0, 0.25, 3, 5, 6, 12, 18, 28].map((slab) => (
                  <button
                    key={slab}
                    type="button"
                    onClick={() => setCustomTaxRate(slab)}
                    className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border flex flex-col items-center justify-center ${
                      effectiveTaxRate === slab
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{slab}%</span>
                    <span className="text-[8px] font-medium opacity-80">
                      {slab === 0 ? 'Nil' : slab === 18 ? 'Std' : slab === 28 ? 'Max' : 'Tier'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Supply Nature: Intra-State vs Inter-State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Jurisdiction Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSupplyType('INTRA')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      supplyType === 'INTRA'
                        ? 'bg-blue-50/70 border-blue-500/80 text-blue-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-extrabold block">Intra-State</span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      {isUnionTerritory ? 'CGST + UTGST' : 'CGST + SGST'} (50:50)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSupplyType('INTER')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      supplyType === 'INTER'
                        ? 'bg-blue-50/70 border-blue-500/80 text-blue-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-extrabold block">Inter-State</span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      IGST (100% Integrated)
                    </span>
                  </button>
                </div>
              </div>

              {/* Special statutory modifiers (UTGST & Cess) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Statutory Provisions
                </label>
                <div className="space-y-2">
                  {supplyType === 'INTRA' && (
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={isUnionTerritory}
                        onChange={(e) => setIsUnionTerritory(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        Supply in Union Territory (Apply UTGST)
                      </span>
                    </label>
                  )}

                  {selectedItem.cessRate && selectedItem.cessRate > 0 ? (
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyCess}
                        onChange={(e) => setApplyCess(e.target.checked)}
                        className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs font-semibold text-amber-900">
                        Include Compensation Cess ({selectedItem.cessRate}%)
                      </span>
                    </label>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instant Computation Breakdown Result Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
                  Computation Summary
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                {calculationMode}
              </span>
            </div>

            {/* Total Gross Invoice Value Display */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Invoice Gross Value
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
                <span className="text-xl font-normal text-slate-400">₹</span>
                {calculationResult.grossAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <span className="text-xs text-slate-400 font-medium block">
                Effective Total Tax: ₹{(calculationResult.totalTax + calculationResult.cessAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({((calculationResult.rate + calculationResult.cessRate)).toFixed(1)}%)
              </span>
            </div>

            {/* Line Item Breakdown */}
            <div className="space-y-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Taxable Net Value</span>
                <span className="font-mono font-bold text-white text-sm">
                  ₹{calculationResult.netTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {supplyType === 'INTRA' ? (
                <>
                  <div className="flex items-center justify-between border-t border-slate-700/50 pt-2.5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      CGST ({calculationResult.cgstRate}%)
                    </span>
                    <span className="font-mono font-semibold text-emerald-400">
                      +₹{calculationResult.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-700/50 pt-2.5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      {isUnionTerritory ? 'UTGST' : 'SGST'} ({calculationResult.sgstRate}%)
                    </span>
                    <span className="font-mono font-semibold text-emerald-400">
                      +₹{calculationResult.sgstOrUtgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between border-t border-slate-700/50 pt-2.5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    IGST ({calculationResult.igstRate}%)
                  </span>
                  <span className="font-mono font-semibold text-emerald-400">
                    +₹{calculationResult.igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {calculationResult.cessRate > 0 && (
                <div className="flex items-center justify-between border-t border-slate-700/50 pt-2.5">
                  <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Compensation Cess ({calculationResult.cessRate}%)
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    +₹{calculationResult.cessAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Selected Classification Card Details */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-blue-400 text-sm">
                  {selectedItem.code}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                  selectedItem.category === 'GOODS' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {selectedItem.category}
                </span>
              </div>
              <p className="text-slate-300 text-xs line-clamp-2">
                {selectedItem.description}
              </p>
              {selectedItem.conditions && (
                <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-700/40">
                  Note: {selectedItem.conditions}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {selectedItem.rcmApplicable && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    RCM Applicable
                  </span>
                )}
                {selectedItem.itcEligibility && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    selectedItem.itcEligibility === 'ELIGIBLE' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : selectedItem.itcEligibility === 'INELIGIBLE'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    ITC: {selectedItem.itcEligibility}
                  </span>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={copyBreakdownToClipboard}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Copy size={15} />
                <span>Copy Summary</span>
              </button>
              <button
                onClick={() => {
                  window.location.hash = '/invoices';
                }}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
                title="Use in Invoices"
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Statutory Directory & Searchable Tariff Master */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Statutory HSN & SAC Tariff Directory
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Search by HSN/SAC code, product name, or statutory chapter to determine applicable GST slabs and compliance conditions.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Showing {filteredDirectory.length} of {HSN_DIRECTORY.length} Codes</span>
          </div>
        </div>

        {/* Directory Filters & Search Bar */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              placeholder="Search by HSN/SAC code (e.g. 8471, 9983), item name, or service category..."
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            {directorySearch && (
              <button
                onClick={() => setDirectorySearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto">
            {(['ALL', 'GOODS', 'SERVICES', 'RCM', 'CESS'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'All Codes' : cat === 'GOODS' ? 'Goods (HSN)' : cat === 'SERVICES' ? 'Services (SAC)' : cat === 'RCM' ? 'RCM' : 'Cess Items'}
              </button>
            ))}
          </div>

          {/* Slab Rate Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto">
            <span className="text-[10px] uppercase text-slate-400 px-2">Slab:</span>
            {(['ALL', 0, 3, 5, 12, 18, 28] as const).map((slab) => (
              <button
                key={slab.toString()}
                onClick={() => setSlabFilter(slab)}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs transition-all ${
                  slabFilter === slab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {slab === 'ALL' ? 'All' : `${slab}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Table / Cards */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Code & Type</th>
                  <th className="py-3 px-4">Chapter & Description</th>
                  <th className="py-3 px-3 text-center">Tax Rate</th>
                  <th className="py-3 px-3 text-center">Statutory ITC</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDirectory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <HelpCircle size={28} className="text-slate-300" />
                        <p className="font-semibold text-slate-600 text-sm">No HSN or SAC codes match your search</p>
                        <p className="text-xs text-slate-400">Try searching for generic keywords like "Computer", "Consulting", "Rice", or "Transport"</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDirectory.map((item) => {
                    const isSelected = selectedHsnId === item.id || selectedHsnId === item.code;
                    return (
                      <tr 
                        key={item.id || `${item.code}-${item.taxRate}`}
                        className={`hover:bg-blue-50/40 transition-colors ${
                          isSelected ? 'bg-blue-50/60 font-semibold' : ''
                        }`}
                      >
                        {/* Code & Type */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-xs px-2 py-1 bg-slate-100 rounded-lg text-slate-900 border border-slate-200">
                              {item.code}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              item.category === 'GOODS' 
                                ? 'bg-sky-100 text-sky-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {item.category}
                            </span>
                          </div>
                        </td>

                        {/* Description & Chapter */}
                        <td className="py-3 px-4 max-w-md">
                          <div className="space-y-1">
                            <p className="text-slate-900 font-medium leading-snug">
                              {item.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                              {item.chapter && (
                                <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                  Ch: {item.chapter}
                                </span>
                              )}
                              {item.conditions && (
                                <span className="text-slate-500 italic line-clamp-1 max-w-xs">
                                  {item.conditions}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Tax Rate & Special Flags */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                              item.taxRate === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.taxRate <= 5
                                ? 'bg-teal-100 text-teal-800'
                                : item.taxRate === 12
                                ? 'bg-blue-100 text-blue-800'
                                : item.taxRate === 18
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {item.taxRate}%
                            </span>
                            {item.cessRate && item.cessRate > 0 && (
                              <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                +{item.cessRate}% Cess
                              </span>
                            )}
                            {item.rcmApplicable && (
                              <span className="text-[9px] font-extrabold text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded">
                                RCM
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ITC Eligibility */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.itcEligibility === 'ELIGIBLE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.itcEligibility === 'INELIGIBLE'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {item.itcEligibility || 'ELIGIBLE'}
                          </span>
                        </td>

                        {/* Action: Use in Calculator */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleSelectHsn(item)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 size={13} />
                                <span>Selected</span>
                              </>
                            ) : (
                              <>
                                <Calculator size={13} />
                                <span>Calculate</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Statutory GST Slabs Reference Guide Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Scale size={22} className="text-blue-600" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Statutory GST Rate Slabs & Invoicing Rules
            </h3>
            <p className="text-xs text-slate-500">
              Official Indian GST schedules per Central Goods and Services Tax Act, 2017.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-emerald-900">0% Nil / Exempt</span>
              <span className="text-[10px] font-bold bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded">Essentials</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Fresh vegetables, unprocessed grains, milk, salt, healthcare, schooling, and zero-rated exports under LUT.
            </p>
          </div>

          <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-teal-900">5% Merit Slab</span>
              <span className="text-[10px] font-bold bg-teal-200/60 text-teal-900 px-2 py-0.5 rounded">Low Tier</span>
            </div>
            <p className="text-xs text-teal-800 leading-relaxed">
              Packaged food items, apparel & footwear up to ₹1,000, edible oils, transport by air/cab, life saving medicines.
            </p>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-blue-900">12% Standard Lower</span>
              <span className="text-[10px] font-bold bg-blue-200/60 text-blue-900 px-2 py-0.5 rounded">Pharma / Apparel</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Formulated medicaments, apparel & footwear above ₹1,000, budget hotel rooms (₹1k-₹7.5k), government construction.
            </p>
          </div>

          <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-indigo-900">18% Standard Upper</span>
              <span className="text-[10px] font-bold bg-indigo-200/60 text-indigo-900 px-2 py-0.5 rounded">Default Slab</span>
            </div>
            <p className="text-xs text-indigo-800 leading-relaxed">
              IT software, enterprise hardware, banking, telecom, professional services, industrial capital goods, office furniture.
            </p>
          </div>
        </div>

        {/* HSN Invoicing Compliance Threshold Guide */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-extrabold text-slate-800 block">
              Mandatory HSN Digit Rules on Tax Invoices:
            </span>
            <p className="text-slate-600">
              • Turnover &gt; ₹5.00 Crore: <strong>6-digit HSN / SAC</strong> is mandatory on all B2B and export invoices.<br />
              • Turnover ≤ ₹5.00 Crore: <strong>4-digit HSN</strong> mandatory on B2B invoices (optional on B2C).
            </p>
          </div>
          <button
            onClick={() => {
              window.location.hash = '/tax-forecasting';
            }}
            className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 font-bold text-slate-700 rounded-xl transition-all whitespace-nowrap shadow-xs"
          >
            Explore Tax Forecasting →
          </button>
        </div>
      </div>
    </div>
  );
};

export default GstRateCalculatorPage;
