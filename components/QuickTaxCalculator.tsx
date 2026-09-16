import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, X, IndianRupee, ArrowRight, CheckCircle2, Percent, ListFilter, ExternalLink } from 'lucide-react';
import { HSN_DIRECTORY } from '../data/hsnData';
import { HSNCode } from '../types';

interface QuickTaxCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickTaxCalculator: React.FC<QuickTaxCalculatorProps> = ({ isOpen, onClose }) => {
  const [baseAmount, setBaseAmount] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<HSNCode | null>(null);
  const [isInterstate, setIsInterstate] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHsn = HSN_DIRECTORY.filter(item => 
    item.code.includes(searchQuery) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const amount = parseFloat(baseAmount) || 0;
  const taxRate = selectedItem ? selectedItem.taxRate : 0;
  const taxAmount = (amount * taxRate) / 100;
  const totalAmount = amount + taxAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Calculator size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">Tax Calculator</h2>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Instant GST Estimation</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Input Section */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Base Taxable Value</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="number"
                      value={baseAmount}
                      onChange={(e) => setBaseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex justify-between">
                    <span>Transaction Nature</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setIsInterstate(false)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                        !isInterstate 
                          ? 'bg-white text-indigo-700 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Intra-state (Local)
                    </button>
                    <button
                      onClick={() => setIsInterstate(true)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                        isInterstate 
                          ? 'bg-white text-indigo-700 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Inter-state (IGST)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">HSN/SAC Code Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ListFilter size={14} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search items or codes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium"
                    />
                  </div>
                  
                  <div className="mt-2 max-h-40 overflow-y-auto border border-slate-100 rounded-xl bg-white shadow-sm custom-scrollbar">
                    {filteredHsn.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">No matching codes found</div>
                    ) : (
                      filteredHsn.map((item, idx) => {
                        const uniqueKey = item.id || `${item.code}-${item.taxRate}-${idx}`;
                        const isSelected = selectedItem ? (
                          (item.id && selectedItem.id === item.id) ||
                          (!item.id && selectedItem.code === item.code && selectedItem.taxRate === item.taxRate)
                        ) : false;

                        return (
                          <button
                            key={uniqueKey}
                            onClick={() => {
                              setSelectedItem(item);
                              setSearchQuery('');
                            }}
                            className={`w-full text-left p-3 border-b border-slate-50 last:border-0 hover:bg-indigo-50 transition-colors flex items-start gap-3 ${
                              isSelected ? 'bg-indigo-50/50' : ''
                            }`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <CheckCircle2 size={12} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-800 text-xs">{item.code}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider bg-slate-100 text-slate-500">{item.taxRate}%</span>
                              </div>
                              <span className="text-[11px] text-slate-500 line-clamp-1">{item.description}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg overflow-hidden relative">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Percent size={120} />
                </div>
                
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Tax Computation Summary</h3>
                
                <div className="space-y-3 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Taxable Value</span>
                    <span className="font-medium text-slate-200">₹{amount.toFixed(2)}</span>
                  </div>
                  
                  {isInterstate ? (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">IGST ({taxRate}%)</span>
                      <span className="font-medium text-indigo-300">₹{taxAmount.toFixed(2)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">CGST ({taxRate / 2}%)</span>
                        <span className="font-medium text-indigo-300">₹{(taxAmount / 2).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">SGST ({taxRate / 2}%)</span>
                        <span className="font-medium text-indigo-300">₹{(taxAmount / 2).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-3 border-t border-slate-700/50 flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-300">Total Invoice Value</span>
                    <span className="text-xl font-black text-white">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-2">
              <button 
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                Apply to Draft <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.hash = '/rate-calculator';
                }}
                className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                Open Full GST Rate Calculator Tool <ExternalLink size={14} />
              </button>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickTaxCalculator;
