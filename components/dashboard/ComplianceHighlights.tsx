import React from 'react';
import { 
  FileText, ShieldAlert, Activity, ArrowUpRight, 
  CheckCircle2, Briefcase, ChevronRight, AlertCircle 
} from 'lucide-react';

interface ComplianceHighlightsProps {
  analytics?: any;
  filings?: any;
}

const ComplianceHighlights: React.FC<ComplianceHighlightsProps> = ({ analytics, filings }) => {
  // Use real data from analytics/filings if available, otherwise fall back to screenshot high-fidelity defaults
  const vendorCompliance = analytics?.riskMetrics?.vendorCompliance ?? 82;
  const mismatches = analytics?.riskMetrics?.mismatchedInvoices ?? 14;
  const itcAtRiskVal = analytics?.riskMetrics?.itcAtRisk ?? 45600;
  
  // Format ITC at Risk (e.g., 45600 -> "₹45.6k")
  const formattedItcAtRisk = itcAtRiskVal >= 1000 
    ? `₹${(itcAtRiskVal / 1000).toFixed(1)}k` 
    : `₹${itcAtRiskVal}`;

  // Get GSTR-1 and GSTR-3B statuses
  const gstr1 = filings?.find((f: any) => f.type === 'GSTR-1') || { status: 'FILED', period: 'Oct 2024', filedDate: '11th Nov 2024' };
  const gstr3b = filings?.find((f: any) => f.type === 'GSTR-3B') || { status: 'PENDING', period: 'Oct 2024', dueDate: '20th Nov' };

  return (
    <div id="compliance-highlights-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* CARD 1: Filing Status */}
      <div id="filing-status-card" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
              <FileText size={22} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Filing Status</h3>
          </div>

          {/* Sub-cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* GSTR-1 Box */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 relative flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">GSTR-1</span>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">Filed</p>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-2">11th Nov 2024</p>
              
              {/* Check-circle Icon */}
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={13} strokeWidth={2.5} />
              </div>
            </div>

            {/* GSTR-3B Box */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 relative flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">GSTR-3B</span>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">Pending</p>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-2">Due: 20th Nov</p>

              {/* Briefcase/Clock Icon */}
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <Briefcase size={12} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* View Detailed Report Link */}
        <button 
          onClick={() => window.location.hash = '#/filing'}
          className="w-full mt-6 pt-4 border-t border-slate-100/60 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-2 group"
        >
          View Detailed Report 
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>


      {/* CARD 2: Risk Meter */}
      <div id="risk-meter-card" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100/50">
              <ShieldAlert size={22} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Risk Meter</h3>
          </div>

          {/* Compliance Meter */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center text-sm font-bold text-slate-600">
              <span>Vendor Compliance</span>
              <span className="text-slate-800">{vendorCompliance}%</span>
            </div>
            
            {/* Custom styled progress bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${vendorCompliance}%` }}
              ></div>
            </div>
          </div>

          {/* Two-Column Mini Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Mismatches container */}
            <div className="border border-slate-100 bg-white p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Mismatches</span>
              <span className="text-3xl font-black text-rose-600 tracking-tight">{mismatches}</span>
            </div>

            {/* ITC Risk container */}
            <div className="border border-slate-100 bg-white p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">ITC Risk</span>
              <span className="text-3xl font-black text-amber-600 tracking-tight">{formattedItcAtRisk}</span>
            </div>
          </div>
        </div>

        {/* Padding offset helper to align buttons */}
        <div className="mt-6 border-t border-transparent pt-4"></div>
      </div>


      {/* CARD 3: Live Feed */}
      <div id="live-feed-card" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
            <Activity size={22} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Live Feed</h3>
        </div>

        {/* Live Timeline list */}
        <div className="relative pl-6 space-y-6 flex-1">
          {/* Vertical Timeline Connector Line */}
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-100"></div>

          {/* Feed Item 1 */}
          <div className="relative flex items-start justify-between group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full bg-white border-[3.5px] border-blue-500 shadow-sm z-10"></div>
            
            <div className="flex-1 pr-4">
              <h4 className="text-sm font-bold text-slate-800 leading-tight">GSTR-1 Filed Successfully</h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Oct 2024 Return</p>
            </div>
            
            <span className="text-[10px] bg-slate-100 font-bold text-slate-400 px-2 py-0.5 rounded-lg whitespace-nowrap">
              2h ago
            </span>
          </div>

          {/* Feed Item 2 */}
          <div className="relative flex items-start justify-between group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full bg-white border-[3.5px] border-amber-500 shadow-sm z-10"></div>
            
            <div className="flex-1 pr-4">
              <h4 className="text-sm font-bold text-slate-800 leading-tight">Vendor Mismatch Alert</h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Cloud Services Inc (₹45k)</p>
            </div>
            
            <span className="text-[10px] bg-slate-100 font-bold text-slate-400 px-2 py-0.5 rounded-lg whitespace-nowrap">
              5h ago
            </span>
          </div>

          {/* Feed Item 3 */}
          <div className="relative flex items-start justify-between group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full bg-white border-[3.5px] border-emerald-500 shadow-sm z-10"></div>
            
            <div className="flex-1 pr-4">
              <h4 className="text-sm font-bold text-slate-800 leading-tight">E-Invoices Generated</h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Batch #4092 • 15 Invoices</p>
            </div>
            
            <span className="text-[10px] bg-slate-100 font-bold text-slate-400 px-2 py-0.5 rounded-lg whitespace-nowrap">
              1d ago
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ComplianceHighlights;
