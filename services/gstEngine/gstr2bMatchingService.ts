import { Invoice } from '../../types';
import { ITCTaggingService } from './itcTaggingService';

export interface GSTR2BPortalRecord {
  id: string;
  gstin: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: 'B2B' | 'CDNR' | 'B2BA' | 'ISD' | 'RCM';
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
  totalTax: number;
  gstr1FilingDate?: string;
  gstr1FilingPeriod?: string; // e.g., '072026'
  itcAvailability: 'ELIGIBLE' | 'INELIGIBLE' | 'BLOCKED';
  ineligibilityReason?: string;
  placeOfSupply?: string;
}

export interface GSTR2BMatchingConfig {
  dateToleranceDays?: number; // Default: 7
  taxAmountTolerance?: number; // Default: 10
  taxableValueTolerance?: number; // Default: 100 (₹100 taxable value variance)
  fuzzyInvoiceMatching?: boolean; // Default: true
  enforceGstinStrictMatch?: boolean; // Default: true
}

export const DEFAULT_GSTR2B_MATCHING_CONFIG: GSTR2BMatchingConfig = {
  dateToleranceDays: 7,
  taxAmountTolerance: 10,
  taxableValueTolerance: 100,
  fuzzyInvoiceMatching: true,
  enforceGstinStrictMatch: true,
};

export type GSTR2BMatchStatus =
  | 'EXACT_MATCH'
  | 'AMOUNT_MISMATCH'
  | 'TAX_HEAD_MISMATCH'
  | 'DATE_MISMATCH'
  | 'MISSING_IN_GSTR2B'
  | 'MISSING_IN_BOOKS'
  | 'SECTION_17_5_BLOCKED';

export interface FiveWayMatchDetails {
  gstinMatched: boolean;
  invoiceNoMatched: 'EXACT' | 'FUZZY' | 'MISMATCH';
  dateMatched: 'EXACT' | 'TOLERANCE' | 'MISMATCH';
  taxableValueMatched: 'EXACT' | 'TOLERANCE' | 'MISMATCH';
  taxAmountMatched: 'EXACT' | 'TOLERANCE' | 'MISMATCH';
}

export interface GSTR2BMatchResultItem {
  id: string;
  purchaseRecord?: {
    id: string;
    invoiceNumber: string;
    date: string;
    partyName: string;
    gstin: string;
    taxableValue: number;
    taxAmount: number;
    igst: number;
    cgst: number;
    sgst: number;
    isBlockedItc?: boolean;
    reasonForBlocked?: string;
  };
  gstr2bRecord?: GSTR2BPortalRecord;
  status: GSTR2BMatchStatus;
  matchingScore: number; // 0 to 100%
  taxDifference: number;
  discrepancyCategory: string;
  discrepancies: string[];
  statutoryClause: string;
  recommendedAction: string;
  matchLevel?: 1 | 2 | 3 | 4 | 5;
  fiveWayMatch?: FiveWayMatchDetails;
}

export interface GSTR2BMatchingSummary {
  totalPurchaseInvoices: number;
  totalGstr2bInvoices: number;
  exactMatchesCount: number;
  discrepanciesCount: number;
  missingInGstr2bCount: number;
  missingInBooksCount: number;
  sec17BlockedCount: number;
  totalBooksTaxAmount: number;
  totalGstr2bTaxAmount: number;
  claimableItcAmount: number;
  atRiskItcAmount: number;
  reconciliationMatchRate: number; // 0 to 100%
}

/**
 * Automated GSTR-2B vs. Purchase Register Matching Service
 * Executes multi-dimensional reconciliations between internal ERP purchase books
 * and auto-populated GSTR-2B data filed by suppliers under CGST Rules 36(4) & Section 16(2)(aa).
 */
export class GSTR2BMatchingService {
  /**
   * Normalizes invoice numbers for lenient matching (removes symbols, spaces, leading zeros)
   */
  private static normalizeInvoiceNo(num: string): string {
    if (!num) return '';
    return num.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^0+/, '');
  }

  /**
   * Calculates difference in days between two YYYY-MM-DD date strings
   */
  private static calculateDayDiff(d1Str: string, d2Str: string): number {
    try {
      const d1 = new Date(d1Str);
      const d2 = new Date(d2Str);
      const diffMs = Math.abs(d2.getTime() - d1.getTime());
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return 999;
    }
  }

  /**
   * Primary matching execution function comparing Purchase Register to GSTR-2B
   */
  public static matchGSTR2BWithPurchaseRegister(
    purchaseInvoices: Invoice[],
    gstr2bRecords: GSTR2BPortalRecord[],
    config: GSTR2BMatchingConfig = DEFAULT_GSTR2B_MATCHING_CONFIG
  ): {
    results: GSTR2BMatchResultItem[];
    summary: GSTR2BMatchingSummary;
  } {
    const results: GSTR2BMatchResultItem[] = [];
    const matched2bIds = new Set<string>();

    // Safeguard config defaults
    const dateToleranceDays = config.dateToleranceDays ?? 7;
    const taxAmountTolerance = config.taxAmountTolerance ?? 10;
    const taxableValueTolerance = config.taxableValueTolerance ?? 100;
    const fuzzyInvoiceMatching = config.fuzzyInvoiceMatching ?? true;
    const enforceGstinStrictMatch = config.enforceGstinStrictMatch ?? true;

    // Filter purchase invoices for Purchase category
    const purchases = purchaseInvoices.filter(i => i.category === 'PURCHASE' || i.category === undefined);

    let exactMatchesCount = 0;
    let discrepanciesCount = 0;
    let missingInGstr2bCount = 0;
    let missingInBooksCount = 0;
    let sec17BlockedCount = 0;

    let totalBooksTaxAmount = 0;
    let totalGstr2bTaxAmount = 0;
    let claimableItcAmount = 0;
    let atRiskItcAmount = 0;

    // 1. Process all internal Purchase Register Records against GSTR-2B
    purchases.forEach((books, index) => {
      const booksTaxable = books.amount || books.taxDetails?.taxableValue || 0;
      const booksTax = books.taxAmount || 0;
      const booksIgst = books.taxDetails?.igst || 0;
      const booksCgst = books.taxDetails?.cgst || 0;
      const booksSgst = books.taxDetails?.sgst || 0;

      totalBooksTaxAmount += booksTax;

      const booksRecordFormatted = {
        id: books.id,
        invoiceNumber: books.invoiceNumber,
        date: books.date,
        partyName: books.partyName,
        gstin: books.gstin,
        taxableValue: booksTaxable,
        taxAmount: booksTax,
        igst: booksIgst,
        cgst: booksCgst,
        sgst: booksSgst,
        isBlockedItc: books.isBlockedItc,
        reasonForBlocked: books.reasonForBlocked,
      };

      const normBooksNo = this.normalizeInvoiceNo(books.invoiceNumber);
      const normBooksGstin = (books.gstin || '').trim().toUpperCase();

      let bestCandidate: GSTR2BPortalRecord | null = null;
      let maxScore = -1;
      let candidateReasons: string[] = [];
      let bestFiveWayMatch: FiveWayMatchDetails = {
        gstinMatched: false,
        invoiceNoMatched: 'MISMATCH',
        dateMatched: 'MISMATCH',
        taxableValueMatched: 'MISMATCH',
        taxAmountMatched: 'MISMATCH'
      };

      gstr2bRecords.forEach((portal) => {
        if (matched2bIds.has(portal.id)) return;

        let score = 0;
        const reasons: string[] = [];
        const fiveWay: FiveWayMatchDetails = {
          gstinMatched: false,
          invoiceNoMatched: 'MISMATCH',
          dateMatched: 'MISMATCH',
          taxableValueMatched: 'MISMATCH',
          taxAmountMatched: 'MISMATCH'
        };

        // Component 1: GSTIN Alignment (20 points)
        const normPortalGstin = (portal.gstin || '').trim().toUpperCase();
        if (normBooksGstin && normBooksGstin === normPortalGstin) {
          fiveWay.gstinMatched = true;
          score += 20;
        } else if (enforceGstinStrictMatch) {
          return; // Strict GSTIN requirement
        } else {
          reasons.push(`GSTIN Mismatch: Books (${normBooksGstin}) vs 2B (${normPortalGstin})`);
        }

        // Component 2: Invoice Number Match (20 points)
        const normPortalNo = this.normalizeInvoiceNo(portal.invoiceNumber);
        if (normBooksNo === normPortalNo) {
          fiveWay.invoiceNoMatched = 'EXACT';
          score += 20;
        } else if (
          fuzzyInvoiceMatching &&
          (normBooksNo.endsWith(normPortalNo) || normPortalNo.endsWith(normBooksNo)) &&
          Math.min(normBooksNo.length, normPortalNo.length) >= 3
        ) {
          fiveWay.invoiceNoMatched = 'FUZZY';
          score += 15;
          reasons.push(`Lenient Invoice No. Match: ${books.invoiceNumber} ~ ${portal.invoiceNumber}`);
        } else {
          reasons.push(`Invoice No. Mismatch: Books (${books.invoiceNumber}) vs 2B (${portal.invoiceNumber})`);
        }

        // Component 3: Invoice Date Match (20 points)
        const dayDiff = this.calculateDayDiff(books.date, portal.invoiceDate);
        if (dayDiff === 0) {
          fiveWay.dateMatched = 'EXACT';
          score += 20;
        } else if (dayDiff <= dateToleranceDays) {
          fiveWay.dateMatched = 'TOLERANCE';
          score += 15;
          reasons.push(`Date variance: ${dayDiff} days difference`);
        } else {
          reasons.push(`Invoice Date out of tolerance window (${dayDiff} days)`);
        }

        // Component 4: Taxable Value Match (20 points)
        const booksTaxableVal = booksTaxable;
        const portalTaxableVal = portal.taxableValue || 0;
        const valDiff = Math.abs(booksTaxableVal - portalTaxableVal);
        if (valDiff === 0) {
          fiveWay.taxableValueMatched = 'EXACT';
          score += 20;
        } else if (valDiff <= taxableValueTolerance) {
          fiveWay.taxableValueMatched = 'TOLERANCE';
          score += 15;
          reasons.push(`Minor Taxable Value Difference: ₹${valDiff.toFixed(2)} within tolerance`);
        } else {
          reasons.push(`Taxable Value Mismatch: Books ₹${booksTaxableVal.toLocaleString()} vs 2B ₹${portalTaxableVal.toLocaleString()}`);
        }

        // Component 5: Total Tax Amount Match (20 points)
        const portalTax = portal.totalTax || 0;
        const taxDiff = Math.abs(booksTax - portalTax);
        if (taxDiff === 0) {
          fiveWay.taxAmountMatched = 'EXACT';
          score += 20;
        } else if (taxDiff <= taxAmountTolerance) {
          fiveWay.taxAmountMatched = 'TOLERANCE';
          score += 15;
          reasons.push(`Minor Tax Difference: ₹${taxDiff.toFixed(2)} within tolerance`);
        } else {
          reasons.push(`Tax Amount Mismatch: Books ₹${booksTax.toLocaleString()} vs 2B ₹${portalTax.toLocaleString()}`);
        }

        if (score > maxScore) {
          maxScore = score;
          bestCandidate = portal;
          candidateReasons = reasons;
          bestFiveWayMatch = fiveWay;
        }
      });

      // Classification Logic (Multi-level mapping)
      if (bestCandidate && maxScore >= 40) {
        const portal: GSTR2BPortalRecord = bestCandidate;
        matched2bIds.add(portal.id);

        const portalTax = portal.totalTax || 0;
        const taxDiff = Math.abs(booksTax - portalTax);
        const dayDiff = this.calculateDayDiff(books.date, portal.invoiceDate);

        // Check for tax head (IGST vs CGST/SGST) mismatch
        const isTaxHeadMismatch =
          (booksIgst > 0 && portal.igst === 0 && (portal.cgst > 0 || portal.sgst > 0)) ||
          (booksCgst > 0 && portal.cgst === 0 && portal.igst > 0);

        // Check for statutory Sec 17(5) block in books or 2B
        const isSec17Blocked = books.isBlockedItc || portal.itcAvailability === 'BLOCKED' || portal.itcAvailability === 'INELIGIBLE';

        // Multi-level hierarchy assignment (Levels 1 to 4)
        let matchLevel: 1 | 2 | 3 | 4 | 5 = 4;
        if (
          bestFiveWayMatch.gstinMatched &&
          bestFiveWayMatch.invoiceNoMatched === 'EXACT' &&
          bestFiveWayMatch.dateMatched === 'EXACT' &&
          bestFiveWayMatch.taxableValueMatched === 'EXACT' &&
          bestFiveWayMatch.taxAmountMatched === 'EXACT'
        ) {
          matchLevel = 1; // Level 1: Perfect 5-Way Match
        } else if (
          bestFiveWayMatch.gstinMatched &&
          bestFiveWayMatch.invoiceNoMatched === 'EXACT' &&
          bestFiveWayMatch.dateMatched === 'EXACT' &&
          (bestFiveWayMatch.taxableValueMatched === 'TOLERANCE' || bestFiveWayMatch.taxAmountMatched === 'TOLERANCE')
        ) {
          matchLevel = 2; // Level 2: Strict Match with Rounding Variance
        } else if (
          bestFiveWayMatch.gstinMatched &&
          (bestFiveWayMatch.invoiceNoMatched === 'FUZZY' || bestFiveWayMatch.dateMatched === 'TOLERANCE') &&
          bestFiveWayMatch.taxAmountMatched !== 'MISMATCH'
        ) {
          matchLevel = 3; // Level 3: Lenient Match (Fuzzy ID or Filing Delay)
        } else {
          matchLevel = 4; // Level 4: Probable Match (Tax head/large value deviations)
        }

        if (isSec17Blocked) {
          sec17BlockedCount++;
          atRiskItcAmount += booksTax;
          results.push({
            id: `g2b-match-${index}`,
            purchaseRecord: booksRecordFormatted,
            gstr2bRecord: portal,
            status: 'SECTION_17_5_BLOCKED',
            matchingScore: maxScore,
            taxDifference: taxDiff,
            discrepancyCategory: 'Section 17(5) Ineligible ITC',
            discrepancies: [
              books.reasonForBlocked || portal.ineligibilityReason || 'ITC restricted under Section 17(5) of CGST Act'
            ],
            statutoryClause: 'CGST Act Section 17(5) / Rule 36(4)',
            recommendedAction: 'Do NOT claim ITC in GSTR-3B Table 4(A). Tag as Ineligible ITC under Table 4(B)(1).',
            matchLevel,
            fiveWayMatch: bestFiveWayMatch
          });
        } else if (isTaxHeadMismatch) {
          discrepanciesCount++;
          atRiskItcAmount += booksTax;
          results.push({
            id: `g2b-match-${index}`,
            purchaseRecord: booksRecordFormatted,
            gstr2bRecord: portal,
            status: 'TAX_HEAD_MISMATCH',
            matchingScore: maxScore,
            taxDifference: taxDiff,
            discrepancyCategory: 'Tax Head Mismatch (IGST vs CGST/SGST)',
            discrepancies: [
              `Books tax head (${booksIgst > 0 ? 'IGST' : 'CGST+SGST'}) conflicts with GSTR-2B (${portal.igst > 0 ? 'IGST' : 'CGST+SGST'})`
            ],
            statutoryClause: 'CGST Act Section 12/13 - Place of Supply Rules',
            recommendedAction: 'Verify Place of Supply and ask vendor to correct tax head in GSTR-1 amendment.',
            matchLevel,
            fiveWayMatch: bestFiveWayMatch
          });
        } else if (taxDiff > taxAmountTolerance) {
          discrepanciesCount++;
          atRiskItcAmount += Math.abs(booksTax - portalTax);
          claimableItcAmount += Math.min(booksTax, portalTax);

          results.push({
            id: `g2b-match-${index}`,
            purchaseRecord: booksRecordFormatted,
            gstr2bRecord: portal,
            status: 'AMOUNT_MISMATCH',
            matchingScore: maxScore,
            taxDifference: taxDiff,
            discrepancyCategory: 'Tax Amount Variance',
            discrepancies: [
              `Books Tax: ₹${booksTax.toLocaleString()} vs GSTR-2B Tax: ₹${portalTax.toLocaleString()} (Diff: ₹${taxDiff.toFixed(2)})`
            ],
            statutoryClause: 'CGST Act Section 16(2)(aa) - Credit capped to GSTR-2B',
            recommendedAction: booksTax > portalTax
              ? `Claim lower GSTR-2B amount (₹${portalTax.toLocaleString()}) and request vendor GSTR-1 amendment for ₹${taxDiff.toFixed(2)}.`
              : 'Accept higher GSTR-2B credit or reconcile purchase entry.',
            matchLevel,
            fiveWayMatch: bestFiveWayMatch
          });
        } else if (dayDiff > dateToleranceDays) {
          discrepanciesCount++;
          claimableItcAmount += booksTax;

          results.push({
            id: `g2b-match-${index}`,
            purchaseRecord: booksRecordFormatted,
            gstr2bRecord: portal,
            status: 'DATE_MISMATCH',
            matchingScore: maxScore,
            taxDifference: taxDiff,
            discrepancyCategory: 'Filing Date Delay',
            discrepancies: [
              `Invoice date delay of ${dayDiff} days between internal books (${books.date}) and GSTR-2B (${portal.invoiceDate})`
            ],
            statutoryClause: 'CGST Act Section 16(4) - Time Limit for Claiming ITC',
            recommendedAction: 'Verify filing tax period and ensure claim is made before Section 16(4) deadline.',
            matchLevel,
            fiveWayMatch: bestFiveWayMatch
          });
        } else {
          exactMatchesCount++;
          claimableItcAmount += booksTax;

          results.push({
            id: `g2b-match-${index}`,
            purchaseRecord: booksRecordFormatted,
            gstr2bRecord: portal,
            status: 'EXACT_MATCH',
            matchingScore: maxScore,
            taxDifference: 0,
            discrepancyCategory: 'Fully Reconciled',
            discrepancies: [],
            statutoryClause: 'CGST Act Section 16(2) - Compliant ITC',
            recommendedAction: 'Fully eligible for GSTR-3B Table 4(A)(5) ITC claim.',
            matchLevel,
            fiveWayMatch: bestFiveWayMatch
          });
        }
      } else {
        // No matching record found in GSTR-2B (Level 5: Unmatched)
        missingInGstr2bCount++;
        atRiskItcAmount += booksTax;

        const isSec17Blocked = books.isBlockedItc;

        results.push({
          id: `g2b-match-${index}`,
          purchaseRecord: booksRecordFormatted,
          status: 'MISSING_IN_GSTR2B',
          matchingScore: 0,
          taxDifference: booksTax,
          discrepancyCategory: 'Unfiled Supplier Invoice (Missing in 2B)',
          discrepancies: [
            `Supplier (${books.partyName} - ${books.gstin}) has NOT filed invoice in GSTR-1/2B yet.`
          ],
          statutoryClause: 'CGST Act Section 16(2)(aa) - Strict GSTR-2B Auto-Population Restriction',
          recommendedAction: isSec17Blocked
            ? 'Invoice is also blocked under Sec 17(5). Do not claim.'
            : 'Hold ITC claim in GSTR-3B. Send formal communication to supplier asking them to file GSTR-1.',
          matchLevel: 5,
          fiveWayMatch: {
            gstinMatched: false,
            invoiceNoMatched: 'MISMATCH',
            dateMatched: 'MISMATCH',
            taxableValueMatched: 'MISMATCH',
            taxAmountMatched: 'MISMATCH'
          }
        });
      }
    });

    // 2. Capture GSTR-2B records that were NOT matched to any Purchase Register invoice (Level 5: Unmatched)
    gstr2bRecords.forEach((portal, pIdx) => {
      totalGstr2bTaxAmount += portal.totalTax || 0;

      if (!matched2bIds.has(portal.id)) {
        missingInBooksCount++;

        results.push({
          id: `g2b-portal-only-${pIdx}`,
          gstr2bRecord: portal,
          status: 'MISSING_IN_BOOKS',
          matchingScore: 0,
          taxDifference: portal.totalTax,
          discrepancyCategory: 'Unrecorded Purchase (Missing in Books)',
          discrepancies: [
            `Supplier ${portal.supplierName} filed invoice ${portal.invoiceNumber} in GSTR-2B, but no entry exists in Purchase Register.`
          ],
          statutoryClause: 'CGST Act Section 16(2)(a) - Physical Invoice/Goods Receipt Verification',
          recommendedAction: 'Verify physical goods receipt/invoice and enter transaction in internal purchase accounting books.',
          matchLevel: 5,
          fiveWayMatch: {
            gstinMatched: false,
            invoiceNoMatched: 'MISMATCH',
            dateMatched: 'MISMATCH',
            taxableValueMatched: 'MISMATCH',
            taxAmountMatched: 'MISMATCH'
          }
        });
      }
    });

    const totalProcessed = purchases.length + missingInBooksCount;
    const reconciliationMatchRate = totalProcessed > 0
      ? Math.round((exactMatchesCount / totalProcessed) * 100)
      : 100;

    return {
      results,
      summary: {
        totalPurchaseInvoices: purchases.length,
        totalGstr2bInvoices: gstr2bRecords.length,
        exactMatchesCount,
        discrepanciesCount,
        missingInGstr2bCount,
        missingInBooksCount,
        sec17BlockedCount,
        totalBooksTaxAmount,
        totalGstr2bTaxAmount,
        claimableItcAmount,
        atRiskItcAmount,
        reconciliationMatchRate
      }
    };
  }

  /**
   * Generates mock GSTR-2B portal data for testing & simulation when live GSP connection is inactive
   */
  public static generateMockGSTR2BData(purchaseInvoices: Invoice[]): GSTR2BPortalRecord[] {
    const purchases = purchaseInvoices.filter(i => i.category === 'PURCHASE' || i.category === undefined);
    
    const records: GSTR2BPortalRecord[] = purchases.map((inv, idx) => {
      const tax = inv.taxAmount || 0;
      const taxable = inv.amount || inv.taxDetails?.taxableValue || 0;
      const igst = inv.taxDetails?.igst || tax;
      const cgst = inv.taxDetails?.cgst || 0;
      const sgst = inv.taxDetails?.sgst || 0;

      // Introduce controlled discrepancies for realistic automated testing
      if (idx === 1) {
        // Amount mismatch
        return {
          id: `g2b-rec-${idx}`,
          gstin: inv.gstin || '27ABCDE1234F1Z1',
          supplierName: inv.partyName || 'Supplier',
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.date,
          invoiceType: 'B2B',
          taxableValue: taxable - 500,
          totalTax: Math.max(0, tax - 90),
          igst: Math.max(0, igst - 90),
          cgst: 0,
          sgst: 0,
          cess: 0,
          gstr1FilingPeriod: '072026',
          gstr1FilingDate: '2026-08-11',
          itcAvailability: 'ELIGIBLE'
        };
      } else if (idx === 2) {
        // Date mismatch
        const d = new Date(inv.date || '2026-08-01');
        d.setDate(d.getDate() + 12);
        return {
          id: `g2b-rec-${idx}`,
          gstin: inv.gstin || '27ABCDE1234F1Z2',
          supplierName: inv.partyName || 'Supplier',
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: d.toISOString().split('T')[0],
          invoiceType: 'B2B',
          taxableValue: taxable,
          totalTax: tax,
          igst,
          cgst,
          sgst,
          cess: 0,
          gstr1FilingPeriod: '082026',
          gstr1FilingDate: '2026-08-13',
          itcAvailability: 'ELIGIBLE'
        };
      } else if (idx === 4) {
        // Ineligible / Blocked under Sec 17(5)
        return {
          id: `g2b-rec-${idx}`,
          gstin: inv.gstin || '27ABCDE1234F1Z4',
          supplierName: inv.partyName || 'Supplier',
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.date,
          invoiceType: 'B2B',
          taxableValue: taxable,
          totalTax: tax,
          igst,
          cgst,
          sgst,
          cess: 0,
          gstr1FilingPeriod: '072026',
          itcAvailability: 'BLOCKED',
          ineligibilityReason: 'Motor Vehicle Service blocked under Section 17(5)(a)'
        };
      }

      // Exact match for others
      return {
        id: `g2b-rec-${idx}`,
        gstin: inv.gstin || `27ABCDE1234F1Z${idx}`,
        supplierName: inv.partyName || `Vendor ${idx}`,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.date,
        invoiceType: 'B2B',
        taxableValue: taxable,
        totalTax: tax,
        igst,
        cgst,
        sgst,
        cess: 0,
        gstr1FilingPeriod: '072026',
        gstr1FilingDate: '2026-08-10',
        itcAvailability: 'ELIGIBLE'
      };
    });

    // Add extra GSTR-2B record missing in Books
    records.push({
      id: 'g2b-rec-extra-1',
      gstin: '27DEFGH9999K1Z8',
      supplierName: 'National Logistics Express Corp',
      invoiceNumber: 'NLE/2026/8812',
      invoiceDate: '2026-08-05',
      invoiceType: 'B2B',
      taxableValue: 45000,
      totalTax: 8100,
      igst: 8100,
      cgst: 0,
      sgst: 0,
      cess: 0,
      gstr1FilingPeriod: '072026',
      gstr1FilingDate: '2026-08-11',
      itcAvailability: 'ELIGIBLE'
    });

    return records;
  }
}
