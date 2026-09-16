import { HSNCode } from '../types';

export const HSN_DIRECTORY: HSNCode[] = [
  // ==========================================
  // GOODS (HSN Codes)
  // ==========================================
  // 0% (Nil / Exempt)
  { 
    id: 'hsn-1006-unbranded', 
    code: '1006', 
    description: 'Rice (non-branded / non-prepackaged and unlabelled)', 
    taxRate: 0, 
    category: 'GOODS',
    chapter: '10 - Cereals',
    uqc: 'KGS',
    itcEligibility: 'INELIGIBLE',
    conditions: 'Exempt if supplied unbranded or in loose form without pre-packaged label.'
  },
  { 
    id: 'hsn-0401', 
    code: '0401', 
    description: 'Fresh milk and pasteurised milk (not concentrated nor containing added sugar)', 
    taxRate: 0, 
    category: 'GOODS',
    chapter: '04 - Dairy produce',
    uqc: 'LTR',
    itcEligibility: 'INELIGIBLE',
    conditions: 'Fresh unflavored milk supplied in unpackaged form is exempt.'
  },
  { 
    id: 'hsn-0701', 
    code: '0701', 
    description: 'Potatoes, fresh or chilled (unprocessed fresh vegetables)', 
    taxRate: 0, 
    category: 'GOODS',
    chapter: '07 - Edible vegetables',
    uqc: 'KGS',
    itcEligibility: 'INELIGIBLE',
    conditions: 'Fresh produce unbranded/unfrozen.'
  },
  { 
    id: 'hsn-4901', 
    code: '4901', 
    description: 'Printed books, brochures, leaflets and similar printed matter', 
    taxRate: 0, 
    category: 'GOODS',
    chapter: '49 - Printed books & newspapers',
    uqc: 'NOS',
    itcEligibility: 'INELIGIBLE',
    conditions: 'Nil rated to promote education & literacy.'
  },

  // 0.25% (Diamonds & Rough Stones)
  { 
    id: 'hsn-7102', 
    code: '7102', 
    description: 'Diamonds, whether or not worked, but not mounted or set (Rough diamonds)', 
    taxRate: 0.25, 
    category: 'GOODS',
    chapter: '71 - Precious stones & jewelry',
    uqc: 'CRT',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Concessional rate for cut & polished or rough diamonds.'
  },

  // 3% (Precious Metals & Jewelry)
  { 
    id: 'hsn-7113', 
    code: '7113', 
    description: 'Articles of jewellery and parts thereof, of precious metal (Gold, Silver, Platinum)', 
    taxRate: 3, 
    category: 'GOODS',
    chapter: '71 - Precious stones & jewelry',
    uqc: 'GMS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Standard 3% GST on precious metals and bullion jewelry.'
  },
  { 
    id: 'hsn-7106', 
    code: '7106', 
    description: 'Silver (including silver plated with gold or platinum), unwrought or semi-manufactured', 
    taxRate: 3, 
    category: 'GOODS',
    chapter: '71 - Precious stones & jewelry',
    uqc: 'KGS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Applicable to raw silver bars and ingots.'
  },

  // 5% (Essentials, Food & Low-Tier Apparel)
  { 
    id: 'hsn-1006-branded', 
    code: '1006', 
    description: 'Rice (branded, pre-packaged and labelled)', 
    taxRate: 5, 
    category: 'GOODS',
    chapter: '10 - Cereals',
    uqc: 'KGS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Pre-packaged and labelled food grains per Legal Metrology Act.'
  },
  { 
    id: 'hsn-1701', 
    code: '1701', 
    description: 'Cane or beet sugar and chemically pure sucrose, in solid form', 
    taxRate: 5, 
    category: 'GOODS',
    chapter: '17 - Sugars & confectionery',
    uqc: 'KGS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Refined granulated white sugar.'
  },
  { 
    id: 'hsn-0402', 
    code: '0402', 
    description: 'Milk and cream, concentrated or containing added sugar or other sweetening matter', 
    taxRate: 5, 
    category: 'GOODS',
    chapter: '04 - Dairy produce',
    uqc: 'KGS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Condensed milk and dairy whitener in powder form.'
  },
  { 
    id: 'hsn-0902', 
    code: '0902', 
    description: 'Tea, whether or not flavored (Black tea, Green tea)', 
    taxRate: 5, 
    category: 'GOODS',
    chapter: '09 - Coffee, tea, mate & spices',
    uqc: 'KGS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Bulk and packaged packaged tea leaves.'
  },
  { 
    id: 'hsn-1515', 
    code: '1515', 
    description: 'Other fixed vegetable fats and oils (Mustard, Sunflower, Groundnut oil)', 
    taxRate: 5, 
    category: 'GOODS',
    chapter: '15 - Animal/vegetable fats & oils',
    uqc: 'LTR',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Edible grade vegetable cooking oil.'
  },
  { 
    id: 'hsn-6109', 
    code: '6109', 
    description: 'T-shirts, singlets and other vests, knitted or crocheted (Sale value <= ₹1,000)', 
    taxRate: 5, 
    category: 'GOODS',
    chapter: '61 - Articles of apparel (knitted)',
    uqc: 'PCS',
    itcEligibility: 'ELIGIBLE',
    conditions: '5% if transaction value per piece does not exceed ₹1,000; 12% if exceeds ₹1,000.'
  },
  { 
    id: 'hsn-3002', 
    code: '3002', 
    description: 'Human vaccines and therapeutic serums for prophylactic treatments', 
    taxRate: 5, 
    category: 'GOODS',
    chapter: '30 - Pharmaceutical products',
    uqc: 'NOS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Critical medical vaccines.'
  },

  // 6% (Building materials special scheme)
  { 
    id: 'hsn-6901', 
    code: '6901', 
    description: 'Building bricks, roofing tiles, and earthen tiles', 
    taxRate: 6, 
    category: 'GOODS',
    chapter: '69 - Ceramic products',
    uqc: 'THD',
    itcEligibility: 'CONDITIONAL',
    conditions: 'Special 6% composition rate without ITC, or 12% with ITC benefit.'
  },

  // 12% (Pharma, Footwear, Medical & Processed Foods)
  { 
    id: 'hsn-3004', 
    code: '3004', 
    description: 'Medicaments consisting of mixed or unmixed products for therapeutic uses', 
    taxRate: 12, 
    category: 'GOODS',
    chapter: '30 - Pharmaceutical products',
    uqc: 'NOS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Standard allopathic & ayurvedic formulated medicines.'
  },
  { 
    id: 'hsn-4802', 
    code: '4802', 
    description: 'Uncoated paper and paperboard, used for writing, printing or graphics', 
    taxRate: 12, 
    category: 'GOODS',
    chapter: '48 - Paper & paperboard',
    uqc: 'KGS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Office printing reams and notebook craft paper.'
  },
  { 
    id: 'hsn-6403', 
    code: '6403', 
    description: 'Footwear with outer soles of rubber/plastics and uppers of leather (Value > ₹1,000)', 
    taxRate: 12, 
    category: 'GOODS',
    chapter: '64 - Footwear & gaiters',
    uqc: 'PRS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Applies to footwear items retailing above ₹1,000 per pair.'
  },
  { 
    id: 'hsn-9018', 
    code: '9018', 
    description: 'Instruments and appliances used in medical, surgical, dental or veterinary sciences', 
    taxRate: 12, 
    category: 'GOODS',
    chapter: '90 - Optical, photographic & medical instruments',
    uqc: 'NOS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Diagnostic machines, surgical scopes, ECG monitors.'
  },

  // 18% (IT, Electronics, Machinery, Chemicals & Industrial Goods)
  { 
    id: 'hsn-8471', 
    code: '8471', 
    description: 'Automatic data processing machines, laptops, microcomputers and storage units', 
    taxRate: 18, 
    category: 'GOODS',
    chapter: '84 - Machinery & mechanical appliances',
    uqc: 'NOS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Enterprise servers, desktop PCs, solid state drives.'
  },
  { 
    id: 'hsn-8517', 
    code: '8517', 
    description: 'Telephone sets, including smartphones and wireless network transmission apparatus', 
    taxRate: 18, 
    category: 'GOODS',
    chapter: '85 - Electrical machinery & electronics',
    uqc: 'NOS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Cellular 5G smartphones, Wi-Fi routers, cellular transceivers.'
  },
  { 
    id: 'hsn-8504', 
    code: '8504', 
    description: 'Electrical transformers, static converters (UPS, Inverters) and inductors', 
    taxRate: 18, 
    category: 'GOODS',
    chapter: '85 - Electrical machinery & electronics',
    uqc: 'NOS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Commercial uninterruptible power supplies and industrial power inverters.'
  },
  { 
    id: 'hsn-9403', 
    code: '9403', 
    description: 'Other furniture and parts thereof (Office desks, ergonomic chairs, metal fixtures)', 
    taxRate: 18, 
    category: 'GOODS',
    chapter: '94 - Furniture & prefabricated buildings',
    uqc: 'NOS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Capitalized office assets or stock for resale.'
  },
  { 
    id: 'hsn-3304', 
    code: '3304', 
    description: 'Beauty or make-up preparations and skin care creams (other than medicaments)', 
    taxRate: 18, 
    category: 'GOODS',
    chapter: '33 - Essential oils & cosmetics',
    uqc: 'NOS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Cosmetic lotions, sunscreen, personal care goods.'
  },
  { 
    id: 'hsn-3924', 
    code: '3924', 
    description: 'Tableware, kitchenware, other household articles and hygienic articles of plastics', 
    taxRate: 18, 
    category: 'GOODS',
    chapter: '39 - Plastics & articles thereof',
    uqc: 'KGS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Moulded industrial & household polymer wares.'
  },
  { 
    id: 'hsn-7214', 
    code: '7214', 
    description: 'Other bars and rods of iron or non-alloy steel (TMT Reinforcement Bars)', 
    taxRate: 18, 
    category: 'GOODS',
    chapter: '72 - Iron and steel',
    uqc: 'MTR',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Construction rebar and structural steel rods.'
  },
  { 
    id: 'hsn-8418', 
    code: '8418', 
    description: 'Refrigerators, freezers and other refrigerating or freezing equipment', 
    taxRate: 18, 
    category: 'GOODS',
    chapter: '84 - Machinery & mechanical appliances',
    uqc: 'NOS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Domestic and commercial cold storage refrigerators.'
  },

  // 28% (Luxury, Sin Goods & Heavy Equipment)
  { 
    id: 'hsn-8703', 
    code: '8703', 
    description: 'Motor cars and other motor vehicles principally designed for transport of persons', 
    taxRate: 28, 
    category: 'GOODS',
    chapter: '87 - Vehicles other than railway',
    cessRate: 15,
    uqc: 'NOS',
    itcEligibility: 'CONDITIONAL',
    conditions: '28% GST + Compensation Cess (1% to 22% based on engine displacement and fuel type). ITC blocked under Sec 17(5) unless used for transport business.'
  },
  { 
    id: 'hsn-8415', 
    code: '8415', 
    description: 'Air conditioning machines, comprising a motor-driven fan and elements for changing temperature', 
    taxRate: 28, 
    category: 'GOODS',
    chapter: '84 - Machinery & mechanical appliances',
    uqc: 'NOS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Commercial split and cassette HVAC systems.'
  },
  { 
    id: 'hsn-2523', 
    code: '2523', 
    description: 'Portland cement, aluminous cement, slag cement and similar hydraulic cements', 
    taxRate: 28, 
    category: 'GOODS',
    chapter: '25 - Salt, sulphur, earths & stone, lime & cement',
    uqc: 'KGS',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Standard 28% GST on all hydraulic construction cements.'
  },
  { 
    id: 'hsn-2202', 
    code: '2202', 
    description: 'Aerated waters containing added sugar or other sweetening matter or flavoured', 
    taxRate: 28, 
    category: 'GOODS',
    chapter: '22 - Beverages, spirits & vinegar',
    cessRate: 12,
    uqc: 'LTR',
    itcEligibility: 'ELIGIBLE',
    conditions: '28% GST + 12% Compensation Cess on carbonated soft drinks.'
  },

  // ==========================================
  // SERVICES (SAC Codes)
  // ==========================================
  // 0% (Nil / Exempt Services)
  { 
    id: 'sac-9993', 
    code: '9993', 
    description: 'Human health care services by a clinical establishment, medical doctor or paramedic', 
    taxRate: 0, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'INELIGIBLE',
    conditions: 'Statutorily exempt under Notification 12/2017-CT(R).'
  },
  { 
    id: 'sac-9992-exempt', 
    code: '9992', 
    description: 'Education services provided by an educational institution to students, faculty and staff', 
    taxRate: 0, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'INELIGIBLE',
    conditions: 'Preschool, schooling, higher education curriculum recognized by law are exempt.'
  },

  // 5% Services
  { 
    id: 'sac-9964', 
    code: '9964', 
    description: 'Passenger transport services by air (Economy class) or road cab aggregators', 
    taxRate: 5, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'CONDITIONAL',
    conditions: '5% GST with limited input tax credit (only on input services of same line of business).'
  },
  { 
    id: 'sac-9963-restaurant', 
    code: '9963', 
    description: 'Restaurant and outdoor catering services (other than in specified high-tariff premises)', 
    taxRate: 5, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'INELIGIBLE',
    conditions: '5% flat rate without input tax credit (ITC) benefit.'
  },
  { 
    id: 'sac-9967-rcm', 
    code: '9967', 
    description: 'Goods Transport Agency (GTA) freight services for carriage of goods by road', 
    taxRate: 5, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    rcmApplicable: true,
    itcEligibility: 'ELIGIBLE',
    conditions: '5% under Reverse Charge Mechanism (recipient pays) OR optional 12% with ITC under Forward Charge.'
  },
  { 
    id: 'sac-9954-affordable', 
    code: '9954', 
    description: 'Construction of affordable residential apartments in projects commenced post-01.04.2019', 
    taxRate: 1, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'INELIGIBLE',
    conditions: '1% concessional GST on carpet area <= 60 sqm (metros) or <= 90 sqm (non-metros), value <= ₹45L without ITC.'
  },

  // 12% Services
  { 
    id: 'sac-9963-hotel-budget', 
    code: '9963', 
    description: 'Hotel accommodation with declared room tariff between ₹1,001 and ₹7,500 per day', 
    taxRate: 12, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Full ITC available to registered business travelers.'
  },
  { 
    id: 'sac-9954', 
    code: '9954', 
    description: 'Construction of government infrastructure, railways, dams, water supply works contract', 
    taxRate: 12, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Composite supply of works contract to Central/State Govt or local authority.'
  },

  // 18% Standard Services
  { 
    id: 'sac-9983', 
    code: '9983', 
    description: 'Other professional, technical and business services (IT Consulting, Software, Architecture)', 
    taxRate: 18, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Standard 18% rate. Zero-rated if exported under Letter of Undertaking (LUT).'
  },
  { 
    id: 'sac-9971', 
    code: '9971', 
    description: 'Financial and related services (Banking processing fees, loan servicing, General Insurance)', 
    taxRate: 18, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Banks have option to avail 50% eligible CENVAT/ITC under Sec 17(4).'
  },
  { 
    id: 'sac-9973', 
    code: '9973', 
    description: 'Leasing or rental services concerning intellectual property (SaaS subscriptions, Software licenses)', 
    taxRate: 18, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Standard rate on temporary transfer or permitting the use of intellectual property.'
  },
  { 
    id: 'sac-9982', 
    code: '9982', 
    description: 'Legal services by an individual advocate, senior advocate, or firm of advocates', 
    taxRate: 18, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    rcmApplicable: true,
    itcEligibility: 'ELIGIBLE',
    conditions: 'Subject to Reverse Charge Mechanism (RCM) under Notification 13/2017-CT(R) when provided to a business entity.'
  },
  { 
    id: 'sac-9984', 
    code: '9984', 
    description: 'Telecommunications, broadband, leased lines and cloud digital transmission supply services', 
    taxRate: 18, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Subject to point of consumption billing guidelines.'
  },
  { 
    id: 'sac-9992-coaching', 
    code: '9992', 
    description: 'Commercial training and coaching services (EdTech, professional certification courses)', 
    taxRate: 18, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'ELIGIBLE',
    conditions: 'Commercial non-degree institutions are taxable at standard 18%.'
  },

  // 28% Services
  { 
    id: 'sac-9996', 
    code: '9996', 
    description: 'Recreational, cultural and sporting services (Casinos, Race clubs, Betting & Online Gaming)', 
    taxRate: 28, 
    category: 'SERVICES',
    chapter: '99 - Services Accounting Code (SAC)',
    itcEligibility: 'CONDITIONAL',
    conditions: 'Statutory 28% rate on actionable claims and entry tickets.'
  },
];

