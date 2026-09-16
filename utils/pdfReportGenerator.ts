import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TaxComputationSummary, Tenant } from '../types';

export const generateGstSummaryPdf = (
  data: TaxComputationSummary,
  period: string,
  tenant?: Tenant | null
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Read saved Theme Preferences from localStorage
  const theme = (localStorage.getItem('report_theme') || 'MODERN').toUpperCase();
  const fontScale = localStorage.getItem('report_font_scale') || 'STANDARD';
  const showWatermark = localStorage.getItem('report_watermark') !== 'false';
  const showFooter = localStorage.getItem('report_footer') !== 'false';
  const customDisclaimer = localStorage.getItem('report_disclaimer') || 
    'This tax document is system-generated and verified against GSTR-1 & GSTR-3B registers.';

  // Determine colors and table styles according to theme
  let primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
  let accentColor: [number, number, number] = [79, 70, 229]; // indigo-600
  let emeraldColor: [number, number, number] = [16, 185, 129]; // emerald-600
  let lightBg: [number, number, number] = [248, 250, 252]; // slate-50
  let tableTheme: 'grid' | 'striped' | 'plain' = 'striped';
  let fontStyleName: 'helvetica' | 'times' = 'helvetica';

  if (theme === 'CORPORATE') {
    primaryColor = [15, 23, 42];   // Navy #0f172a
    accentColor = [30, 58, 138];   // Deep Navy #1e3a8a
    tableTheme = 'grid';
    fontStyleName = 'times';
  } else if (theme === 'MINIMALIST') {
    primaryColor = [51, 65, 85];   // Slate #334155
    accentColor = [100, 116, 139]; // Muted Slate #64748b
    tableTheme = 'plain';
    fontStyleName = 'helvetica';
  } else {
    // MODERN
    primaryColor = [15, 23, 42];   // Slate #0f172a
    accentColor = [79, 70, 229];   // Indigo #4f46e5
    tableTheme = 'striped';
    fontStyleName = 'helvetica';
  }

  // Base font size adjustment multiplier
  const baseFontSize = fontScale === 'COMPACT' ? 7.5 : fontScale === 'COMFORTABLE' ? 9 : 8;

  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let y = 26;

  // Add Letterhead or Logo if present in localStorage
  const letterhead = localStorage.getItem('company_letterhead');
  const logo = localStorage.getItem('company_logo');

  if (letterhead) {
    try {
      doc.addImage(letterhead, 'PNG', 14, y, 182, 20);
      y += 24;
    } catch (e) {
      console.error('Error drawing letterhead', e);
    }
  } else if (logo) {
    try {
      doc.addImage(logo, 'PNG', 14, y, 35, 15);
      y += 18;
    } catch (e) {
      console.error('Error drawing logo', e);
    }
  }

  // 2. Tenant & Report Meta Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(15);
  doc.setFont(fontStyleName, 'bold');
  doc.text(tenant?.name || 'Taxpayer Entity', 14, y);

  doc.setFontSize(8.5);
  doc.setFont(fontStyleName, 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `GSTIN: ${tenant?.gstin || '27AAAAA0000A1Z5'}  |  State Code: ${tenant?.stateCode || '27'}  |  Address: ${tenant?.address || 'Registered Office'}`,
    14,
    y + 6
  );

  y += 14;

  // Report Title Badge Box
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, y, 182, 18, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 18, 3, 3, 'D');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont(fontStyleName, 'bold');
  doc.text('Consolidated Monthly GST Summary Report', 20, y + 8);

  doc.setFontSize(9);
  doc.setFont(fontStyleName, 'bold');
  doc.setTextColor(...accentColor);
  doc.text(`Return Period: ${period}`, 190, y + 8, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont(fontStyleName, 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Verified computation engine report mapping GSTR-1, GSTR-3B & ITC Reconciliation', 20, y + 14);

  y += 24;

  // 3. Key Financial Summary Box (4 Cards)
  const totalOutput =
    data.outputLiability.igst +
    data.outputLiability.cgst +
    data.outputLiability.sgst +
    data.outputLiability.utgst +
    data.outputLiability.cess;
  const totalRcm =
    data.rcmLiability.igst + data.rcmLiability.cgst + data.rcmLiability.sgst;
  const totalItc =
    data.inputTaxCredit.igst +
    data.inputTaxCredit.cgst +
    data.inputTaxCredit.sgst;
  const totalNet =
    data.netPayable.igst +
    data.netPayable.cgst +
    data.netPayable.sgst +
    data.netPayable.utgst +
    data.netPayable.cess;

  const cardWidth = 42.5;
  const cardGap = 4;

  const cards = [
    { title: 'Gross Output Tax', val: `₹ ${totalOutput.toLocaleString('en-IN')}`, color: primaryColor },
    { title: 'RCM Liability', val: `₹ ${totalRcm.toLocaleString('en-IN')}`, color: [217, 119, 6] as [number, number, number] },
    { title: 'Eligible ITC', val: `₹ ${totalItc.toLocaleString('en-IN')}`, color: emeraldColor },
    { title: 'Net Cash Payable', val: `₹ ${totalNet.toLocaleString('en-IN')}`, color: accentColor },
  ];

  cards.forEach((card, idx) => {
    const cx = 14 + idx * (cardWidth + cardGap);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(cx, y, cardWidth, 20, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, y, cardWidth, 20, 2, 2, 'D');

    doc.setFontSize(7);
    doc.setFont(fontStyleName, 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(card.title.toUpperCase(), cx + 4, y + 6);

    doc.setFontSize(9.5);
    doc.setFont(fontStyleName, 'bold');
    doc.setTextColor(...card.color);
    doc.text(card.val, cx + 4, y + 14);
  });

  y += 26;

  const tableMargin = { left: 14, right: 14, top: 25, bottom: 35 };

  // 4. Section 1: Detailed Tax Breakdown
  doc.setFontSize(11);
  doc.setFont(fontStyleName, 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('1. Component Tax Breakdown', 14, y);

  y += 4;

  const breakdownRows = [
    [
      'Output Tax Liability (Sales)',
      `₹ ${data.outputLiability.taxableValue.toLocaleString('en-IN')}`,
      `₹ ${data.outputLiability.igst.toLocaleString('en-IN')}`,
      `₹ ${data.outputLiability.cgst.toLocaleString('en-IN')}`,
      `₹ ${data.outputLiability.sgst.toLocaleString('en-IN')}`,
      `₹ ${(data.outputLiability.utgst + data.outputLiability.cess).toLocaleString('en-IN')}`,
      `₹ ${totalOutput.toLocaleString('en-IN')}`,
    ],
    [
      'Reverse Charge Liability (RCM)',
      `₹ ${data.rcmLiability.taxableValue.toLocaleString('en-IN')}`,
      `₹ ${data.rcmLiability.igst.toLocaleString('en-IN')}`,
      `₹ ${data.rcmLiability.cgst.toLocaleString('en-IN')}`,
      `₹ ${data.rcmLiability.sgst.toLocaleString('en-IN')}`,
      `₹ ${(data.rcmLiability.utgst + data.rcmLiability.cess).toLocaleString('en-IN')}`,
      `₹ ${totalRcm.toLocaleString('en-IN')}`,
    ],
    [
      'Available Input Tax Credit (ITC)',
      `₹ ${data.inputTaxCredit.taxableValue.toLocaleString('en-IN')}`,
      `₹ ${data.inputTaxCredit.igst.toLocaleString('en-IN')}`,
      `₹ ${data.inputTaxCredit.cgst.toLocaleString('en-IN')}`,
      `₹ ${data.inputTaxCredit.sgst.toLocaleString('en-IN')}`,
      `₹ ${(data.inputTaxCredit.utgst + data.inputTaxCredit.cess).toLocaleString('en-IN')}`,
      `₹ ${totalItc.toLocaleString('en-IN')}`,
    ],
    [
      'Blocked / Ineligible ITC (Sec 17(5))',
      '-',
      '-',
      '-',
      '-',
      '-',
      `₹ ${(data.inputTaxCredit.blocked || 0).toLocaleString('en-IN')}`,
    ],
    [
      'Net Tax Payable in Cash',
      '-',
      `₹ ${data.netPayable.igst.toLocaleString('en-IN')}`,
      `₹ ${data.netPayable.cgst.toLocaleString('en-IN')}`,
      `₹ ${data.netPayable.sgst.toLocaleString('en-IN')}`,
      `₹ ${(data.netPayable.utgst + data.netPayable.cess).toLocaleString('en-IN')}`,
      `₹ ${totalNet.toLocaleString('en-IN')}`,
    ],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Tax Head / Category', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'UTGST/Cess', 'Total Tax']],
    body: breakdownRows,
    theme: tableTheme,
    headStyles: {
      fillColor: accentColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: baseFontSize,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: baseFontSize,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 48 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' },
    },
    margin: tableMargin,
  });

  // Get y after table
  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 250) {
    doc.addPage();
    y = 35;
  }

  // 5. Section 2: GSTR-1 Mapping Table
  doc.setFontSize(11);
  doc.setFont(fontStyleName, 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('2. GSTR-1 Outward Supplies Summary', 14, y);

  y += 4;

  const gstr1Rows = data.gstr1Mapping.map((item) => [
    item.table,
    item.description,
    item.source.replace('_', ' '),
    `₹ ${item.taxableValue.toLocaleString('en-IN')}`,
    `₹ ${item.liability.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Table Ref', 'Description', 'Data Source', 'Taxable Value (₹)', 'Tax Liability (₹)']],
    body: gstr1Rows,
    theme: tableTheme,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: baseFontSize,
    },
    bodyStyles: {
      fontSize: baseFontSize,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 24 },
      1: { cellWidth: 70 },
      2: { cellWidth: 35 },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' },
    },
    margin: tableMargin,
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 250) {
    doc.addPage();
    y = 35;
  }

  // 6. Section 3: GSTR-3B Auto-Drafted Summary
  doc.setFontSize(11);
  doc.setFont(fontStyleName, 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('3. GSTR-3B Auto-Drafted Summary', 14, y);

  y += 4;

  const gstr3bRows = data.gstr3bMapping.map((item) => [
    item.table,
    item.description,
    item.source.replace('_', ' '),
    `₹ ${item.taxableValue.toLocaleString('en-IN')}`,
    `₹ ${item.liability.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Table Ref', 'Section Description', 'Source Register', 'Taxable Value (₹)', 'Tax / Credit (₹)']],
    body: gstr3bRows,
    theme: tableTheme,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: baseFontSize,
    },
    bodyStyles: {
      fontSize: baseFontSize,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 24 },
      1: { cellWidth: 70 },
      2: { cellWidth: 35 },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' },
    },
    margin: tableMargin,
  });

  // Apply Headers, Footers, and Pagination to every page
  const pageCount = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Global Header
    doc.setFillColor(...accentColor);
    doc.rect(0, 0, 210, 16, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(fontStyleName, 'bold');
    doc.text(`TAXFLOW PLATFORM — ${theme} PDF REPORT`, 14, 11);
    
    doc.setFont(fontStyleName, 'normal');
    doc.text(`Generated: ${reportDate}`, 196, 11, { align: 'right' });

    // Global Watermark
    if (showWatermark) {
      doc.setTextColor(225, 29, 72); // Rose-600
      doc.setFontSize(8);
      doc.setFont(fontStyleName, 'bold');
      doc.text('*** CONFIDENTIAL — INTERNAL TAX AUDIT ***', 105, 260, { align: 'center' });
    }

    // Global Footer
    if (showFooter) {
      const footerY = 265;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, footerY, 182, 14, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, footerY, 182, 14, 2, 2, 'D');

      doc.setFontSize(8);
      doc.setFont(fontStyleName, 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('System Reconciliation & Audit Verification', 18, footerY + 5);
      
      doc.setFontSize(7);
      doc.setFont(fontStyleName, 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(customDisclaimer, 18, footerY + 10, { maxWidth: 150 });
    }

    // Pagination
    doc.setFontSize(8);
    doc.setFont(fontStyleName, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
  }

  // Download Trigger
  const sanitizedPeriod = period.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`GST_${theme}_Report_${sanitizedPeriod}.pdf`);
};

