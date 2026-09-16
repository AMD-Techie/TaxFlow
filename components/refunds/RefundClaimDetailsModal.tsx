import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Landmark, 
  Building2, 
  User, 
  Calendar, 
  ArrowRight, 
  Download, 
  Send, 
  ShieldCheck, 
  RefreshCw, 
  Printer, 
  FileCode, 
  Paperclip, 
  ExternalLink,
  Info,
  CheckCircle,
  HelpCircle,
  FileBadge
} from 'lucide-react';
import { 
  ItcRefundClaim, 
  RefundCategory, 
  StatutoryDocument, 
  RefundTimelineEvent,
  RefundService 
} from '../../services/refundService';

interface RefundClaimDetailsModalProps {
  claim: ItcRefundClaim;
  onClose: () => void;
  onClaimUpdated: (updated: ItcRefundClaim) => void;
}

export const RefundClaimDetailsModal: React.FC<RefundClaimDetailsModalProps> = ({
  claim,
  onClose,
  onClaimUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'TAX_BREAKDOWN' | 'BANKING' | 'DOCUMENTS' | 'NOTICES'>('TIMELINE');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [scnReplyText, setScnReplyText] = useState('');
  const [deficiencyNotes, setDeficiencyNotes] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleScnReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scnReplyText.trim()) return;

    setIsSubmittingAction(true);
    try {
      const updated = await RefundService.submitReplyToScn(
        claim.id,
        scnReplyText,
        ['Realization_FIRC_Certificate.pdf', 'Service_Agreement_Annexure_B.pdf', 'CA_Realization_Certificate.pdf']
      );
      onClaimUpdated(updated);
      setActionSuccessMsg('Form GST RFD-09 Taxpayer Reply successfully signed via EVC and transmitted to Common Portal!');
      setScnReplyText('');
    } catch (err) {
      console.error('Error submitting SCN reply', err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDeficiencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deficiencyNotes.trim()) return;

    setIsSubmittingAction(true);
    try {
      const updated = await RefundService.submitDeficiencyRectification(claim.id, deficiencyNotes);
      onClaimUpdated(updated);
      setActionSuccessMsg('Rectified Form GST RFD-01 along with missing SEZ endorsements submitted to Proper Officer!');
      setDeficiencyNotes('');
    } catch (err) {
      console.error('Error submitting deficiency rectifications', err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-lg">
                ARN: {claim.arn}
              </span>
              <span className="text-xs font-bold text-slate-300">
                {claim.taxPeriod} ({claim.financialYear})
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {claim.category.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              {claim.legalName} <span className="text-sm font-normal text-slate-400">({claim.gstin})</span>
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Jurisdiction: <strong>{claim.jurisdiction.commissionerate}</strong></span>
              <span>•</span>
              <span>Officer: <strong className="text-slate-200">{claim.jurisdiction.assignedOfficerName}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live SLA & Progress Metric Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Claimed</span>
              <span className="text-sm font-black text-slate-900">{formatCurrency(claim.amountClaimed.total)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Disbursed (PFMS)</span>
              <span className="text-sm font-black text-emerald-700">{formatCurrency(claim.amountDisbursed)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Statutory SLA (Sec 54)</span>
              <span className={`text-xs font-black ${claim.sla.isInterestApplicable ? 'text-rose-700' : 'text-slate-800'}`}>
                {claim.sla.daysElapsed} days elapsed ({claim.sla.daysRemaining}d left)
                {claim.sla.isInterestApplicable && ` • +₹${claim.sla.accruedInterest.toLocaleString('en-IN')} Interest Accrued`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Gateway Status:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              <CheckCircle2 size={11} /> GSTN Synced ({claim.portalSync.lastSyncedAt})
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 px-6 bg-white flex items-center gap-4 overflow-x-auto">
          {[
            { id: 'TIMELINE', label: 'Audit & Lifecycle Timeline', icon: Clock },
            { id: 'TAX_BREAKDOWN', label: 'Tax Heads & Orders Breakdown', icon: FileText },
            { id: 'BANKING', label: 'PFMS & Banking Clearance', icon: Landmark },
            { id: 'DOCUMENTS', label: `Statutory Documents (${claim.documents.length})`, icon: FileCode },
            { 
              id: 'NOTICES', 
              label: claim.status === 'RFD03_DEFICIENCY_MEMO' || claim.status === 'RFD08_SCN_ISSUED' 
                ? 'Action / Notice Desk ⚠️' 
                : 'Notice & Compliance Desk', 
              icon: AlertTriangle 
            }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-6">
          {actionSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-900 text-xs font-bold animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span>{actionSuccessMsg}</span>
              </div>
              <button onClick={() => setActionSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
                <X size={14} />
              </button>
            </div>
          )}

          {/* TAB 1: AUDIT & TIMELINE */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  Statutory Progression & Portal Event Trail
                </h3>
                
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {claim.timeline.map((event, idx) => (
                    <div key={event.id} className="relative group">
                      {/* Node Bullet */}
                      <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                        event.status === 'COMPLETED'
                          ? 'border-emerald-500 text-emerald-600'
                          : event.status === 'ACTION_REQUIRED'
                          ? 'border-amber-500 text-amber-600 animate-ping'
                          : event.status === 'IN_PROGRESS'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-slate-300 text-slate-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          event.status === 'COMPLETED' ? 'bg-emerald-500' :
                          event.status === 'ACTION_REQUIRED' ? 'bg-amber-500' :
                          event.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-300'
                        }`} />
                      </div>

                      <div className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-4 border border-slate-200/80 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{event.title}</span>
                            {event.formRef && (
                              <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md">
                                {event.formRef}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400">{event.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                          {event.description}
                        </p>
                        <div className="text-[11px] text-slate-400 font-bold mt-2 flex items-center gap-1.5">
                          <User size={12} />
                          <span>Actor: {event.actor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portal Remarks Box */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide">Government Portal Raw Dispatch Note</h4>
                    <p className="text-xs text-blue-800 mt-0.5 font-medium leading-relaxed">
                      {claim.portalSync.currentRemarks}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TAX HEADS BREAKDOWN */}
          {activeTab === 'TAX_BREAKDOWN' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  Statutory Tax Head Reconciliation Matrix
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Tax Head</th>
                        <th className="px-4 py-3">Amount Claimed (₹)</th>
                        <th className="px-4 py-3">Provisional Sanction (90%)</th>
                        <th className="px-4 py-3">Final Sanction Order</th>
                        <th className="px-4 py-3">Disbursed (PFMS)</th>
                        <th className="px-4 py-3">Variance / Withheld</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-900">IGST (Integrated Tax)</td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(claim.amountClaimed.igst)}</td>
                        <td className="px-4 py-3 font-mono text-indigo-700">
                          {claim.amountProvisionallySanctioned ? formatCurrency(claim.amountProvisionallySanctioned.igst) : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-700">
                          {claim.amountFinalSanctioned ? formatCurrency(claim.amountFinalSanctioned.igst) : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                          {formatCurrency(claim.amountDisbursed > 0 ? (claim.amountFinalSanctioned?.igst || claim.amountProvisionallySanctioned?.igst || claim.amountClaimed.igst) : 0)}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">₹0</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-900">CGST (Central Tax)</td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(claim.amountClaimed.cgst)}</td>
                        <td className="px-4 py-3 font-mono text-indigo-700">
                          {claim.amountProvisionallySanctioned ? formatCurrency(claim.amountProvisionallySanctioned.cgst) : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-700">
                          {claim.amountFinalSanctioned ? formatCurrency(claim.amountFinalSanctioned.cgst) : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                          {formatCurrency(claim.amountDisbursed > 0 ? (claim.amountFinalSanctioned?.cgst || claim.amountClaimed.cgst) : 0)}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">₹0</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-900">SGST (State Tax)</td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(claim.amountClaimed.sgst)}</td>
                        <td className="px-4 py-3 font-mono text-indigo-700">
                          {claim.amountProvisionallySanctioned ? formatCurrency(claim.amountProvisionallySanctioned.sgst) : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-700">
                          {claim.amountFinalSanctioned ? formatCurrency(claim.amountFinalSanctioned.sgst) : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                          {formatCurrency(claim.amountDisbursed > 0 ? (claim.amountFinalSanctioned?.sgst || claim.amountClaimed.sgst) : 0)}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">₹0</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-900">Cess</td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(claim.amountClaimed.cess)}</td>
                        <td className="px-4 py-3 font-mono text-indigo-700">—</td>
                        <td className="px-4 py-3 font-mono text-emerald-700">—</td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">₹0</td>
                        <td className="px-4 py-3 font-mono text-slate-500">₹0</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                      <tr>
                        <td className="px-4 py-3">Total Claim Amount</td>
                        <td className="px-4 py-3 font-mono text-sm">{formatCurrency(claim.amountClaimed.total)}</td>
                        <td className="px-4 py-3 font-mono text-sm text-indigo-700">
                          {claim.amountProvisionallySanctioned ? formatCurrency(claim.amountProvisionallySanctioned.total) : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-emerald-700">
                          {claim.amountFinalSanctioned ? formatCurrency(claim.amountFinalSanctioned.total) : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-emerald-700">
                          {formatCurrency(claim.amountDisbursed)}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">₹0</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PFMS & BANKING CLEARANCE */}
          {activeTab === 'BANKING' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Landmark size={16} className="text-emerald-600" />
                  Public Financial Management System (PFMS) Banking Pipeline
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Bank Account Details</span>
                    <div className="text-sm font-black text-slate-900">{claim.banking.bankName}</div>
                    <div className="text-xs text-slate-700 font-mono">Account No: <strong>{claim.banking.accountNumberMasked}</strong></div>
                    <div className="text-xs text-slate-700 font-mono">IFSC Code: <strong>{claim.banking.ifsc}</strong></div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mt-1">
                      <ShieldCheck size={12} /> PFMS Account Status: {claim.banking.pfmsStatus}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Payment Order & Advice (RFD-05)</span>
                    <div className="text-xs text-slate-700">
                      Payment Order No: <strong className="font-mono">{claim.banking.paymentOrderNumber || 'Awaited'}</strong>
                    </div>
                    <div className="text-xs text-slate-700">
                      CBS Batch Reference: <strong className="font-mono">{claim.banking.cbsReferenceNumber || 'Pending CBS Dispatch'}</strong>
                    </div>
                    <div className="text-xs text-slate-700">
                      Banking UTR No: <strong className="font-mono text-blue-700">{claim.banking.utrNumber || 'Pending Bank Settlement'}</strong>
                    </div>
                    <div className="text-xs text-slate-700">
                      Credit Date: <strong className="text-emerald-700">{claim.banking.disbursedDate || 'Not Disbursed Yet'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATUTORY DOCUMENTS */}
          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {claim.documents.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                        {doc.type}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 mt-1">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">Ref: {doc.documentNumber}</p>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1 font-medium">
                        <span>Issued: {doc.issuedDate}</span>
                        <span>•</span>
                        <span>Size: {doc.fileSize}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                          <ShieldCheck size={10} /> Validated
                        </span>
                      </div>
                      {doc.remarks && (
                        <p className="text-[10px] text-amber-700 font-medium bg-amber-50 p-1.5 rounded-md mt-1">
                          {doc.remarks}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => alert(`Downloading official authenticated copy of ${doc.title} (${doc.documentNumber}) with cryptographic signature...`)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors shrink-0"
                      title="Download Certified PDF"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: NOTICES & ACTIONS */}
          {activeTab === 'NOTICES' && (
            <div className="space-y-6">
              {/* If SCN is issued */}
              {claim.scnDetails && (
                <div className="bg-rose-50/70 rounded-2xl p-5 border border-rose-300 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="text-rose-600" />
                      <h4 className="text-sm font-black text-rose-950">Show Cause Notice (Form GST RFD-08) Active</h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-rose-800 bg-rose-200/60 px-2 py-0.5 rounded-md">
                      {claim.scnDetails.scnNumber}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-rose-200 text-xs space-y-2 text-slate-800">
                    <div>
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Grounds of Proposed Rejection:</span>
                      <p className="font-medium text-slate-900 mt-0.5 leading-relaxed">{claim.scnDetails.groundsForRejection}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div>Proposed Rejection: <strong className="text-rose-700">{formatCurrency(claim.scnDetails.proposedRejectionAmount)}</strong></div>
                      <div>Reply Due Date: <strong className="text-slate-900">{claim.scnDetails.replyDueDate}</strong></div>
                      <div>Hearing Date: <strong>{claim.scnDetails.hearingDate || 'None requested'}</strong></div>
                    </div>
                  </div>

                  {/* SCN Reply Composer */}
                  {claim.status === 'RFD08_SCN_ISSUED' ? (
                    <form onSubmit={handleScnReplySubmit} className="space-y-3 bg-white p-4 rounded-xl border border-rose-200">
                      <label className="text-xs font-black text-slate-900 block">
                        Draft Taxpayer Reply (Form GST RFD-09) & Upload Clarification Annexures
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Enter comprehensive legal response and reconciliation rationale explaining why the realization realization condition stands satisfied under Rule 96A..."
                        value={scnReplyText}
                        onChange={(e) => setScnReplyText(e.target.value)}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-800"
                        required
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <Paperclip size={13} />
                          <span>3 Realization & FIRC documents attached</span>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmittingAction || !scnReplyText.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                          <Send size={13} />
                          {isSubmittingAction ? 'Signing & Submitting...' : 'Sign with EVC & Submit RFD-09'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>Taxpayer reply Form GST RFD-09 was submitted on {claim.scnDetails.replyFiledDate}. Officer review pending.</span>
                    </div>
                  )}
                </div>
              )}

              {/* If Deficiency Memo is issued */}
              {claim.deficiencyDetails && (
                <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-300 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="text-amber-700" />
                      <h4 className="text-sm font-black text-amber-950">Deficiency Memo (Form GST RFD-03) Active</h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                      {claim.deficiencyDetails.memoNumber}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-amber-200 text-xs space-y-2 text-slate-800">
                    <div>
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Officer Deficiency Finding:</span>
                      <p className="font-medium text-slate-900 mt-0.5 leading-relaxed">{claim.deficiencyDetails.reason}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Actionable Rectifications:</span>
                      <ul className="list-disc list-inside space-y-1 mt-1 text-slate-700 font-medium">
                        {claim.deficiencyDetails.requiredRectifications.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {claim.status === 'RFD03_DEFICIENCY_MEMO' ? (
                    <form onSubmit={handleDeficiencySubmit} className="space-y-3 bg-white p-4 rounded-xl border border-amber-200">
                      <label className="text-xs font-black text-slate-900 block">
                        Submit Rectification Dossier & Fresh Form GST RFD-01
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Detail the endorsements appended and corrections made to the statement..."
                        value={deficiencyNotes}
                        onChange={(e) => setDeficiencyNotes(e.target.value)}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-800"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingAction || !deficiencyNotes.trim()}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                      >
                        <Send size={13} />
                        {isSubmittingAction ? 'Transmitting...' : 'Submit Rectified RFD-01'}
                      </button>
                    </form>
                  ) : null}
                </div>
              )}

              {!claim.scnDetails && !claim.deficiencyDetails && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                  <h4 className="text-sm font-black text-slate-900">Zero Outstanding Notices or Deficiencies</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    This refund claim is progressing without any statutory objections or show cause notices from the jurisdictional tax office.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Cryptographic SHA-256 Validated • Statutory Form Series 54/56
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert(`Printing statutory refund dossier for ARN ${claim.arn}...`)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <Printer size={14} /> Print Dossier
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
