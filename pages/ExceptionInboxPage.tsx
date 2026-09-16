import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Search, 
  ArrowRight, 
  ShieldAlert, 
  FileText, 
  Building2, 
  Mail, 
  RefreshCw, 
  Download, 
  Eye, 
  Check, 
  X, 
  UserCheck, 
  Sparkles, 
  ChevronRight, 
  HelpCircle,
  TrendingDown,
  Info,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { UserRole } from '../types';
import { exportToCSV } from '../utils/export';
import { useTranslation } from '../utils/i18n';

export interface GstExceptionItem {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  invoiceDate: string;
  vendorName: string;
  vendorGstin: string;
  exceptionType: '2B_MISMATCH' | 'SUPPLIER_DELINQUENT' | 'BLOCKED_ITC_17_5' | 'RATE_HSN_ERROR' | 'E_INVOICE_MISSING' | 'EWAY_EXPIRED';
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  prTaxableValue: number;
  prTaxAmount: number;
  portalTaxableValue?: number;
  portalTaxAmount?: number;
  varianceAmount: number;
  detectedAt: string;
  status: 'OPEN' | 'ASSIGNED' | 'VENDOR_NOTIFIED' | 'RESOLVED' | 'WAIVED';
  assignedTo?: string;
  recommendedAction: string;
  itcImpact: number;
}

const INITIAL_EXCEPTIONS: GstExceptionItem[] = [
  {
    id: 'EXC-2026-001',
    tenantId: 't1',
    invoiceNumber: 'INV-2026-9812',
    invoiceDate: '2026-08-04',
    vendorName: 'Apex Cloud Technologies Pvt Ltd',
    vendorGstin: '27AABCA1234F1Z8',
    exceptionType: '2B_MISMATCH',
    title: 'GSTR-2B Taxable Value Variance (₹14,500 mismatch)',
    description: 'Purchase register recorded ₹1,25,000 + 18% GST (₹22,500). GSTR-2B portal record reflects ₹1,10,500 + 18% GST (₹19,890).',
    severity: 'HIGH',
    prTaxableValue: 125000,
    prTaxAmount: 22500,
    portalTaxableValue: 110500,
    portalTaxAmount: 19890,
    varianceAmount: 2610,
    detectedAt: '2026-08-16 09:30',
    status: 'OPEN',
    recommendedAction: 'Request supplier credit note or file GSTR-1 amendment for August.',
    itcImpact: 2610
  },
  {
    id: 'EXC-2026-002',
    tenantId: 't1',
    invoiceNumber: 'TAX-8842',
    invoiceDate: '2026-08-08',
    vendorName: 'Bharat Logistix Corporation',
    vendorGstin: '29ABCDE5678G2Z1',
    exceptionType: 'SUPPLIER_DELINQUENT',
    title: 'Supplier GSTR-3B Default for Prior 2 Consecutive Months',
    description: 'Vendor portal status reflects non-filing of GSTR-3B for June & July 2026. High risk of ITC clawback under GST Rule 37A.',
    severity: 'CRITICAL',
    prTaxableValue: 340000,
    prTaxAmount: 61200,
    portalTaxableValue: 0,
    portalTaxAmount: 0,
    varianceAmount: 61200,
    detectedAt: '2026-08-15 14:10',
    status: 'OPEN',
    recommendedAction: 'Hold payment and dispatch formal GST compliance non-filing notice.',
    itcImpact: 61200
  },
  {
    id: 'EXC-2026-003',
    tenantId: 't1',
    invoiceNumber: 'INV-CORP-4401',
    invoiceDate: '2026-08-10',
    vendorName: 'Prestige Hospitality Suites',
    vendorGstin: '27XYZAB9900H1Z2',
    exceptionType: 'BLOCKED_ITC_17_5',
    title: 'Ineligible ITC detected under Section 17(5)(b) - Food & Beverages',
    description: 'Invoice categorised as general business expenses, but line items contain catering & outdoor hospitality (blocked under statutory 17(5)).',
    severity: 'HIGH',
    prTaxableValue: 85000,
    prTaxAmount: 15300,
    varianceAmount: 15300,
    detectedAt: '2026-08-14 11:20',
    status: 'OPEN',
    recommendedAction: 'Reverse ITC in Table 4(B)(1) to prevent statutory audit penalty and interest.',
    itcImpact: 15300
  },
  {
    id: 'EXC-2026-004',
    tenantId: 't1',
    invoiceNumber: 'INV-HW-1102',
    invoiceDate: '2026-08-11',
    vendorName: 'Precision Engineering Tools',
    vendorGstin: '33AABCT9988K1Z5',
    exceptionType: 'RATE_HSN_ERROR',
    title: 'HSN Code 8466 applied at 12% instead of mandated 18%',
    description: 'Statutory GST tariff for HSN 8466 is 18%. Vendor billed at concessional 12% without applicable exemption notification.',
    severity: 'MEDIUM',
    prTaxableValue: 210000,
    prTaxAmount: 25200,
    varianceAmount: 12600,
    detectedAt: '2026-08-13 16:45',
    status: 'ASSIGNED',
    assignedTo: 'Senior Tax Accountant',
    recommendedAction: 'Request revised tax invoice with correct tariff schedule 18%.',
    itcImpact: 12600
  },
  {
    id: 'EXC-2026-005',
    tenantId: 't1',
    invoiceNumber: 'INV-MET-7731',
    invoiceDate: '2026-08-12',
    vendorName: 'National Steel & Alloys Ltd',
    vendorGstin: '27AABCN7788P1Z9',
    exceptionType: 'E_INVOICE_MISSING',
    title: 'Mandatory IRN / QR Code Missing for B2B Outward Invoice',
    description: 'Supplier aggregate turnover exceeds ₹5 Crore threshold but invoice was issued without valid NIC/IRN e-invoice hash.',
    severity: 'CRITICAL',
    prTaxableValue: 480000,
    prTaxAmount: 86400,
    varianceAmount: 86400,
    detectedAt: '2026-08-12 10:15',
    status: 'VENDOR_NOTIFIED',
    recommendedAction: 'Invalid tax invoice as per Rule 48(4). Request e-invoiced re-issuance before release.',
    itcImpact: 86400
  },
  {
    id: 'EXC-2026-006',
    tenantId: 't1',
    invoiceNumber: 'EXP-TRANS-902',
    invoiceDate: '2026-08-05',
    vendorName: 'TransIndia Freight Express',
    vendorGstin: '06AABCT4411Q1Z4',
    exceptionType: 'EWAY_EXPIRED',
    title: 'E-Way Bill Expired Prior to Transit Delivery Completion',
    description: 'EWB #4410928341 expired 18 hours prior to delivery timestamp recorded in ERP warehouse receipt.',
    severity: 'LOW',
    prTaxableValue: 95000,
    prTaxAmount: 17100,
    varianceAmount: 0,
    detectedAt: '2026-08-11 08:30',
    status: 'RESOLVED',
    recommendedAction: 'Transit delivery logs and toll records verified and attached to audit dossier.',
    itcImpact: 0
  }
];

export const ExceptionInboxPage: React.FC = () => {
  const { language } = useTranslation();

  const user = useSelector((state: RootState) => state.auth.user);
  const [exceptions, setExceptions] = useState<GstExceptionItem[]>(INITIAL_EXCEPTIONS);
  const [selectedException, setSelectedException] = useState<GstExceptionItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    const total = exceptions.length;
    const critical = exceptions.filter(e => e.severity === 'CRITICAL').length;
    const open = exceptions.filter(e => e.status === 'OPEN' || e.status === 'ASSIGNED').length;
    const totalItcAtRisk = exceptions
      .filter(e => e.status !== 'RESOLVED' && e.status !== 'WAIVED')
      .reduce((acc, curr) => acc + curr.itcImpact, 0);

    return { total, critical, open, totalItcAtRisk };
  }, [exceptions]);

  // Filtered exception list
  const filteredExceptions = useMemo(() => {
    return exceptions.filter(item => {
      const matchesSearch = 
        item.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendorGstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'ALL' || item.exceptionType === typeFilter;
      const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });
  }, [exceptions, searchQuery, typeFilter, severityFilter, statusFilter]);

  // Handlers
  const handleUpdateStatus = (id: string, newStatus: GstExceptionItem['status'], reason?: string) => {
    setExceptions(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: newStatus,
          description: reason ? `${e.description} [Resolution note: ${reason}]` : e.description
        };
      }
      return e;
    }));

    if (selectedException?.id === id) {
      setSelectedException(prev => prev ? { ...prev, status: newStatus } : null);
    }

    setActionSuccessMessage(`Exception #${id} status updated to ${newStatus}`);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const handleExportExceptions = () => {
    const exportData = filteredExceptions.map(e => ({
      'Exception ID': e.id,
      'Invoice Number': e.invoiceNumber,
      'Invoice Date': e.invoiceDate,
      'Vendor Name': e.vendorName,
      'Vendor GSTIN': e.vendorGstin,
      'Exception Category': e.exceptionType,
      'Severity': e.severity,
      'Status': e.status,
      'PR Tax Amount': e.prTaxAmount,
      'Portal Tax Amount': e.portalTaxAmount || 0,
      'ITC At Risk (₹)': e.itcImpact,
      'Recommended Action': e.recommendedAction,
      'Detected Timestamp': e.detectedAt
    }));

    exportToCSV(exportData, `gst-exceptions-report-${new Date().toISOString().split('T')[0]}`, language);
  };

  return (
    <div id="exception-inbox-page" className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Exception Inbox & Resolution Center
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Automated triage and statutory compliance discrepancy workbench across GSTR-2B, Section 17(5), E-Invoices, and supplier filings.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExceptions}
            className="px-3.5 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download size={14} />
            Export Dossier
          </button>
          <button
            onClick={() => {
              setActionSuccessMessage('Real-time anomaly scanner triggered. All 6 registers scanned.');
              setTimeout(() => setActionSuccessMessage(null), 3000);
            }}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={14} />
            Re-scan Invoices
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {actionSuccessMessage}
          </span>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-corporate p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Critical Exceptions
          </span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            {stats.critical}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
            Immediate clawback or notice risk
          </span>
        </div>

        <div className="card-corporate p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Open Discrepancies
          </span>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">
            {stats.open}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
            Pending accountant or vendor action
          </span>
        </div>

        <div className="card-corporate p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total ITC At Risk
          </span>
          <div className="text-2xl font-black text-indigo-900 font-mono mt-1">
            ₹{stats.totalItcAtRisk.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
            Unreconciled input credit exposure
          </span>
        </div>

        <div className="card-corporate p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Resolution Efficiency
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {Math.round(((exceptions.length - stats.open) / (exceptions.length || 1)) * 100)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
            Closed or audited exceptions
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-corporate p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice, vendor, or GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Categories</option>
            <option value="2B_MISMATCH">GSTR-2B Mismatches</option>
            <option value="SUPPLIER_DELINQUENT">Supplier Non-Filing</option>
            <option value="BLOCKED_ITC_17_5">Blocked ITC (17(5))</option>
            <option value="RATE_HSN_ERROR">HSN / Rate Errors</option>
            <option value="E_INVOICE_MISSING">E-Invoice / IRN Missing</option>
            <option value="EWAY_EXPIRED">E-Way Bill Issues</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="VENDOR_NOTIFIED">Vendor Notified</option>
            <option value="RESOLVED">Resolved</option>
            <option value="WAIVED">Waived</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Exception List and Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Exception Table / Cards */}
        <div className="lg:col-span-7 space-y-3">
          {filteredExceptions.length === 0 ? (
            <div className="card-corporate p-12 text-center">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matching exceptions found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All invoices comply with statutory rules for the selected filter criteria.
              </p>
            </div>
          ) : (
            filteredExceptions.map((item) => {
              const isSelected = selectedException?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedException(item)}
                  className={`card-corporate p-4 transition-all cursor-pointer border relative overflow-hidden ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/20 shadow-md ring-1 ring-blue-500/20' 
                      : 'hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Left Severity Accent */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                    item.severity === 'CRITICAL' ? 'bg-rose-600' :
                    item.severity === 'HIGH' ? 'bg-amber-500' :
                    item.severity === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} />

                  <div className="pl-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {item.invoiceNumber}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            item.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                            item.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                            item.severity === 'MEDIUM' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.severity}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'VENDOR_NOTIFIED' ? 'bg-purple-100 text-purple-800' :
                            item.status === 'ASSIGNED' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-1.5 leading-snug">
                          {item.title}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">ITC Exposure</span>
                        <span className="text-sm font-black font-mono text-rose-600">
                          ₹{item.itcImpact.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[240px] font-medium text-slate-700">
                        {item.vendorName} ({item.vendorGstin})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.detectedAt}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Resolution Workbench */}
        <div className="lg:col-span-5">
          {selectedException ? (
            <div className="card-corporate p-5 sticky top-24 space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Resolution Workspace
                  </span>
                  <h3 className="text-sm font-black text-slate-900 font-mono">
                    {selectedException.id} • {selectedException.invoiceNumber}
                  </h3>
                </div>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                  selectedException.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                  selectedException.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedException.severity} PRIORITY
                </span>
              </div>

              {/* Summary description */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                {selectedException.description}
              </div>

              {/* Vendor & Invoice Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Vendor</span>
                  <span className="font-bold text-slate-800 block truncate">{selectedException.vendorName}</span>
                  <span className="font-mono text-[11px] text-slate-500">{selectedException.vendorGstin}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">ITC Impact</span>
                  <span className="font-bold text-rose-600 font-mono text-sm block">₹{selectedException.itcImpact.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500">Date: {selectedException.invoiceDate}</span>
                </div>
              </div>

              {/* Recommended Action Card */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                  <Sparkles size={14} className="text-blue-600" />
                  Statutory AI Recommendation
                </div>
                <p className="text-xs text-blue-950 font-medium">
                  {selectedException.recommendedAction}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Execute Resolution
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedException.id, 'RESOLVED', 'Matched with supplier credit note and reconciled in 2B.')}
                    className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 size={14} />
                    Mark Resolved
                  </button>

                  <button
                    onClick={() => {
                      setIsNotifyModalOpen(true);
                    }}
                    className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Mail size={14} />
                    Notify Vendor
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedException.id, 'ASSIGNED', 'Assigned to Senior Tax Auditor for audit trail review.')}
                    className="w-full py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <UserCheck size={14} />
                    Assign Auditor
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedException.id, 'WAIVED', 'Difference within permissible rounding limit (under ₹10).')}
                    className="w-full py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle size={14} />
                    Waive Mismatch
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-corporate p-8 text-center text-slate-400">
              <Eye size={36} className="mx-auto mb-2 text-slate-300" />
              <h4 className="font-bold text-slate-700 text-sm">Select an Exception</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Click any item from the left inbox pane to inspect discrepancy root-cause, audit data, and resolution controls.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Vendor Notification Modal */}
      {isNotifyModalOpen && selectedException && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Mail size={18} className="text-indigo-600" />
                <span>Send Compliance Notice to Vendor</span>
              </div>
              <button onClick={() => setIsNotifyModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 font-bold block mb-1">To Vendor Email / Contact</label>
                <input
                  type="text"
                  defaultValue={`tax-accounts@${selectedException.vendorName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Subject</label>
                <input
                  type="text"
                  defaultValue={`GST Compliance Notice: Discrepancy in Invoice #${selectedException.invoiceNumber}`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Formal Notice Body</label>
                <textarea
                  rows={4}
                  defaultValue={`Dear Finance Team,\n\nOur automated GSTR-2B compliance system has identified an unreconciled statutory discrepancy regarding Invoice #${selectedException.invoiceNumber} dated ${selectedException.invoiceDate}.\n\nIssue Details: ${selectedException.description}\nITC Exposure: ₹${selectedException.itcImpact.toLocaleString()}\n\nPlease issue the required GSTR-1 amendment or credit note to prevent payment hold.`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsNotifyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(selectedException.id, 'VENDOR_NOTIFIED', 'Vendor notified via automated compliance email.');
                  setIsNotifyModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
              >
                <Mail size={14} />
                Send Formal Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExceptionInboxPage;
