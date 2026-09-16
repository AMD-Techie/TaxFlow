import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchComplianceAlerts, fetchVendorRisks, updateNotificationSettings } from '../services/api';
import { 
  Bell, CalendarClock, AlertTriangle, ShieldAlert, Mail, MessageSquare, 
  CheckCircle2, AlertCircle, Clock, ChevronRight, Send, Laptop, RefreshCw
} from 'lucide-react';
import { ComplianceAlert, NotificationSettings } from '../types';
import { 
  getNotificationPermissionState, 
  requestBrowserNotificationPermission, 
  triggerBrowserNotification 
} from '../utils/browserNotifications';
import GstinVerificationModule from '../components/GstinVerificationModule';
import { RegulatoryChangeModule } from '../components/RegulatoryChangeModule';
import { ComplianceArchitecturePipeline } from '../components/ComplianceArchitecturePipeline';
import { GstPolicyUpdatesWidget } from '../components/dashboard/GstPolicyUpdatesWidget';
import { ItcLedgerOptimizer } from '../components/ItcLedgerOptimizer';
import { RegulatoryEventAudit } from '../components/RegulatoryEventAudit';
import { RegulatoryAuditLog } from '../components/RegulatoryAuditLog';
import { VendorComplianceScorecard } from '../components/VendorComplianceScorecard';

const Compliance: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const tenantId = user?.currentTenantId || 't1';

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ARCHITECTURE' | 'GSTIN_SEARCH' | 'VENDOR_RISK' | 'ITC_WATCHLIST' | 'REGULATORY_CHANGES' | 'REGULATORY_AUDIT' | 'REGULATORY_AUDIT_LOG' | 'NOTIFICATIONS'>('OVERVIEW');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [desktopEnabled, setDesktopEnabled] = useState(true);
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>('default');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Slack Webhook integration states
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [slackEventsEnabled, setSlackEventsEnabled] = useState(true);
  const [isTestingSlack, setIsTestingSlack] = useState(false);
  const [slackTestStatus, setSlackTestStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [slackTestError, setSlackTestError] = useState('');

  useEffect(() => {
    setBrowserPerm(getNotificationPermissionState());
    
    // Auto-load Slack configuration from persistent storage
    const savedWebhook = localStorage.getItem('taxflow_slack_webhook_url');
    const savedEnabled = localStorage.getItem('taxflow_slack_events_enabled');
    if (savedWebhook) setSlackWebhookUrl(savedWebhook);
    if (savedEnabled) setSlackEventsEnabled(savedEnabled === 'true');
  }, []);

  const handleTestSlackNotification = async () => {
    if (!slackWebhookUrl || !slackWebhookUrl.startsWith('https://hooks.slack.com/')) {
      setSlackTestStatus('FAILED');
      setSlackTestError('Please provide a valid Slack incoming webhook URL (starting with https://hooks.slack.com/)');
      return;
    }

    setIsTestingSlack(true);
    setSlackTestStatus('IDLE');
    setSlackTestError('');

    try {
      const response = await fetch('/api/v1/compliance/slack/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: slackWebhookUrl,
          event: {
            title: 'Test Slack Webhook Channel Integration',
            description: 'This is a test notification confirming that your Slack webhook integration with the TaxFlow Regulatory Intelligence engine has been established successfully!',
            category: 'ADVISORY',
            impactScore: 'LOW',
            effectiveDate: '2026-08-17',
            ruleVersion: 'v1.0.0',
            source: 'TaxFlow Integration Services'
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSlackTestStatus('SUCCESS');
        localStorage.setItem('taxflow_slack_webhook_url', slackWebhookUrl);
        localStorage.setItem('taxflow_slack_events_enabled', String(slackEventsEnabled));
        setToastMsg('Slack Webhook verified and test alert dispatched!');
      } else {
        setSlackTestStatus('FAILED');
        setSlackTestError(data.error || 'Failed to trigger Slack. Please verify the Webhook endpoint.');
      }
    } catch (err: any) {
      setSlackTestStatus('FAILED');
      setSlackTestError(err.message || 'Network error triggering Slack webhook.');
    } finally {
      setIsTestingSlack(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleEnableBrowserDesktop = async () => {
    const perm = await requestBrowserNotificationPermission();
    setBrowserPerm(perm);
    if (perm === 'granted') {
      triggerBrowserNotification('✅ Browser Desktop Notifications Activated', {
        body: 'TaxFlow will notify you when filing deadlines are within 48 hours or critical risks occur.',
        force: true
      });
      setToastMsg('Browser Notification permission granted successfully!');
    } else {
      setToastMsg('Notification permission was denied. Please allow notifications in browser settings.');
    }
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSendTestBrowserNotification = () => {
    if (browserPerm !== 'granted') {
      handleEnableBrowserDesktop();
      return;
    }
    const sent = triggerBrowserNotification('🚨 Critical Risk Alert Test', {
      body: 'GSTR-3B deadline is within 24 hours. Pending ITC blockage risk detected on Vendor Cloud Services Inc.',
      force: true
    });
    if (sent) setToastMsg('Test browser alert sent to your desktop!');
    else setToastMsg('Unable to trigger alert. Check browser permission.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const { data: alerts, isLoading: isAlertsLoading } = useQuery({ 
      queryKey: ['complianceAlerts', tenantId], 
      queryFn: () => fetchComplianceAlerts(tenantId) 
  });
  
  const { data: vendorRisks, isLoading: isRisksLoading } = useQuery({ 
      queryKey: ['vendorRisks', tenantId], 
      queryFn: () => fetchVendorRisks(tenantId) 
  });

  const { mutate: saveSettings, isPending: isSavingSettings } = useMutation({
      mutationFn: updateNotificationSettings,
      onSuccess: () => alert('Notification preferences updated!')
  });

  const getSeverityColor = (severity: string) => {
      switch(severity) {
          case 'HIGH': return 'bg-red-50 text-red-700 border-red-200';
          case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
          case 'LOW': return 'bg-blue-50 text-blue-700 border-blue-200';
          default: return 'bg-slate-50 text-slate-700';
      }
  };

  const getAlertIcon = (type: ComplianceAlert['type']) => {
      switch(type) {
          case 'DUE_DATE': return <CalendarClock size={20} className="text-blue-600"/>;
          case 'VENDOR_RISK': return <ShieldAlert size={20} className="text-amber-600"/>;
          case 'ITC_EXPIRY': return <Clock size={20} className="text-red-600"/>;
          case 'PENALTY': return <AlertTriangle size={20} className="text-orange-600"/>;
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Compliance Center</h2>
          <p className="text-slate-500">Monitor due dates, vendor risks, and manage automated alerts.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto">
           {['OVERVIEW', 'ARCHITECTURE', 'GSTIN_SEARCH', 'VENDOR_RISK', 'ITC_WATCHLIST', 'REGULATORY_CHANGES', 'REGULATORY_AUDIT', 'REGULATORY_AUDIT_LOG', 'NOTIFICATIONS'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab === 'GSTIN_SEARCH' ? 'GSTIN Verification' : tab === 'REGULATORY_CHANGES' ? 'Regulatory Changes' : tab === 'REGULATORY_AUDIT' ? 'Regulatory Event Audit' : tab === 'REGULATORY_AUDIT_LOG' ? 'Decision Audit Log' : tab === 'ARCHITECTURE' ? 'Control Tower Architecture' : tab === 'ITC_WATCHLIST' ? 'ITC Control Ledger' : tab.replace('_', ' ')}
              </button>
           ))}
        </div>
      </div>

      {activeTab === 'GSTIN_SEARCH' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <GstinVerificationModule />
        </div>
      )}

      {activeTab === 'ARCHITECTURE' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <ComplianceArchitecturePipeline />
        </div>
      )}

      {activeTab === 'REGULATORY_CHANGES' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <GstPolicyUpdatesWidget />
          <RegulatoryChangeModule />
        </div>
      )}

      {activeTab === 'REGULATORY_AUDIT' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <RegulatoryEventAudit />
        </div>
      )}

      {activeTab === 'REGULATORY_AUDIT_LOG' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <RegulatoryAuditLog />
        </div>
      )}

      {activeTab === 'OVERVIEW' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {/* Alert Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {alerts?.length === 0 ? (
                       <div className="col-span-full text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200">No active alerts for this organization.</div>
                  ) : alerts?.map(alert => (
                      <div key={alert.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                          <div className={`absolute top-0 left-0 w-1 h-full ${alert.severity === 'HIGH' ? 'bg-red-500' : alert.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                          <div className="flex justify-between items-start mb-3 pl-2">
                              <div className="p-2 bg-slate-50 rounded-lg">{getAlertIcon(alert.type)}</div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSeverityColor(alert.severity)}`}>
                                  {alert.severity}
                              </span>
                          </div>
                          <h3 className="font-bold text-slate-800 mb-1 pl-2">{alert.title}</h3>
                          <p className="text-sm text-slate-500 mb-4 pl-2 line-clamp-2">{alert.message}</p>
                          <div className="flex items-center justify-between pl-2 pt-2 border-t border-slate-50">
                              <span className="text-xs font-mono text-slate-400">{alert.date}</span>
                              <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1">
                                  Action <ChevronRight size={12}/>
                              </button>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Timeline Section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <CalendarClock size={20} className="text-blue-500"/> Upcoming Timeline (Nov 2024)
                  </h3>
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pl-8 py-2">
                      {[
                          { day: '11', title: 'GSTR-1 Due Date', status: 'Done', type: 'FILE' },
                          { day: '13', title: 'GSTR-6 (ISD) Due Date', status: 'Pending', type: 'FILE' },
                          { day: '20', title: 'GSTR-3B Due Date', status: 'Urgent', type: 'FILE' },
                          { day: '25', title: 'Payment of Tax (PMT-06)', status: 'Upcoming', type: 'PAY' },
                          { day: '30', title: 'ITC Reversal Deadline', status: 'Upcoming', type: 'ITC' },
                      ].map((event, i) => (
                          <div key={i} className="relative">
                              <span className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-10 bg-white ${
                                  event.status === 'Done' ? 'border-green-500 text-green-600' : 
                                  event.status === 'Urgent' ? 'border-red-500 text-red-600 animate-pulse' : 
                                  'border-slate-300 text-slate-500'
                              }`}>
                                  {event.day}
                              </span>
                              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                                  <div>
                                      <p className="font-semibold text-slate-800 text-sm">{event.title}</p>
                                      <p className="text-xs text-slate-500">Compliance Type: {event.type}</p>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                                      event.status === 'Done' ? 'bg-green-100 text-green-700' : 
                                      event.status === 'Urgent' ? 'bg-red-100 text-red-700' : 
                                      'bg-slate-200 text-slate-600'
                                  }`}>
                                      {event.status}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'VENDOR_RISK' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <VendorComplianceScorecard />
        </div>
      )}

      {activeTab === 'ITC_WATCHLIST' && (
        <ItcLedgerOptimizer tenantId={tenantId} />
      )}

      {activeTab === 'NOTIFICATIONS' && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-2 space-y-6">
               <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <div>
                   <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <Bell size={20} className="text-blue-500"/> Notification & Browser Radar Settings
                   </h3>
                   <p className="text-xs text-slate-500 mt-0.5">Configure browser desktop popups, email digests, and automated deadline triggers.</p>
                 </div>
               </div>

               {toastMsg && (
                 <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold rounded-xl animate-in fade-in">
                   {toastMsg}
                 </div>
               )}

               {/* Browser Desktop Notification Card */}
               <div className="p-5 border border-indigo-100 bg-indigo-50/40 rounded-2xl space-y-4">
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
                       <Laptop size={20} />
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-800 flex items-center gap-2">
                         Browser Desktop Notifications (Notification API)
                         <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                           browserPerm === 'granted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                         }`}>
                           Status: {browserPerm}
                         </span>
                       </h4>
                       <p className="text-xs text-slate-600 mt-0.5">
                         Receive native OS desktop popups when GST filing deadlines are within 48 hours or when high-risk compliance threats are detected.
                       </p>
                     </div>
                   </div>

                   <div 
                     onClick={() => setDesktopEnabled(!desktopEnabled)}
                     className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${desktopEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                   >
                     <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${desktopEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </div>
                 </div>

                 <div className="pt-2 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                   <span className="text-slate-500 font-medium">
                     {browserPerm === 'granted' 
                       ? 'Browser permission granted. Desktop alerts will trigger automatically.' 
                       : 'Browser permission required to show desktop popups.'}
                   </span>

                   <div className="flex items-center gap-2">
                     {browserPerm !== 'granted' && (
                       <button
                         onClick={handleEnableBrowserDesktop}
                         className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                       >
                         Request Permission
                       </button>
                     )}

                     <button
                       onClick={handleSendTestBrowserNotification}
                       className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                     >
                       Test Browser Alert
                     </button>
                   </div>
                 </div>
               </div>

               {/* Existing Channels */}
               <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50/50 transition-colors">
                       <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Mail size={20}/></div>
                           <div>
                               <h4 className="font-semibold text-slate-800 text-sm">Email Notifications</h4>
                               <p className="text-xs text-slate-500">Receive daily compliance summaries and urgent deadline alerts via email.</p>
                           </div>
                       </div>
                       <div 
                            onClick={() => setEmailEnabled(!emailEnabled)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${emailEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${emailEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                   </div>

                   <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50/50 transition-colors">
                       <div className="flex items-center gap-3">
                           <div className="p-2 bg-green-50 text-green-600 rounded-lg"><MessageSquare size={20}/></div>
                           <div>
                               <h4 className="font-semibold text-slate-800 text-sm">WhatsApp Alerts</h4>
                               <p className="text-xs text-slate-500">Get instant alerts for due dates, vendor risks, and interest penalties.</p>
                           </div>
                       </div>
                        <div 
                            onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${whatsappEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${whatsappEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                   </div>
               </div>

               {/* Slack Webhook Integration Card */}
               <div className="p-5 border border-slate-200 bg-slate-50/50 rounded-2xl space-y-4">
                   <div className="flex items-start justify-between gap-4">
                       <div className="flex items-start gap-3">
                           <div className="p-2.5 bg-[#4A154B] text-white rounded-xl shadow-sm shrink-0">
                               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                   <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.043zm0-1.262a2.528 2.528 0 0 1-2.52-2.522V6.338a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52H8.823zm-3.781 0a2.528 2.528 0 0 1-2.522-2.522 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52h-2.52zm11.304-3.782a2.528 2.528 0 0 1 2.52-2.52h2.522a2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.522h-2.522v-2.522zm-1.262 0a2.528 2.528 0 0 1-2.52 2.522H8.823a2.528 2.528 0 0 1-2.522-2.522V6.338a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043zm0 1.262a2.528 2.528 0 0 1 2.52 2.522v5.043a2.528 2.528 0 0 1-2.52 2.52H8.823a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52h5.043zm3.781 0a2.528 2.528 0 0 1 2.522 2.52v2.52h-2.522v-2.52a2.528 2.528 0 0 1 2.522-2.52h2.522z"/>
                               </svg>
                           </div>
                           <div className="space-y-1">
                               <h4 className="font-bold text-slate-800 text-sm">Slack Webhook Alerts (Regulatory Intelligence)</h4>
                               <p className="text-xs text-slate-500 leading-normal">
                                   Deliver instantaneous automated alerts to your designated Slack channels for tax rate amendments, validation schema changes, filing schedule extensions, and statutory CBIC circulars.
                               </p>
                           </div>
                       </div>
                       <div 
                           onClick={() => setSlackEventsEnabled(!slackEventsEnabled)}
                           className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${slackEventsEnabled ? 'bg-[#4A154B]' : 'bg-slate-300'}`}
                       >
                           <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${slackEventsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                       </div>
                   </div>

                   {slackEventsEnabled && (
                       <div className="space-y-3 pt-3 border-t border-slate-200/60 animate-in fade-in slide-in-from-top-1">
                           <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Incoming Webhook URL</label>
                               <div className="flex gap-2">
                                   <input 
                                       type="text" 
                                       placeholder="https://hooks.slack.com/services/T0000/B0000/XXXXXX" 
                                       value={slackWebhookUrl}
                                       onChange={(e) => setSlackWebhookUrl(e.target.value)}
                                       className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#4A154B]"
                                   />
                                   <button
                                       onClick={handleTestSlackNotification}
                                       disabled={isTestingSlack || !slackWebhookUrl}
                                       className="px-3.5 py-2 bg-[#4A154B] text-white font-bold text-xs rounded-lg hover:bg-[#3d113e] transition-all disabled:opacity-50 shrink-0"
                                   >
                                       {isTestingSlack ? 'Testing...' : 'Test Alert'}
                                   </button>
                                </div>
                               <p className="text-[10px] text-slate-400">
                                   Configure an incoming webhook on your Slack app workspace and paste the target hook URL here.
                               </p>
                           </div>

                           {slackTestStatus === 'SUCCESS' && (
                               <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                                   <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                   <span>Connection established! Test payload successfully dispatched to Slack.</span>
                               </div>
                           )}

                           {slackTestStatus === 'FAILED' && (
                               <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                                   <AlertCircle size={14} className="text-rose-600 shrink-0" />
                                   <span className="font-medium">{slackTestError}</span>
                               </div>
                           )}
                       </div>
                   )}
               </div>

               {/* Trigger Filters */}
               <div className="pt-4 border-t border-slate-100">
                   <h4 className="font-bold text-slate-800 text-sm mb-3">Browser Desktop & Multi-Channel Trigger Rules</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {[
                         'GST Filing Deadlines within 48 Hours', 
                         'Critical Compliance Risks & Non-Compliant Vendors', 
                         'ITC Expiry Warning (Invoices > 150 days)', 
                         'Blocked ITC & Penalty Risk Threshold Breaches'
                       ].map((label, i) => (
                           <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-colors">
                               <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"/>
                               <span className="text-xs font-semibold text-slate-700">{label}</span>
                           </label>
                       ))}
                   </div>
               </div>

               <div className="pt-4 flex justify-end">
                   <button 
                     onClick={() => {
                       localStorage.setItem('taxflow_slack_webhook_url', slackWebhookUrl);
                       localStorage.setItem('taxflow_slack_events_enabled', String(slackEventsEnabled));
                       saveSettings({ 
                           emailEnabled, 
                           whatsappEnabled, 
                           alerts: { dueDate: true, vendorNonCompliance: true, itcExpiry: true, returnFiling: true } 
                       });
                     }}
                     disabled={isSavingSettings}
                     className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm disabled:opacity-70 transition-all active:scale-95"
                   >
                       {isSavingSettings ? 'Saving...' : 'Save Notification Preferences'}
                   </button>
               </div>
          </div>
      )}
    </div>
  );
};

export default Compliance;