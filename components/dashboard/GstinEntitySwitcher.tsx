import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, switchTenant, setSelectedGstin, setSelectedBranch } from '../../store/store';
import { Tenant, UserRole } from '../../types';
import { 
  Layers, Building, CheckCircle2, TrendingUp, ShieldCheck, 
  ArrowUpRight, IndianRupee, Percent, Plus, MapPin, GitBranch, Check
} from 'lucide-react';

interface GstinEntitySwitcherProps {
  availableTenants: Tenant[];
  selectedEntityId: string; // 'AGGREGATE' or specific tenantId
  onSelectEntity: (id: string) => void;
  allTenantStats: { [tenantId: string]: any };
}

export const GstinEntitySwitcher: React.FC<GstinEntitySwitcherProps> = ({
  availableTenants = [],
  selectedEntityId,
  onSelectEntity,
  allTenantStats
}) => {
  const dispatch = useDispatch();
  const selectedGstin = useSelector((state: RootState) => state.org.selectedGstin);
  const selectedBranchId = useSelector((state: RootState) => state.org.selectedBranchId);
  const gstinsByTenant = useSelector((state: RootState) => state.org.gstinsByTenant);
  const branchesByTenant = useSelector((state: RootState) => state.org.branchesByTenant);
  
  // Calculate aggregate metrics
  let totalSales = 0;
  let totalLiability = 0;
  let totalItc = 0;
  
  Object.keys(allTenantStats).forEach(tid => {
    const s = allTenantStats[tid];
    if (s) {
      totalSales += s.sales || 0;
      totalLiability += s.liability || 0;
      totalItc += s.itc || 0;
    }
  });

  const handleSelect = (id: string) => {
    onSelectEntity(id);
    if (id !== 'AGGREGATE') {
      // Keep global tenant state in sync for multi-page continuity
      dispatch(switchTenant(id));
      dispatch(setSelectedGstin('ALL'));
      dispatch(setSelectedBranch('ALL'));
    }
  };

  const currentGstins = selectedEntityId !== 'AGGREGATE' 
    ? (gstinsByTenant[selectedEntityId] || [])
    : [];
  const currentBranches = selectedEntityId !== 'AGGREGATE'
    ? (branchesByTenant[selectedEntityId] || [])
    : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="text-indigo-600" size={18} /> Entity & GSTIN Multi-Registration Switchboard
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Toggle between corporate aggregate views or specific state-wise GSTIN nodes and regional branches for granular transactional analysis.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500">Active Focus:</span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            selectedGstin === 'ALL' && selectedBranchId === 'ALL'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {selectedGstin === 'ALL' ? 'Consolidated Group View' : `GSTIN: ${selectedGstin}`}
          </span>
          {selectedBranchId !== 'ALL' && (
            <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1">
              <MapPin size={11} /> Branch Filter Active
            </span>
          )}
        </div>
      </div>

      {/* Grid of Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: AGGREGATE ACCOUNT VIEW */}
        <div 
          onClick={() => {
            handleSelect('AGGREGATE');
            dispatch(setSelectedGstin('ALL'));
            dispatch(setSelectedBranch('ALL'));
          }}
          className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
            selectedEntityId === 'AGGREGATE' && selectedGstin === 'ALL'
              ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-600'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          {selectedEntityId === 'AGGREGATE' && selectedGstin === 'ALL' && (
            <div className="absolute top-3 right-3 text-indigo-600">
              <CheckCircle2 size={18} className="fill-indigo-100" />
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Layers size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Aggregate View</h4>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">ALL MAPPED ENTITIES</p>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Consolidated Sales</span>
                <span className="text-sm font-extrabold text-slate-900">₹{totalSales.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Avg. Compliance</span>
                <span className="text-sm font-extrabold text-indigo-700 flex items-center gap-1">
                  <ShieldCheck size={14} /> 88%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Corporate Rollup Summary</span>
            <span className="text-indigo-600 flex items-center gap-0.5">Active <ArrowUpRight size={14}/></span>
          </div>
        </div>

        {/* CARDS 2+: INDIVIDUAL GSTIN TENANTS */}
        {availableTenants.map((tenant) => {
          const stats = allTenantStats[tenant.id] || { sales: 0, liability: 0, itc: 0 };
          const salesContr = totalSales > 0 ? Math.round((stats.sales / totalSales) * 100) : 0;
          const isSelected = selectedEntityId === tenant.id;
          const isT2 = tenant.id === 't2';
          const score = isT2 ? 82 : 94;
          const tenantGstinList = gstinsByTenant[tenant.id] || [];

          return (
            <div 
              key={tenant.id}
              onClick={() => handleSelect(tenant.id)}
              className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-indigo-600">
                  <CheckCircle2 size={18} className="fill-indigo-100" />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 font-bold text-sm">
                    {tenant.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{tenant.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">{tenant.gstin}</p>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Gross Sales</span>
                    <span className="text-sm font-extrabold text-slate-900">₹{stats.sales.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Compliance Rating</span>
                    <span className={`text-sm font-extrabold flex items-center gap-1 ${
                      score >= 90 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      <ShieldCheck size={14} /> {score}%
                    </span>
                  </div>
                </div>

                {/* Contribution visualizer */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>SALES SHARE</span>
                    <span>{salesContr}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-indigo-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${salesContr}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold uppercase">
                  {tenantGstinList.length} Registrations
                </span>
                <span className="text-indigo-600 hover:underline text-xs flex items-center gap-0.5">Focus Entity &rarr;</span>
              </div>
            </div>
          );
        })}

      </div>

      {/* State-Wise Registrations & Branch Quick Filters if an entity is focused */}
      {selectedEntityId !== 'AGGREGATE' && currentGstins.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
              <Building size={14} className="text-indigo-600" />
              State GSTIN Registrations ({currentGstins.length})
            </span>
            {selectedGstin !== 'ALL' && (
              <button 
                onClick={() => {
                  dispatch(setSelectedGstin('ALL'));
                  dispatch(setSelectedBranch('ALL'));
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Clear GSTIN Filter (Show All)
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                dispatch(setSelectedGstin('ALL'));
                dispatch(setSelectedBranch('ALL'));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                selectedGstin === 'ALL'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers size={13} />
              <span>All Registrations</span>
            </button>

            {currentGstins.map((g) => {
              const isGstinActive = selectedGstin === g.gstin;
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    dispatch(setSelectedGstin(g.gstin));
                    dispatch(setSelectedBranch('ALL'));
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isGstinActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono">{g.stateCode}</span>
                  <span>{g.stateName}</span>
                  {g.isPrimary && <span className={`text-[9px] px-1 rounded ${isGstinActive ? 'bg-indigo-800 text-indigo-200' : 'bg-amber-100 text-amber-800'}`}>HQ</span>}
                  {isGstinActive && <Check size={12} strokeWidth={3} />}
                </button>
              );
            })}
          </div>

          {/* Regional Branches Under Selected Registration */}
          {currentBranches.length > 0 && (
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={12} /> Regional Branches:
              </span>
              <button
                onClick={() => dispatch(setSelectedBranch('ALL'))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  selectedBranchId === 'ALL'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Branches
              </button>
              {currentBranches
                .filter(b => selectedGstin === 'ALL' || b.gstin === selectedGstin)
                .map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => {
                      dispatch(setSelectedBranch(branch.id));
                      if (selectedGstin === 'ALL' && branch.gstin) {
                        dispatch(setSelectedGstin(branch.gstin));
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-all ${
                      selectedBranchId === branch.id
                        ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{branch.name}</span>
                    <span className="text-[10px] opacity-70">({branch.code})</span>
                  </button>
                ))
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};
