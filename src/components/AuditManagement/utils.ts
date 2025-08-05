// src/components/AuditManagement/utils.ts
import * as XLSX from 'xlsx';
import { AuditRecord, PartyDetails } from './types';

// --- Import Functions ---

export const importAuditRecords = (
  file: File,
  setAuditRecords: React.Dispatch<React.SetStateAction<AuditRecord[]>>,
  setYearwiseSummary: React.Dispatch<React.SetStateAction<any[]>> // You might want to type this better
): void => {
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const bstr = evt.target?.result;
      if (!bstr || typeof bstr !== 'string') {
        throw new Error('Failed to read file content.');
      }
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

      // Skip header row
      const rows = data.slice(1);

      // Transform data to AuditRecord format
      const importedRecords: AuditRecord[] = rows
        .map((row, index) => {
          // Assuming column order: Party, Year, Start Date, End Date, Status, Auditor, Completion Date, PDF Generated
          const [
            party = '',
            year = '',
            startDate = '',
            endDate = '',
            status = 'pending',
            auditor = '',
            completionDate = null,
            pdfGenerated = false
          ] = row;

          return {
            id: Date.now() + index, // Generate unique ID
            party: String(party),
            year: String(year),
            startDate: String(startDate),
            endDate: String(endDate),
            status:
              status === 'completed' || status === 'in-progress' || status === 'pending'
                ? status
                : 'pending',
            auditor: String(auditor),
            completionDate: completionDate ? String(completionDate) : null,
            pdfGenerated: Boolean(pdfGenerated)
          };
        })
        .filter(record => record.party); // Filter out empty rows

      setAuditRecords(importedRecords);
      // Note: calculateSummary needs to be accessible or passed here
      // setYearwiseSummary(calculateSummary(importedRecords));
    } catch (error) {
      console.error('Error importing audit file:', error);
      alert('Error importing audit file. Please check the format.');
    }
  };

  reader.readAsBinaryString(file);
};

export const importPartyDetails = (
  file: File,
  setPartyDetails: React.Dispatch<React.SetStateAction<PartyDetails[]>>
): void => {
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const bstr = evt.target?.result;
      if (!bstr || typeof bstr !== 'string') {
        throw new Error('Failed to read file content.');
      }
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

      // Skip header row
      const rows = data.slice(1);

      // Transform data to PartyDetails format (handles only first bank account from flat structure)
      const importedParties: PartyDetails[] = rows
        .map((row, index) => {
          const [
            partyName = '',
            certificateNumber = '',
            address = '',
            panNumber = '',
            gstNumber = '',
            email = '',
            phone = '',
            bankName = '',
            accountNumber = '',
            ifscCode = '',
            accountType = '',
            openingBalance = '0.00',
            erpId = '',
            erpPassword = '',
            cmrId = '',
            cmrPassword = '',
            pdfId = '',
            pdfPassword = '',
            cscId = '',
            cscPassword = ''
          ] = row;

          return {
            id: Date.now() + index, // Generate unique ID
            partyName: String(partyName),
            certificateNumber: String(certificateNumber),
            address: String(address),
            panNumber: String(panNumber),
            gstNumber: String(gstNumber),
            email: String(email),
            phone: String(phone),
            bankAccounts: [
              {
                id: 1, // Simplified, might need unique ID
                bankName: String(bankName),
                accountNumber: String(accountNumber),
                ifscCode: String(ifscCode),
                accountType: String(accountType),
                openingBalance: String(openingBalance)
              }
            ],
            erpId: String(erpId),
            erpPassword: String(erpPassword),
            cmrId: String(cmrId),
            cmrPassword: String(cmrPassword),
            pdfId: String(pdfId),
            pdfPassword: String(pdfPassword),
            cscId: String(cscId),
            cscPassword: String(cscPassword)
          };
        })
        .filter(party => party.partyName); // Filter out empty rows

      setPartyDetails(importedParties);
    } catch (error) {
      console.error('Error importing party file:', error);
      alert('Error importing party file. Please check the format.');
    }
  };

  reader.readAsBinaryString(file);
};

// --- Export Functions ---

export const exportAuditRecords = (auditRecords: AuditRecord[]): void => {
  // Prepare data for export
  const exportData = auditRecords.map(record => ({
    'Party': record.party,
    'Year': record.year,
    'Start Date': record.startDate,
    'End Date': record.endDate,
    'Status': record.status,
    'Auditor': record.auditor,
    'Completion Date': record.completionDate || '',
    'PDF Generated': record.pdfGenerated ? 'Yes' : 'No'
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Records');

  // Export to file
  XLSX.writeFile(wb, 'audit_records.xlsx');
};

export const exportPartyDetails = (partyDetails: PartyDetails[]): void => {
  // Prepare data for export (exports first bank account only for simplicity based on original structure)
  const exportData = partyDetails.map(party => ({
    'Party Name': party.partyName,
    'Certificate Number': party.certificateNumber,
    'Address': party.address,
    'PAN Number': party.panNumber,
    'GST Number': party.gstNumber,
    'Email ID': party.email,
    'Phone Number': party.phone,
    'Bank Name': party.bankAccounts[0]?.bankName || '',
    'Account Number': party.bankAccounts[0]?.accountNumber || '',
    'IFSC Code': party.bankAccounts[0]?.ifscCode || '',
    'Account Type': party.bankAccounts[0]?.accountType || '',
    'Opening Balance': party.bankAccounts[0]?.openingBalance || '',
    'ERP ID': party.erpId,
    'ERP Password': party.erpPassword,
    'CMR ID': party.cmrId,
    'CMR Password': party.cmrPassword,
    'PDF ID': party.pdfId,
    'PDF Password': party.pdfPassword,
    'CSC ID': party.cscId,
    'CSC Password': party.cscPassword
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Party Details');

  // Export to file
  XLSX.writeFile(wb, 'party_details.xlsx');
};

// --- Utility Functions ---

export const calculateSummary = (records: AuditRecord[]): any[] => { // Consider typing the return array properly
    const summaryMap: Record<string, { total: number; completed: number; pending: number }> = {};

    records.forEach(record => {
      if (!summaryMap[record.year]) {
        summaryMap[record.year] = { total: 0, completed: 0, pending: 0 };
      }

      summaryMap[record.year].total += 1;
      if (record.status === 'completed') {
        summaryMap[record.year].completed += 1;
      } else {
        summaryMap[record.year].pending += 1;
      }
    });

    const newSummary: any[] = Object.entries(summaryMap).map(([year, data]) => ({
      year,
      total: data.total,
      completed: data.completed,
      pending: data.pending,
      percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));

    // Sort by year descending
    newSummary.sort((a, b) => b.year.localeCompare(a.year));
    return newSummary;
  };