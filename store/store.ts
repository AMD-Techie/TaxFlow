import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Tenant, GstinRegistrationItem, BranchDetailsItem } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    switchTenant: (state, action: PayloadAction<string>) => {
      if (state.user) {
        // Verify user has access to this tenant
        const hasAccess = state.user.availableTenants.some(t => t.id === action.payload);
        if (hasAccess) {
          state.user.currentTenantId = action.payload;
        }
      }
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    addTenant: (state, action: PayloadAction<Tenant>) => {
      if (state.user) {
        state.user.availableTenants.push(action.payload);
      }
    }
  },
});

// --- ORGANIZATIONAL MULTI-GSTIN & BRANCH SLICE ---

interface OrgState {
  selectedGstin: string; // 'ALL' | specific GSTIN (e.g. '27ABCDE1234F1Z5')
  selectedBranchId: string; // 'ALL' | specific branch ID (e.g. 'b1')
  gstinsByTenant: Record<string, GstinRegistrationItem[]>;
  branchesByTenant: Record<string, BranchDetailsItem[]>;
}

const defaultGstins: Record<string, GstinRegistrationItem[]> = {
  't1': [
    {
      id: 'g1',
      gstin: '27ABCDE1234F1Z5',
      stateCode: '27',
      stateName: 'Maharashtra',
      registrationType: 'REGULAR',
      registrationDate: '2018-07-01',
      status: 'ACTIVE',
      filingFrequency: 'MONTHLY',
      einvoicingStatus: 'ENABLED',
      ewaybillStatus: 'ENABLED',
      isPrimary: true
    },
    {
      id: 'g2',
      gstin: '07ABCDE1234F1Z9',
      stateCode: '07',
      stateName: 'Delhi',
      registrationType: 'REGULAR',
      registrationDate: '2019-10-15',
      status: 'ACTIVE',
      filingFrequency: 'MONTHLY',
      einvoicingStatus: 'ENABLED',
      ewaybillStatus: 'ENABLED',
      isPrimary: false
    },
    {
      id: 'g3',
      gstin: '29ABCDE1234F3Z2',
      stateCode: '29',
      stateName: 'Karnataka',
      registrationType: 'SEZ_UNIT',
      registrationDate: '2021-03-20',
      status: 'ACTIVE',
      filingFrequency: 'MONTHLY',
      einvoicingStatus: 'ENABLED',
      ewaybillStatus: 'ENABLED',
      isPrimary: false
    },
    {
      id: 'g4',
      gstin: '33ABCDE1234F4Z1',
      stateCode: '33',
      stateName: 'Tamil Nadu',
      registrationType: 'REGULAR',
      registrationDate: '2022-01-10',
      status: 'ACTIVE',
      filingFrequency: 'MONTHLY',
      einvoicingStatus: 'ENABLED',
      ewaybillStatus: 'ENABLED',
      isPrimary: false
    }
  ],
  't2': [
    {
      id: 'g2-1',
      gstin: '04XYZZZ9876L1Z1',
      stateCode: '04',
      stateName: 'Chandigarh',
      registrationType: 'REGULAR',
      registrationDate: '2019-04-01',
      status: 'ACTIVE',
      filingFrequency: 'MONTHLY',
      einvoicingStatus: 'ENABLED',
      ewaybillStatus: 'ENABLED',
      isPrimary: true
    },
    {
      id: 'g2-2',
      gstin: '04XYZZZ9876L2Z2',
      stateCode: '06',
      stateName: 'Haryana',
      registrationType: 'REGULAR',
      registrationDate: '2020-08-15',
      status: 'ACTIVE',
      filingFrequency: 'MONTHLY',
      einvoicingStatus: 'ENABLED',
      ewaybillStatus: 'ENABLED',
      isPrimary: false
    }
  ]
};

const defaultBranches: Record<string, BranchDetailsItem[]> = {
  't1': [
    {
      id: 'b1',
      name: 'Mumbai HQ Office',
      code: 'MH-HQ-01',
      type: 'HEAD_OFFICE',
      address: '101 MIDC Andheri East, Mumbai, MH',
      stateCode: '27',
      stateName: 'Maharashtra',
      gstin: '27ABCDE1234F1Z5',
      contactPerson: 'Rajesh Sharma',
      contactEmail: 'rajesh.sharma@acmetech.com',
      contactPhone: '+91 98200 11223',
      status: 'ACTIVE',
      annualTurnoverContributionPct: 55
    },
    {
      id: 'b2',
      name: 'Pune Plant',
      code: 'MH-PU-02',
      type: 'FACTORY',
      address: 'Plot 44, MIDC Bhosari, Pune, MH',
      stateCode: '27',
      stateName: 'Maharashtra',
      gstin: '27ABCDE1234F1Z5',
      contactPerson: 'Suresh Patil',
      contactEmail: 'suresh.patil@acmetech.com',
      contactPhone: '+91 98220 44556',
      status: 'ACTIVE',
      annualTurnoverContributionPct: 15
    },
    {
      id: 'b3',
      name: 'Delhi Regional Hub',
      code: 'DL-RO-03',
      type: 'REGIONAL_OFFICE',
      address: 'Connaught Place, New Delhi, DL',
      stateCode: '07',
      stateName: 'Delhi',
      gstin: '07ABCDE1234F1Z9',
      contactPerson: 'Priya Verma',
      contactEmail: 'priya.verma@acmetech.com',
      contactPhone: '+91 98110 44556',
      status: 'ACTIVE',
      annualTurnoverContributionPct: 15
    },
    {
      id: 'b6',
      name: 'Bengaluru Tech Center (SEZ)',
      code: 'KA-SEZ-04',
      type: 'SEZ_UNIT',
      address: 'Electronic City Phase 1, Bengaluru, KA',
      stateCode: '29',
      stateName: 'Karnataka',
      gstin: '29ABCDE1234F3Z2',
      contactPerson: 'Arun Kumar',
      contactEmail: 'arun.kumar@acmetech.com',
      contactPhone: '+91 98450 77889',
      status: 'ACTIVE',
      annualTurnoverContributionPct: 10
    },
    {
      id: 'b7',
      name: 'Chennai Logistics Unit',
      code: 'TN-LOG-05',
      type: 'WAREHOUSE',
      address: 'Guindy Industrial Estate, Chennai, TN',
      stateCode: '33',
      stateName: 'Tamil Nadu',
      gstin: '33ABCDE1234F4Z1',
      contactPerson: 'Karthik Raja',
      contactEmail: 'karthik.raja@acmetech.com',
      contactPhone: '+91 98400 33445',
      status: 'ACTIVE',
      annualTurnoverContributionPct: 5
    }
  ],
  't2': [
    {
      id: 'b4',
      name: 'Chandigarh Main HQ',
      code: 'CH-HQ-01',
      type: 'HEAD_OFFICE',
      address: 'Sector 17, Chandigarh',
      stateCode: '04',
      stateName: 'Chandigarh',
      gstin: '04XYZZZ9876L1Z1',
      contactPerson: 'Vikram Singh',
      contactEmail: 'vikram.singh@globex.com',
      contactPhone: '+91 98760 12345',
      status: 'ACTIVE',
      annualTurnoverContributionPct: 75
    },
    {
      id: 'b5',
      name: 'Ambala Depot',
      code: 'HR-DP-02',
      type: 'WAREHOUSE',
      address: 'GT Road, Ambala, Haryana',
      stateCode: '06',
      stateName: 'Haryana',
      gstin: '04XYZZZ9876L2Z2',
      contactPerson: 'Harpreet Kaur',
      contactEmail: 'harpreet.kaur@globex.com',
      contactPhone: '+91 98720 67890',
      status: 'ACTIVE',
      annualTurnoverContributionPct: 25
    }
  ]
};

const getInitialOrgState = (): OrgState => {
  try {
    const savedGstins = localStorage.getItem('TF_ORG_GSTINS');
    const savedBranches = localStorage.getItem('TF_ORG_BRANCHES');
    const savedSelectedGstin = localStorage.getItem('TF_SELECTED_GSTIN') || 'ALL';
    const savedSelectedBranch = localStorage.getItem('TF_SELECTED_BRANCH') || 'ALL';

    return {
      selectedGstin: savedSelectedGstin,
      selectedBranchId: savedSelectedBranch,
      gstinsByTenant: savedGstins ? JSON.parse(savedGstins) : defaultGstins,
      branchesByTenant: savedBranches ? JSON.parse(savedBranches) : defaultBranches
    };
  } catch (e) {
    return {
      selectedGstin: 'ALL',
      selectedBranchId: 'ALL',
      gstinsByTenant: defaultGstins,
      branchesByTenant: defaultBranches
    };
  }
};

const initialOrgState: OrgState = getInitialOrgState();

const orgSlice = createSlice({
  name: 'org',
  initialState: initialOrgState,
  reducers: {
    setSelectedGstin: (state, action: PayloadAction<string>) => {
      state.selectedGstin = action.payload;
      try {
        localStorage.setItem('TF_SELECTED_GSTIN', action.payload);
      } catch (e) {}
    },
    setSelectedBranch: (state, action: PayloadAction<string>) => {
      state.selectedBranchId = action.payload;
      try {
        localStorage.setItem('TF_SELECTED_BRANCH', action.payload);
      } catch (e) {}
    },
    setGstinsForTenant: (state, action: PayloadAction<{ tenantId: string; gstins: GstinRegistrationItem[] }>) => {
      state.gstinsByTenant[action.payload.tenantId] = action.payload.gstins;
      try {
        localStorage.setItem('TF_ORG_GSTINS', JSON.stringify(state.gstinsByTenant));
      } catch (e) {}
    },
    setBranchesForTenant: (state, action: PayloadAction<{ tenantId: string; branches: BranchDetailsItem[] }>) => {
      state.branchesByTenant[action.payload.tenantId] = action.payload.branches;
      try {
        localStorage.setItem('TF_ORG_BRANCHES', JSON.stringify(state.branchesByTenant));
      } catch (e) {}
    },
    addGstinRegistration: (state, action: PayloadAction<{ tenantId: string; gstin: GstinRegistrationItem }>) => {
      const { tenantId, gstin } = action.payload;
      if (!state.gstinsByTenant[tenantId]) {
        state.gstinsByTenant[tenantId] = [];
      }
      state.gstinsByTenant[tenantId].push(gstin);
      try {
        localStorage.setItem('TF_ORG_GSTINS', JSON.stringify(state.gstinsByTenant));
      } catch (e) {}
    },
    addBranch: (state, action: PayloadAction<{ tenantId: string; branch: BranchDetailsItem }>) => {
      const { tenantId, branch } = action.payload;
      if (!state.branchesByTenant[tenantId]) {
        state.branchesByTenant[tenantId] = [];
      }
      state.branchesByTenant[tenantId].push(branch);
      try {
        localStorage.setItem('TF_ORG_BRANCHES', JSON.stringify(state.branchesByTenant));
      } catch (e) {}
    },
    deleteGstinRegistration: (state, action: PayloadAction<{ tenantId: string; gstinId: string }>) => {
      const { tenantId, gstinId } = action.payload;
      if (state.gstinsByTenant[tenantId]) {
        state.gstinsByTenant[tenantId] = state.gstinsByTenant[tenantId].filter(g => g.id !== gstinId);
        try {
          localStorage.setItem('TF_ORG_GSTINS', JSON.stringify(state.gstinsByTenant));
        } catch (e) {}
      }
    },
    deleteBranch: (state, action: PayloadAction<{ tenantId: string; branchId: string }>) => {
      const { tenantId, branchId } = action.payload;
      if (state.branchesByTenant[tenantId]) {
        state.branchesByTenant[tenantId] = state.branchesByTenant[tenantId].filter(b => b.id !== branchId);
        try {
          localStorage.setItem('TF_ORG_BRANCHES', JSON.stringify(state.branchesByTenant));
        } catch (e) {}
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(authSlice.actions.switchTenant, (state) => {
      // When switching tenant, reset selectedGstin to ALL so the user sees aggregate or they can pick specific GSTIN
      state.selectedGstin = 'ALL';
      state.selectedBranchId = 'ALL';
      try {
        localStorage.setItem('TF_SELECTED_GSTIN', 'ALL');
        localStorage.setItem('TF_SELECTED_BRANCH', 'ALL');
      } catch (e) {}
    });
  }
});

export const { login, logout, switchTenant, updateProfile, addTenant } = authSlice.actions;
export const { 
  setSelectedGstin, 
  setSelectedBranch, 
  setGstinsForTenant, 
  setBranchesForTenant, 
  addGstinRegistration, 
  addBranch,
  deleteGstinRegistration,
  deleteBranch 
} = orgSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    org: orgSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;