import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { UserRole } from './types';
import Layout from './components/Layout';
import Login from './pages/Login';

// Lazy load pages to improve performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Reconciliation = lazy(() => import('./pages/Reconciliation'));
const Filing = lazy(() => import('./pages/Filing'));
const Settings = lazy(() => import('./pages/Settings'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Computation = lazy(() => import('./pages/Computation'));
const Compliance = lazy(() => import('./pages/Compliance'));
const TransactionCompliancePage = lazy(() => import('./pages/TransactionCompliancePage'));
const Reports = lazy(() => import('./pages/Reports'));
const RiskAnalysis = lazy(() => import('./pages/RiskAnalysis'));
const TaxForecastingPage = lazy(() => import('./pages/TaxForecastingPage'));
const Portal = lazy(() => import('./pages/Portal'));
const VendorPortal = lazy(() => import('./pages/VendorPortal'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Organization = lazy(() => import('./pages/Organization'));
const GstinVerificationPage = lazy(() => import('./pages/GstinVerificationPage'));
const DataQualityPage = lazy(() => import('./pages/DataQualityPage'));
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage'));
const PartyMasterPage = lazy(() => import('./pages/PartyMasterPage'));
const EInvoicePage = lazy(() => import('./pages/EInvoicePage'));
const EWayBillPage = lazy(() => import('./pages/EWayBillPage'));
const DocumentVaultPage = lazy(() => import('./pages/DocumentVaultPage'));
const ControlTowerPage = lazy(() => import('./pages/ControlTowerPage'));
const ExceptionInboxPage = lazy(() => import('./pages/ExceptionInboxPage'));
const RefundStatusDashboard = lazy(() => import('./pages/RefundStatusDashboard'));
const RegulatoryIntelligencePage = lazy(() => import('./pages/RegulatoryIntelligencePage'));
const GstRateCalculatorPage = lazy(() => import('./pages/GstRateCalculatorPage'));
const ComplianceArchivePage = lazy(() => import('./pages/ComplianceArchivePage'));

import InactivityTracker from './components/InactivityTracker';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { syncOfflineData, setActiveUser } from './services/api';
import { WorkspaceSyncProvider } from './components/WorkspaceSyncContext';
import { LanguageProvider } from './utils/i18n';

// RBAC Configuration
const routePermissions: Record<string, UserRole[]> = {
  '/': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/architecture': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/control-tower': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/exceptions': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/organization': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/parties': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/invoices': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/einvoice': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/ewaybill': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/gstin-verification': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/data-quality': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/reconciliation': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/rate-calculator': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/hsn-finder': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/computation': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/transaction-compliance': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/compliance': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/compliance-archive': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/filing': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/approvals': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/reports': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/risk-analysis': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/tax-forecasting': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/vault': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/refunds': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/regulatory-intelligence': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.VIEWER, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/integrations': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
  '/settings': [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  '/audit': [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AUDITOR, UserRole.FINANCE_MANAGER, UserRole.SUPER_ADMIN],
};

// Simple hash router hook
const useHashLocation = () => {
  const [loc, setLoc] = useState(window.location.hash.replace('#', '') || '/');
  useEffect(() => {
    const handler = () => setLoc(window.location.hash.replace('#', '') || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  const navigate = (path: string) => {
    window.location.hash = path;
  };
  return { location: loc, navigate };
};

const Unauthorized = ({ role }: { role?: string }) => (
  <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-in fade-in zoom-in duration-300">
    <div className="bg-red-50 p-6 rounded-full mb-6 ring-8 ring-red-50/50">
      <ShieldAlert size={64} className="text-red-600" />
    </div>
    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Access Denied</h1>
    <p className="text-slate-500 mt-3 max-w-md mx-auto text-lg">
      You do not have permission to view this page.
    </p>
    <div className="mt-4 inline-flex items-center gap-2 text-sm bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-medium">
      Current Role: <span className="uppercase">{role || 'Unknown'}</span>
    </div>
    <button 
      onClick={() => window.location.hash = '/'} 
      className="mt-8 px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
    >
      Back to Dashboard
    </button>
  </div>
);

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 size={32} className="text-indigo-600 animate-spin" />
  </div>
);

const App: React.FC = () => {
  const { location, navigate } = useHashLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const isPortalRoute = location.startsWith('/portal/');
  const isVendorPortalRoute = location.startsWith('/vendor-portal/');

  // Protected route logic
  useEffect(() => {
    if (!isAuthenticated && location !== '/login' && !isPortalRoute && !isVendorPortalRoute) {
      navigate('/login');
    } else if (isAuthenticated && location === '/login') {
      navigate('/');
    }
  }, [isAuthenticated, location, isPortalRoute, isVendorPortalRoute]);

  // Offline Sync Management
  useEffect(() => {
    // Try to sync on load if online
    if (navigator.onLine) {
        syncOfflineData();
    }

    const handleOnline = () => {
        console.log("Network restored. Syncing offline changes...");
        syncOfflineData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Synchronize Redux user with API active user for auditing
  useEffect(() => {
    setActiveUser(user);
  }, [user]);

  if (isPortalRoute) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 size={40} className="animate-spin text-indigo-600"/></div>}>
        <Portal />
      </Suspense>
    );
  }

  if (isVendorPortalRoute) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 size={40} className="animate-spin text-indigo-600"/></div>}>
        <VendorPortal />
      </Suspense>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => navigate('/')} />;
  }

  const renderContent = () => {
    // RBAC Check
    const allowedRoles = routePermissions[location];
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return <Unauthorized role={user.role} />;
    }

    switch (location) {
      case '/':
        return <Dashboard />;
      case '/architecture':
      case '/control-tower':
        return <ControlTowerPage />;
      case '/exceptions':
        return <ExceptionInboxPage />;
      case '/organization':
        return <Organization />;
      case '/invoices':
        return <Invoices />;
      case '/einvoice':
        return <EInvoicePage />;
      case '/ewaybill':
        return <EWayBillPage />;
      case '/gstin-verification':
        return <GstinVerificationPage />;
      case '/data-quality':
        return <DataQualityPage />;
      case '/reconciliation':
        return <Reconciliation />;
      case '/rate-calculator':
      case '/hsn-finder':
        return <GstRateCalculatorPage />;
      case '/computation':
        return <Computation />;
      case '/parties':
        return <PartyMasterPage />;
      case '/transaction-compliance':
        return <TransactionCompliancePage />;
      case '/compliance':
        return <Compliance />;
      case '/compliance-archive':
        return <ComplianceArchivePage />;
      case '/filing':
        return <Filing />;
      case '/approvals':
        return <ApprovalsPage />;
      case '/reports':
        return <Reports />;
      case '/risk-analysis':
        return <RiskAnalysis />;
      case '/tax-forecasting':
        return <TaxForecastingPage />;
      case '/vault':
        return <DocumentVaultPage />;
      case '/refunds':
        return <RefundStatusDashboard />;
      case '/regulatory-intelligence':
        return <RegulatoryIntelligencePage />;
      case '/integrations':
        return <Integrations />;
      case '/settings':
        return <Settings />;
      case '/audit':
        return <AuditLogs />;
      case '/setup': 
        navigate('/settings');
        return <Settings />;
      default:
        // Handle undefined routes safely, defaulting to dashboard or 404
        return <Dashboard />;
    }
  };

  return (
    <>
      <InactivityTracker />
      <LanguageProvider>
      <WorkspaceSyncProvider currentPath={location} onNavigate={navigate}>
        <Layout currentPath={location} onNavigate={navigate}>
          <Suspense fallback={<PageLoader />}>
            {renderContent()}
          </Suspense>
        </Layout>
      </WorkspaceSyncProvider>
      </LanguageProvider>
    </>
  );
};

export default App;