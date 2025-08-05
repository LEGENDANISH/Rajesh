// src/components/TransactionTracking/utils.ts
import * as XLSX from 'xlsx';
import { PartySummary } from './types';

// --- Currency Formatting ---
export const formatCurrency = (value: number): string => {
  // Consider using Intl.NumberFormat for better localization
  return `₹${value.toLocaleString('en-IN')}`;
};

export const parseCurrency = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[₹,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// --- Date Parsing ---
// Converts Excel serial date number to JS Date object (assuming 1900 date system)
const excelSerialToDate = (serial: number): Date | null => {
  if (serial < 60) {
    // Serial 1 is 1900-01-01. Adjust for 0-based day calculation.
    // Excel incorrectly treats 1900 as a leap year, so serial 60 is 1900-02-29.
    // Subtracting 1 handles this for dates before 1900-03-01.
    return new Date((serial - 1) * 86400 * 1000 + Date.UTC(1900, 0, 1));
  } else {
    // For serial >= 60, subtract 2 to account for the leap year bug.
    return new Date((serial - 2) * 86400 * 1000 + Date.UTC(1900, 0, 1));
  }
};

// Parses a date string or Excel serial number into a normalized 'YYYY-MM-DD' string
export const parseDateString = (dateValue: string | number | null | undefined): string => {
  if (dateValue === null || dateValue === undefined || dateValue === '') {
    return '';
  }

  let dateObj: Date | null = null;

  if (typeof dateValue === 'number') {
    // Assume it's an Excel serial date
    dateObj = excelSerialToDate(dateValue);
  } else if (typeof dateValue === 'string') {
    // Try parsing as ISO string or other common formats
    const trimmedValue = dateValue.trim();
    if (trimmedValue === '') {
      return '';
    }
    const parsed = new Date(trimmedValue);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  }

  // If we successfully got a Date object, format it to 'YYYY-MM-DD'
  if (dateObj && !isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // If parsing failed, return the original string or empty
  return typeof dateValue === 'string' ? dateValue.trim() : '';
};

// --- Month Options ---
export const getMonthOptions = () => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    const month = new Date(0, i).toLocaleString('default', { month: 'long' });
    months.push({ value: i + 1, label: month });
  }
  return months;
};

// --- Export Helper (used in main component) ---
// This is kept here as it's closely tied to the PartySummary structure
export const prepareExportData = (partySummaries: PartySummary[]) => {
    const exportData = partySummaries.map((party) => ({
      'Party Name': party.partyName,
      'Tally Last Transaction Date': party.tallyLastTransactionDate,
      'Tally Cash Balance': party.tallyCashBalance,
      'ERP Last Transaction Date': party.erpLastTransactionDate,
      'ERP Cash Balance': party.erpCashBalance,
      'ERP Last Day End Date': party.erpLastDayEndDate,
      'ERP Last Day Cash Balance': party.erpLastDayCashBalance,
      'Audit Year': party.auditYear
    }));
    const ws = XLSX.utils.json_to_sheet(exportData, { origin: 'A1' });
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      const tallyCellRef = XLSX.utils.encode_cell({ c: 2, r: rowNum }); // Col C
      if (ws[tallyCellRef]) {
        ws[tallyCellRef].z = '"₹"#,##0';
      }
      const erpCellRef = XLSX.utils.encode_cell({ c: 4, r: rowNum }); // Col E
      if (ws[erpCellRef]) {
        ws[erpCellRef].z = '"₹"#,##0';
      }
      const erpDayEndCellRef = XLSX.utils.encode_cell({ c: 6, r: rowNum }); // Col G
      if (ws[erpDayEndCellRef]) {
        ws[erpDayEndCellRef].z = '"₹"#,##0';
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Party Summary');
    return wb;
    
};
