    // src/components/AuditManagement/types.ts

export interface AuditRecord {
  id: number;
  year: string;
  party: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'pending';
  auditor: string;
  completionDate: string | null;
  pdfGenerated: boolean;
}

export interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  openingBalance: string;
}

export interface PartyDetails {
  id: number;
  partyName: string;
  certificateNumber: string;
  address: string;
  panNumber: string;
  gstNumber: string;
  email: string;
  phone: string;
  bankAccounts: BankAccount[]; // Changed to array
  erpId: string;
  erpPassword: string;
  cmrId: string;
  cmrPassword: string;
  pdfId: string;
  pdfPassword: string;
  cscId: string;
  cscPassword: string;
}

export interface YearSummary {
  year: string;
  total: number;
  completed: number;
  pending: number;
  percentage: number;
}