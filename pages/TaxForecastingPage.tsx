import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  Download,
  Sliders,
  Info,
  Banknote,
  Percent,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Legend
} from 'recharts';

const mockForecastData = [
  { month: 'Apr 2026', actualOutflow: 420000, projectedOutflow: 410000, projectedLiability: 850000, projectedItc: 440000, actualLiability: 860000, actualItc: 440000 },
  { month: 'May 2026', actualOutflow: 450000, projectedOutflow: 430000, projectedLiability: 880000, projectedItc: 450000, actualLiability: 910000, actualItc: 460000 },
  { month: 'Jun 2026', actualOutflow: 480000, projectedOutflow: 460000, projectedLiability: 920000, projectedItc: 460000, actualLiability: 950000, actualItc: 470000 },
  { month: 'Jul 2026', actualOutflow: 510000, projectedOutflow: 500000, projectedLiability: 950000, projectedItc: 450000, actualLiability: 970000, actualItc: 460000 },
  { month: 'Aug 2026', actualOutflow: 490000, projectedOutflow: 520000, projectedLiability: 1000000, projectedItc: 480000, actualLiability: 980000, actualItc: 490000 },
  { month: 'Sep 2026', projectedOutflow: 540000, projectedLiability: 1050000, projectedItc: 510000 },
  { month: 'Oct 2026', projectedOutflow: 570000, projectedLiability: 1100000, projectedItc: 530000 },
  { month: 'Nov 2026', projectedOutflow: 590000, projectedLiability: 1150000, projectedItc: 560000 },
  { month: 'Dec 2026', projectedOutflow: 620000, projectedLiability: 1200000, projectedItc: 580000 },
  { month: 'Jan 2027', projectedOutflow: 650000, projectedLiability: 1250000, projectedItc: 600000 },
  { month: 'Feb 2027', projectedOutflow: 680000, projectedLiability: 1300000, projectedItc: 620000 },
  { month: 'Mar 2027', projectedOutflow: 720000, projectedLiability: 1400000, projectedItc: 680000 }
];

const TaxForecastingPage: React.FC = () => {
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [revenueAdjustment, setRevenueAdjustment] = useState(0); // Percentage -50 to +50
  const [itcEfficiency, setItcEfficiency] = useState(0); // Percentage 0 to +20

  const chartData = useMemo(() => {
    if (!isSimulatorMode && revenueAdjustment === 0 && itcEfficiency === 0) return mockForecastData;
    
    return mockForecastData.map(data => {
      // Apply the what-if adjustments
      const revFactor = 1 + (revenueAdjustment / 100);
      const itcFactor = 1 + (itcEfficiency / 100);
      
      const newLiability = Math.round(data.projectedLiability * revFactor);
      // ITC generally scales with revenue but can also be improved via efficiency
      const newItc = Math.round(data.projectedItc * revFactor * itcFactor);
      
      return {
        ...data,
        projectedLiability: newLiability,
        projectedItc: newItc,
        projectedOutflow: Math.max(0, newLiability - newItc)
      };
    });
  }, [isSimulatorMode, revenueAdjustment, itcEfficiency]);

  const projectedTotalOutflow = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.projectedOutflow, 0);
  }, [chartData]);
  
  const originalProjectedTotalOutflow = useMemo(() => {
     return mockForecastData.reduce((sum, item) => sum + item.projectedOutflow, 0);
  }, []);

  const totalYtdActual = useMemo(() => {
    return mockForecastData.reduce((sum, item) => sum + (item.actualOutflow || 0), 0);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tax Forecasting</h1>
          </div>
          <p className="text-slate-500 mt-1 font-medium ml-12">Predictive Cash Outflow Model & What-If Scenario Simulator for FY 26-27</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-slate-50">
            <Banknote size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">
              <LineChart size={16} /> Projected Cash Outflow
              {isSimulatorMode && (revenueAdjustment !== 0 || itcEfficiency !== 0) && (
                <span className="ml-auto bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-black">
                  SIMULATED
                </span>
              )}
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">
              ₹ {(projectedTotalOutflow / 100000).toFixed(2)}M
            </div>
            <div className="text-sm font-bold mt-2 flex items-center gap-1">
               {isSimulatorMode && (revenueAdjustment !== 0 || itcEfficiency !== 0) ? (
                 <>
                   <TrendingUp size={14} className={projectedTotalOutflow > originalProjectedTotalOutflow ? "text-rose-500" : "rotate-180 text-emerald-500"} />
                   <span className={projectedTotalOutflow > originalProjectedTotalOutflow ? "text-rose-600" : "text-emerald-600"}>
                     {projectedTotalOutflow > originalProjectedTotalOutflow ? "+" : ""}{((projectedTotalOutflow - originalProjectedTotalOutflow) / 100000).toFixed(2)}M variance
                   </span>
                 </>
               ) : (
                 <>
                   <TrendingUp size={14} className="text-rose-500" /> <span className="text-rose-600">+12.4% vs last FY</span>
                 </>
               )}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">
              <Calendar size={16} /> Actual Paid (YTD)
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">
              ₹ {(totalYtdActual / 100000).toFixed(2)}M
            </div>
            <div className="text-sm font-bold text-slate-500 mt-2 bg-slate-50 inline-block px-2 py-1 rounded">
              Apr 2026 - Aug 2026
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">
              <AlertTriangle size={16} /> Variance (YTD vs Projection)
            </div>
            <div className="text-4xl font-black text-amber-600 tracking-tight">
              + ₹ 0.4M
            </div>
            <div className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-1">
              <TrendingUp size={14} className="text-amber-500" /> Above projection by 1.8%
            </div>
          </div>
        </div>
      </div>

      {/* Main Simulator & Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              Predictive Cash Outflow Model
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Simulate revenue growth and ITC efficiency against projected GST payouts.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
             <button 
               onClick={() => setIsSimulatorMode(!isSimulatorMode)}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                 isSimulatorMode 
                  ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
               }`}
             >
               <Sliders size={18} /> {isSimulatorMode ? 'Close Simulator' : 'Open What-If Simulator'}
             </button>
          </div>
        </div>

        <AnimatePresence>
          {isSimulatorMode && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Revenue Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-sm font-black text-slate-800 flex items-center gap-2">
                         <TrendingUp size={16} className="text-indigo-600" /> Projected Revenue Growth
                       </label>
                       <span className={`text-xs font-black px-2.5 py-1 rounded-md ${
                         revenueAdjustment > 0 ? 'bg-emerald-100 text-emerald-700' : 
                         revenueAdjustment < 0 ? 'bg-rose-100 text-rose-700' : 
                         'bg-white text-slate-700 border border-slate-200'
                       }`}>
                         {revenueAdjustment > 0 ? '+' : ''}{revenueAdjustment}%
                       </span>
                    </div>
                    <div className="relative pt-2">
                      <input 
                        type="range" 
                        min="-50" 
                        max="100" 
                        step="5"
                        value={revenueAdjustment}
                        onChange={(e) => setRevenueAdjustment(parseInt(e.target.value))}
                        className="w-full h-2 bg-indigo-200/50 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-indigo-400 mt-2 px-1 uppercase tracking-wider">
                        <span>-50%</span>
                        <span>Baseline</span>
                        <span>+100%</span>
                      </div>
                    </div>
                  </div>

                  {/* ITC Efficiency Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-sm font-black text-slate-800 flex items-center gap-2">
                         <Percent size={16} className="text-emerald-600" /> ITC Claim Efficiency
                       </label>
                       <span className={`text-xs font-black px-2.5 py-1 rounded-md ${
                         itcEfficiency > 0 ? 'bg-emerald-100 text-emerald-700' : 
                         'bg-white text-slate-700 border border-slate-200'
                       }`}>
                         {itcEfficiency > 0 ? '+' : ''}{itcEfficiency}%
                       </span>
                    </div>
                    <div className="relative pt-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="20" 
                        step="1"
                        value={itcEfficiency}
                        onChange={(e) => setItcEfficiency(parseInt(e.target.value))}
                        className="w-full h-2 bg-emerald-200/50 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-emerald-600/70 mt-2 px-1 uppercase tracking-wider">
                        <span>Baseline</span>
                        <span>+10%</span>
                        <span>+20% (Optimal)</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-[450px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProjectedOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isSimulatorMode && (revenueAdjustment !== 0 || itcEfficiency !== 0) ? "#8b5cf6" : "#cbd5e1"} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={isSimulatorMode && (revenueAdjustment !== 0 || itcEfficiency !== 0) ? "#8b5cf6" : "#cbd5e1"} stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorActualOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                dx={10}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                  padding: '16px'
                }}
                labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}
                formatter={(value: number, name: string) => [
                  <span className="font-bold text-slate-800">₹{value.toLocaleString()}</span>, 
                  <span className="text-slate-500 font-semibold">{name}</span>
                ]}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}
              />

              {/* Background Bars for Gross Liability vs ITC */}
              <Bar 
                dataKey="projectedItc" 
                stackId="a" 
                fill="#10b981" 
                radius={[0, 0, 4, 4]} 
                barSize={24}
                name="Projected ITC"
                opacity={0.3}
              />
              <Bar 
                dataKey="projectedOutflow" 
                stackId="a" 
                fill="#f43f5e" 
                radius={[4, 4, 0, 0]} 
                name="Projected Net Cash"
                opacity={0.3}
              />
              
              {/* Foreground Areas for actual net cash outflow */}
              <Area 
                type="monotone" 
                dataKey="projectedOutflow" 
                stroke={isSimulatorMode && (revenueAdjustment !== 0 || itcEfficiency !== 0) ? "#8b5cf6" : "#94a3b8"}
                strokeWidth={3}
                strokeDasharray="6 6"
                fill="url(#colorProjectedOutflow)" 
                name={isSimulatorMode && (revenueAdjustment !== 0 || itcEfficiency !== 0) ? "Simulated Net Outflow" : "Baseline Net Outflow"}
                animationDuration={500}
              />
              <Area 
                type="monotone" 
                dataKey="actualOutflow" 
                stroke="#4f46e5" 
                strokeWidth={4}
                fill="url(#colorActualOutflow)" 
                name="Actual Net Outflow"
                animationDuration={500}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TaxForecastingPage;
