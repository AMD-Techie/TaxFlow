import React from 'react';
import { Tenant } from '../../types';
import { 
  Building2, Layers, CheckCircle2, ChevronRight, ArrowLeft, 
  MapPin, ShieldCheck, TrendingUp, Filter, Sparkles
} from 'lucide-react';

interface IndividualCompanyHeaderProps {
  currentTenant: Tenant;
  availableTenants: Tenant[];
  onSelectTenant: (tenantId: string) => void;
  onSwitchToGroupDashboard: () => void;
  tenantStats: any;
  totalGroupSales: number;
}

export const IndividualCompanyHeader: React.FC<IndividualCompanyHeaderProps> = ({
  currentTenant,
  availableTenants,
  onSelectTenant,
  onSwitchToGroupDashboard,
  tenantStats,
  totalGroupSales
}) => {
  const currentSales = tenantStats?.sales || 0;
  const salesShare = totalGroupSales > 0 ? Math.round((currentSales / totalGroupSales) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-5">
      {/* Top Breadcrumb & Switch To Group Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onSwitchToGroupDashboard}
            className="font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors group"
          >
            <Layers size={14} className="text-slate-400 group-hover:text-indigo-600" />
            <span>Group Level Dashboard</span>
          </button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Individual Company View
          </span>
        </div>

        <button
          onClick={onSwitchToGroupDashboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 transition-all shadow-xs"
        >
          <ArrowLeft size={13} />
          <span>Back to Group Consolidated View</span>
        </button>
      </div>

      {/* Main Company Identity & Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 shrink-0">
            {currentTenant.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {currentTenant.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                GSTIN: {currentTenant.gstin}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 size={11} /> Active Filer
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-slate-400" />
                {currentTenant.address || 'Corporate Registered Office'}
              </span>
              <span className="font-mono text-slate-400">State Code: {currentTenant.stateCode}</span>
              <span className="flex items-center gap-1 text-blue-700 font-bold bg-blue-50/80 px-2 py-0.5 rounded">
                <TrendingUp size={12} />
                {salesShare}% of Group Revenue
              </span>
            </div>
          </div>
        </div>

        {/* Quick Switch to other company */}
        <div className="flex flex-col items-start lg:items-end gap-1.5 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Switch Operating Company
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {availableTenants.map(t => {
              const isSelected = t.id === currentTenant.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTenant(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Building2 size={13} />
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
