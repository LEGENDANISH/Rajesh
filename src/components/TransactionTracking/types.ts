// src/components/TransactionTracking/types.ts
export interface PartySummary {
  id: string;
  partyName: string;
  tallyLastTransactionDate: string; // ISO String format 'YYYY-MM-DD'
  tallyCashBalance: number;
  erpLastTransactionDate: string; // ISO String format 'YYYY-MM-DD'
  erpCashBalance: number;
  erpLastDayEndDate: string; // ISO String format 'YYYY-MM-DD'
  erpLastDayCashBalance: number;
  auditYear: string; // e.g., '2023-24'
  // --- Add/Ensure this line ---
  email?: string; // Optional email field (might come from DB fetch)
}

export type SelectedTabType = 'TALLY' | 'ERP' | 'AUDIT';
export type PopupMode = 'PENDING' | 'DONE' | null;
export interface CustomDateRange {
  start: string | null;
  end: string | null;
}

// --- Add this new type for fetched email data ---
export type FetchedEmails = Record<string, string | null>; // party.id -> email or null if not found