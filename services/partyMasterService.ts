// Customer & Vendor Master Service
// Handles storage, validation, GSTIN structure extraction, and filtering for Parties

export type MsmeStatus = 'MICRO' | 'SMALL' | 'MEDIUM' | 'NON_MSME';

export type CreditTerms = 
  | 'NET_15'
  | 'NET_30'
  | 'NET_45'
  | 'NET_60'
  | 'NET_90'
  | 'DUE_ON_RECEIPT'
  | 'ADVANCE';

export interface PartyContact {
  name: string;
  email: string;
  phone: string;
  designation?: string;
}

export interface CustomerMaster {
  id: string;
  customerCode: string;
  name: string;
  tradeName?: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  stateCode: string;
  contact: PartyContact;
  creditTerms: CreditTerms;
  creditLimitINR?: number;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface VendorMaster {
  id: string;
  vendorCode: string;
  name: string;
  tradeName?: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  stateCode: string;
  contact: PartyContact;
  reverseCharge: boolean; // RCM Applicable
  compositionScheme: boolean; // Composition Scheme Taxpayer
  msmeStatus: MsmeStatus;
  udyamRegistrationNo?: string;
  vendorCategories: string[];
  creditTerms: CreditTerms;
  status: 'ACTIVE' | 'INACTIVE';
  bankDetails?: BankDetails;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const CUSTOMER_STORAGE_KEY = 'TF_CUSTOMER_MASTER_V1';
const VENDOR_STORAGE_KEY = 'TF_VENDOR_MASTER_V1';

// Available Vendor Category Presets
export const VENDOR_CATEGORY_OPTIONS = [
  'Raw Material & Tooling',
  'Freight & Goods Transport (GTA)',
  'Legal & Professional Services',
  'IT & SaaS Services',
  'Logistics & Warehousing',
  'Capital Goods & Machinery',
  'Maintenance & Repairs',
  'Packaging Materials',
  'Contract Labor & Staffing',
  'Subcontracting & Job Work',
  'Marketing & Advertising',
  'Utilities & Rent'
];

export const CREDIT_TERMS_LABELS: Record<CreditTerms, string> = {
  NET_15: 'Net 15 Days',
  NET_30: 'Net 30 Days',
  NET_45: 'Net 45 Days',
  NET_60: 'Net 60 Days',
  NET_90: 'Net 90 Days',
  DUE_ON_RECEIPT: 'Due on Receipt',
  ADVANCE: '100% Advance Payment'
};

export const MSME_STATUS_LABELS: Record<MsmeStatus, { label: string; badge: string; desc: string }> = {
  MICRO: { label: 'Micro Enterprise', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Investment <= ₹1 Cr & Turnover <= ₹5 Cr' },
  SMALL: { label: 'Small Enterprise', badge: 'bg-blue-100 text-blue-800 border-blue-300', desc: 'Investment <= ₹10 Cr & Turnover <= ₹50 Cr' },
  MEDIUM: { label: 'Medium Enterprise', badge: 'bg-purple-100 text-purple-800 border-purple-300', desc: 'Investment <= ₹50 Cr & Turnover <= ₹250 Cr' },
  NON_MSME: { label: 'Non-MSME Large Enterprise', badge: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'Large Enterprise Exceeding MSME Criteria' }
};

// Initial Mock Seed Data
const INITIAL_CUSTOMERS: CustomerMaster[] = [
  {
    id: 'cust-101',
    customerCode: 'CUST-2026-001',
    name: 'Reliance Retail Limited',
    tradeName: 'Reliance Smart & Digital',
    gstin: '27AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    address: 'Reliance Corporate Park, Building 4, Thane Belapur Road',
    city: 'Navi Mumbai',
    pincode: '400701',
    state: 'Maharashtra',
    stateCode: '27',
    contact: {
      name: 'Rajesh Verma',
      email: 'rajesh.v@relianceretail.com',
      phone: '+91 98200 11223',
      designation: 'Senior General Manager - Accounts Payable'
    },
    creditTerms: 'NET_30',
    creditLimitINR: 5000000,
    status: 'ACTIVE',
    notes: 'Key Enterprise Account. Requires monthly E-Invoicing B2B CSV upload before 5th.',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-07-20T14:30:00Z'
  },
  {
    id: 'cust-102',
    customerCode: 'CUST-2026-002',
    name: 'Tata Consultancy Services Ltd',
    tradeName: 'TCS Innovation Labs',
    gstin: '27AAACT2727Q1ZB',
    pan: 'AAACT2727Q',
    address: 'TCS House, Raveline Street, Fort',
    city: 'Mumbai',
    pincode: '400001',
    state: 'Maharashtra',
    stateCode: '27',
    contact: {
      name: 'Priya Mehta',
      email: 'p.mehta@tcs.com',
      phone: '+91 98190 44556',
      designation: 'Head of Finance & Procurement'
    },
    creditTerms: 'NET_45',
    creditLimitINR: 12000000,
    status: 'ACTIVE',
    notes: 'Requires Digital Signature on all Debit Notes & Tax Invoices.',
    createdAt: '2026-02-15T09:30:00Z',
    updatedAt: '2026-06-18T11:20:00Z'
  },
  {
    id: 'cust-103',
    customerCode: 'CUST-2026-003',
    name: 'Infosys Limited',
    tradeName: 'Infosys SEZ Campus',
    gstin: '29AAACI4843L1ZD',
    pan: 'AAACI4843L',
    address: 'Plot 44, Electronics City, Hosur Road',
    city: 'Bengaluru',
    pincode: '560100',
    state: 'Karnataka',
    stateCode: '29',
    contact: {
      name: 'Suresh Rao',
      email: 'suresh.rao@infosys.com',
      phone: '+91 98450 77889',
      designation: 'VP - Tax Operations'
    },
    creditTerms: 'NET_60',
    creditLimitINR: 8500000,
    status: 'ACTIVE',
    notes: 'SEZ Unit supply with payment of tax under LUT endorsement.',
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-07-02T16:45:00Z'
  },
  {
    id: 'cust-104',
    customerCode: 'CUST-2026-004',
    name: 'Bharti Airtel Limited',
    tradeName: 'Airtel Enterprise Business',
    gstin: '07AAACB2894G1ZN',
    pan: 'AAACB2894G',
    address: 'Bharti Crescent, 1 Nelson Mandela Road, Vasant Kunj',
    city: 'New Delhi',
    pincode: '110070',
    state: 'Delhi',
    stateCode: '07',
    contact: {
      name: 'Ankit Sharma',
      email: 'ankit.sharma@airtel.in',
      phone: '+91 98110 99001',
      designation: 'Commercial Manager'
    },
    creditTerms: 'NET_15',
    creditLimitINR: 3500000,
    status: 'ACTIVE',
    notes: 'Telecom partner. Monthly B2B invoice auto-cross matched with e-Way bills.',
    createdAt: '2026-04-12T15:10:00Z',
    updatedAt: '2026-05-30T10:00:00Z'
  }
];

const INITIAL_VENDORS: VendorMaster[] = [
  {
    id: 'vend-201',
    vendorCode: 'VEND-2026-001',
    name: 'Amazon Seller Services Pvt Ltd',
    tradeName: 'Amazon Web Services India',
    gstin: '27AABCA3241R1ZM',
    pan: 'AABCA3241R',
    address: 'Floor 14, BKC Annexe, Bandra East',
    city: 'Mumbai',
    pincode: '400051',
    state: 'Maharashtra',
    stateCode: '27',
    contact: {
      name: 'Amit Saxena',
      email: 'amit.s@amazon.in',
      phone: '+91 98210 33445',
      designation: 'Enterprise Partner Manager'
    },
    reverseCharge: false,
    compositionScheme: false,
    msmeStatus: 'NON_MSME',
    vendorCategories: ['IT & SaaS Services', 'Logistics & Warehousing'],
    creditTerms: 'NET_30',
    status: 'ACTIVE',
    bankDetails: {
      accountName: 'Amazon Seller Services Pvt Ltd',
      accountNumber: '000405009823',
      ifscCode: 'ICIC0000004',
      bankName: 'ICICI Bank BKC Branch'
    },
    notes: 'Primary Cloud Hosting Provider. GSTR-2B ITC reflects on 12th of every month.',
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-07-22T09:15:00Z'
  },
  {
    id: 'vend-202',
    vendorCode: 'VEND-2026-002',
    name: 'Precision Components India LLP',
    tradeName: 'Precision Tech Machining',
    gstin: '27AAAFP1234K1Z2',
    pan: 'AAAFP1234K',
    address: 'Plot 42, MIDC Industrial Area, Chakan',
    city: 'Pune',
    pincode: '410501',
    state: 'Maharashtra',
    stateCode: '27',
    contact: {
      name: 'Vikas Shinde',
      email: 'vikas@precisioncomp.co.in',
      phone: '+91 97650 12345',
      designation: 'Managing Partner'
    },
    reverseCharge: false,
    compositionScheme: false,
    msmeStatus: 'SMALL',
    udyamRegistrationNo: 'UDYAM-MH-26-0012345',
    vendorCategories: ['Raw Material & Tooling', 'Subcontracting & Job Work'],
    creditTerms: 'NET_45',
    status: 'ACTIVE',
    bankDetails: {
      accountName: 'Precision Components India LLP',
      accountNumber: '918020033144',
      ifscCode: 'UTIB0000214',
      bankName: 'Axis Bank Chakan'
    },
    notes: 'MSME Small Enterprise. mandatory 45-day MSME payment cycle applies under Section 43B(h).',
    createdAt: '2026-02-01T11:20:00Z',
    updatedAt: '2026-07-15T14:10:00Z'
  },
  {
    id: 'vend-203',
    vendorCode: 'VEND-2026-003',
    name: 'Legal & Regulatory Advisory Partners',
    tradeName: 'Sundaram & Associates Legal',
    gstin: '07AAAAA9999B1Z0',
    pan: 'AAAAA9999B',
    address: '12 Barakhamba Road, Connaught Place',
    city: 'New Delhi',
    pincode: '110001',
    state: 'Delhi',
    stateCode: '07',
    contact: {
      name: 'Adv. Meenakshi Sundaram',
      email: 'm.sundaram@legalpartners.in',
      phone: '+91 98100 55667',
      designation: 'Managing Counsel'
    },
    reverseCharge: true, // RCM applicable on legal advocate services
    compositionScheme: false,
    msmeStatus: 'MICRO',
    udyamRegistrationNo: 'UDYAM-DL-01-0008821',
    vendorCategories: ['Legal & Professional Services'],
    creditTerms: 'DUE_ON_RECEIPT',
    status: 'ACTIVE',
    bankDetails: {
      accountName: 'Sundaram & Associates Legal',
      accountNumber: '002901004512',
      ifscCode: 'HDFC0000029',
      bankName: 'HDFC Bank Connaught Place'
    },
    notes: 'REVERSE CHARGE APPLICABLE (RCM). Recipient is liable to pay GST directly under Section 9(3).',
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-06-25T16:30:00Z'
  },
  {
    id: 'vend-204',
    vendorCode: 'VEND-2026-004',
    name: 'SpeedJet Logistics & Freight Ltd',
    tradeName: 'SpeedJet Express GTA',
    gstin: '24AAACS5432E1Z8',
    pan: 'AAACS5432E',
    address: 'Transport Nagar, Narol Industrial Estate',
    city: 'Ahmedabad',
    pincode: '382405',
    state: 'Gujarat',
    stateCode: '24',
    contact: {
      name: 'Ramesh Patel',
      email: 'ramesh@speedjetlogistics.com',
      phone: '+91 98980 22110',
      designation: 'General Manager - Fleet'
    },
    reverseCharge: true, // RCM on GTA service (5% without ITC)
    compositionScheme: false,
    msmeStatus: 'MEDIUM',
    udyamRegistrationNo: 'UDYAM-GJ-03-0045129',
    vendorCategories: ['Freight & Goods Transport (GTA)', 'Logistics & Warehousing'],
    creditTerms: 'NET_15',
    status: 'ACTIVE',
    bankDetails: {
      accountName: 'SpeedJet Logistics & Freight Ltd',
      accountNumber: '30982341209',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India Ahmedabad'
    },
    notes: 'Goods Transport Agency (GTA). 5% GST payable by us under RCM.',
    createdAt: '2026-04-05T10:30:00Z',
    updatedAt: '2026-07-10T11:00:00Z'
  },
  {
    id: 'vend-205',
    vendorCode: 'VEND-2026-005',
    name: 'GreenLeaf Packaging Products',
    tradeName: 'GreenLeaf Eco Packs',
    gstin: '27AABFG8812H1ZP',
    pan: 'AABFG8812H',
    address: 'Shop 14, Sector 19, APMC Market, Vashi',
    city: 'Navi Mumbai',
    pincode: '400703',
    state: 'Maharashtra',
    stateCode: '27',
    contact: {
      name: 'Sunita Gupta',
      email: 'sunita@greenleafpack.in',
      phone: '+91 98330 66778',
      designation: 'Proprietor'
    },
    reverseCharge: false,
    compositionScheme: true, // Composition Dealer
    msmeStatus: 'MICRO',
    udyamRegistrationNo: 'UDYAM-MH-26-0099412',
    vendorCategories: ['Packaging Materials'],
    creditTerms: 'ADVANCE',
    status: 'ACTIVE',
    bankDetails: {
      accountName: 'GreenLeaf Packaging Products',
      accountNumber: '501002341290',
      ifscCode: 'HDFC0000100',
      bankName: 'HDFC Bank Vashi'
    },
    notes: 'COMPOSITION TAXPAYER. No ITC can be claimed on tax charged by composition suppliers.',
    createdAt: '2026-05-18T13:20:00Z',
    updatedAt: '2026-07-01T09:00:00Z'
  }
];

// LocalStorage Helper Functions
export const loadCustomers = (): CustomerMaster[] => {
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load customers:', err);
    return INITIAL_CUSTOMERS;
  }
};

export const saveCustomers = (customers: CustomerMaster[]) => {
  try {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
  } catch (err) {
    console.error('Failed to save customers:', err);
  }
};

export const loadVendors = (): VendorMaster[] => {
  try {
    const raw = localStorage.getItem(VENDOR_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(INITIAL_VENDORS));
      return INITIAL_VENDORS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load vendors:', err);
    return INITIAL_VENDORS;
  }
};

export const saveVendors = (vendors: VendorMaster[]) => {
  try {
    localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(vendors));
  } catch (err) {
    console.error('Failed to save vendors:', err);
  }
};

// CRUD Operations for Customers
export const createCustomer = (data: Omit<CustomerMaster, 'id' | 'customerCode' | 'createdAt' | 'updatedAt'>): CustomerMaster => {
  const current = loadCustomers();
  const nextNum = current.length + 1;
  const code = `CUST-2026-${String(nextNum).padStart(3, '0')}`;
  
  const newCustomer: CustomerMaster = {
    ...data,
    id: `cust-${Date.now()}`,
    customerCode: code,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [newCustomer, ...current];
  saveCustomers(updated);
  return newCustomer;
};

export const updateCustomer = (id: string, data: Partial<CustomerMaster>): CustomerMaster => {
  const current = loadCustomers();
  const index = current.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Customer not found');

  const updatedItem: CustomerMaster = {
    ...current[index],
    ...data,
    updatedAt: new Date().toISOString()
  };

  current[index] = updatedItem;
  saveCustomers(current);
  return updatedItem;
};

export const deleteCustomer = (id: string) => {
  const current = loadCustomers();
  const filtered = current.filter(c => c.id !== id);
  saveCustomers(filtered);
};

// CRUD Operations for Vendors
export const createVendor = (data: Omit<VendorMaster, 'id' | 'vendorCode' | 'createdAt' | 'updatedAt'>): VendorMaster => {
  const current = loadVendors();
  const nextNum = current.length + 1;
  const code = `VEND-2026-${String(nextNum).padStart(3, '0')}`;

  const newVendor: VendorMaster = {
    ...data,
    id: `vend-${Date.now()}`,
    vendorCode: code,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [newVendor, ...current];
  saveVendors(updated);
  return newVendor;
};

export const updateVendor = (id: string, data: Partial<VendorMaster>): VendorMaster => {
  const current = loadVendors();
  const index = current.findIndex(v => v.id === id);
  if (index === -1) throw new Error('Vendor not found');

  const updatedItem: VendorMaster = {
    ...current[index],
    ...data,
    updatedAt: new Date().toISOString()
  };

  current[index] = updatedItem;
  saveVendors(current);
  return updatedItem;
};

export const deleteVendor = (id: string) => {
  const current = loadVendors();
  const filtered = current.filter(v => v.id !== id);
  saveVendors(filtered);
};

// Reset Master Data back to initial seeds
export const resetPartyMasterToSeed = () => {
  saveCustomers(INITIAL_CUSTOMERS);
  saveVendors(INITIAL_VENDORS);
  return { customers: INITIAL_CUSTOMERS, vendors: INITIAL_VENDORS };
};

// Extract PAN from 15-digit GSTIN
export const extractPanFromGstin = (gstin: string): string => {
  if (!gstin || gstin.trim().length !== 15) return '';
  return gstin.trim().substring(2, 12).toUpperCase();
};

// Extract State Code from 15-digit GSTIN
export const extractStateCodeFromGstin = (gstin: string): string => {
  if (!gstin || gstin.trim().length < 2) return '';
  return gstin.trim().substring(0, 2);
};
