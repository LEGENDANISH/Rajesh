import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Eye,
  Filter,
  Upload,
  Edit,
  Save,
  X,
  Lock,
  EyeOff,
  Banknote
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Define TypeScript interfaces for better type safety
interface AuditRecord {
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

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  openingBalance: string;
}

interface PartyDetails {
  id: number;
  partyName: string;
  certificateNumber: string;
  address: string;
  panNumber: string;
  gstNumber: string;
  email: string;
  phone: string;
  bankAccounts: BankAccount[];
  erpId: string;
  erpPassword: string;
  cmrId: string;
  cmrPassword: string;
  pdfId: string;
  pdfPassword: string;
  cscId: string;
  cscPassword: string;
}

interface YearSummary {
  year: string;
  total: number;
  completed: number;
  pending: number;
  percentage: number;
}

const AuditManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showPartyForm, setShowPartyForm] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PartyDetails | null>(null);
  const [editingPartyId, setEditingPartyId] = useState<number | null>(null);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([
    {
      id: 1,
      year: '2024-25',
      party: 'ABC Enterprises',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      status: 'completed',
      auditor: 'CA. John Smith',
      completionDate: '2025-01-31',
      pdfGenerated: true
    },
    {
      id: 2,
      year: '2024-25',
      party: 'XYZ Corporation',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      status: 'in-progress',
      auditor: 'CA. Jane Doe',
      completionDate: null,
      pdfGenerated: false
    },
    {
      id: 3,
      year: '2023-24',
      party: 'Global Industries',
      startDate: '2024-04-01',
      endDate: '2024-03-31',
      status: 'pending',
      auditor: 'CA. Mike Johnson',
      completionDate: null,
      pdfGenerated: false
    }
  ]);
  
  const [partyDetails, setPartyDetails] = useState<PartyDetails[]>(() => {
    const saved = localStorage.getItem('partyDetails');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        partyName: 'ABC Enterprises',
        certificateNumber: 'CERT001',
        address: '123 Business Street, Mumbai, Maharashtra 400001',
        panNumber: 'ABCDE1234F',
        gstNumber: '27ABCDE1234F1Z5',
        email: 'contact@abc.com',
        phone: '+91 98765 43210',
        bankAccounts: [
          {
            id: 1,
            bankName: 'HDFC Bank',
            accountNumber: '12345678901234',
            ifscCode: 'HDFC0001234',
            accountType: 'Savings Account',
            openingBalance: '0.00'
          }
        ],
        erpId: 'ERP001',
        erpPassword: 'pass123',
        cmrId: 'CMR001',
        cmrPassword: 'pass456',
        pdfId: 'PDF001',
        pdfPassword: 'pass789',
        cscId: 'CSC001',
        cscPassword: 'pass012'
      },
      {
        id: 2,
        partyName: 'XYZ Corporation',
        certificateNumber: 'CERT002',
        address: '456 Corporate Avenue, Delhi, Delhi 110001',
        panNumber: 'FGHIJ5678K',
        gstNumber: '07FGHIJ5678K3M9',
        email: 'info@xyzcorp.com',
        phone: '+91 87654 32109',
        bankAccounts: [
          {
            id: 1,
            bankName: 'ICICI Bank',
            accountNumber: '98765432109876',
            ifscCode: 'ICICI0009876',
            accountType: 'Current Account',
            openingBalance: '10000.00'
          }
        ],
        erpId: 'ERP002',
        erpPassword: 'erp123',
        cmrId: 'CMR002',
        cmrPassword: 'cmr456',
        pdfId: 'PDF002',
        pdfPassword: 'pdf789',
        cscId: 'CSC002',
        cscPassword: 'csc012'
      },
      {
        id: 3,
        partyName: 'Global Industries',
        certificateNumber: 'CERT003',
        address: '789 Industrial Area, Bangalore, Karnataka 560001',
        panNumber: 'LMNOP9876Q',
        gstNumber: '29LMNOP9876Q5R1',
        email: 'support@globalind.com',
        phone: '+91 76543 21098',
        bankAccounts: [
          {
            id: 1,
            bankName: 'State Bank of India',
            accountNumber: '11223344556677',
            ifscCode: 'SBIN0001122',
            accountType: 'Current Account',
            openingBalance: '50000.00'
          }
        ],
        erpId: 'ERP003',
        erpPassword: 'global123',
        cmrId: 'CMR003',
        cmrPassword: 'ind456',
        pdfId: 'PDF003',
        pdfPassword: 'doc789',
        cscId: 'CSC003',
        cscPassword: 'secure012'
      }
    ];
  });
  
  const [yearwiseSummary, setYearwiseSummary] = useState<YearSummary[]>([
    { year: '2024-25', total: 45, completed: 38, pending: 7, percentage: 84 },
    { year: '2023-24', total: 42, completed: 42, pending: 0, percentage: 100 },
    { year: '2022-23', total: 38, completed: 36, pending: 2, percentage: 95 },
    { year: '2021-22', total: 35, completed: 35, pending: 0, percentage: 100 }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const partyFileInputRef = useRef<HTMLInputElement>(null);
  
  // Password visibility states
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Save party details to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('partyDetails', JSON.stringify(partyDetails));
  }, [partyDetails]);

  // Calculate summary data from audit records
  const calculateSummary = (records: AuditRecord[]) => {
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
    
    const newSummary: YearSummary[] = Object.entries(summaryMap).map(([year, data]) => ({
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

  // Handle Excel file import for audit records
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];
        
        // Skip header row
        const rows = data.slice(1);
        
        // Transform data to AuditRecord format
        const importedRecords: AuditRecord[] = rows.map((row, index) => {
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
            status: status === 'completed' || status === 'in-progress' || status === 'pending' 
              ? status 
              : 'pending',
            auditor: String(auditor),
            completionDate: completionDate ? String(completionDate) : null,
            pdfGenerated: Boolean(pdfGenerated)
          };
        }).filter(record => record.party); // Filter out empty rows
        
        setAuditRecords(importedRecords);
        setYearwiseSummary(calculateSummary(importedRecords));
      } catch (error) {
        console.error('Error importing file:', error);
        alert('Error importing file. Please check the format.');
      }
    };
    
    reader.readAsBinaryString(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Excel file import for party details
  const handlePartyFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];
        
        // Skip header row
        const rows = data.slice(1);
        
        // Transform data to PartyDetails format
        const importedParties: PartyDetails[] = rows.map((row, index) => {
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
            bankAccounts: [{
              id: 1,
              bankName: String(bankName),
              accountNumber: String(accountNumber),
              ifscCode: String(ifscCode),
              accountType: String(accountType),
              openingBalance: String(openingBalance)
            }],
            erpId: String(erpId),
            erpPassword: String(erpPassword),
            cmrId: String(cmrId),
            cmrPassword: String(cmrPassword),
            pdfId: String(pdfId),
            pdfPassword: String(pdfPassword),
            cscId: String(cscId),
            cscPassword: String(cscPassword)
          };
        }).filter(party => party.partyName); // Filter out empty rows
        
        setPartyDetails(importedParties);
      } catch (error) {
        console.error('Error importing party file:', error);
        alert('Error importing party file. Please check the format.');
      }
    };
    
    reader.readAsBinaryString(file);
    // Reset file input
    if (partyFileInputRef.current) {
      partyFileInputRef.current.value = '';
    }
  };

  // Export audit records to Excel
  const handleExport = () => {
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

  // Export party details to Excel
  const handlePartyExport = () => {
    // Prepare data for export
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

  const AuditForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Start New Audit</h2>
          <button 
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Party Name</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Select Party</option>
                {partyDetails.map((party, i) => (
                  <option key={i} value={party.partyName}>{party.partyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {Array.from(new Set(auditRecords.map(r => r.year))).map((year, i) => (
                  <option key={i} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input 
                type="date" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input 
                type="date" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Auditor</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="CA. Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Audit Type</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Internal Audit</option>
                <option>Statutory Audit</option>
                <option>Tax Audit</option>
                <option>Compliance Audit</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button 
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const PartyForm = () => {
    const [formData, setFormData] = useState<Omit<PartyDetails, 'id'>>(() => {
      const partyToEdit = partyDetails.find(p => p.id === editingPartyId);
      return partyToEdit ? {
        ...partyToEdit,
        bankAccounts: [...partyToEdit.bankAccounts]
      } : {
        partyName: '',
        certificateNumber: '',
        address: '',
        panNumber: '',
        gstNumber: '',
        email: '',
        phone: '',
        bankAccounts: [{
          id: Date.now(),
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          accountType: '',
          openingBalance: '0.00'
        }],
        erpId: '',
        erpPassword: '',
        cmrId: '',
        cmrPassword: '',
        pdfId: '',
        pdfPassword: '',
        cscId: '',
        cscPassword: ''
      };
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBankAccountChange = (index: number, field: keyof BankAccount, value: string) => {
      const updatedAccounts = [...formData.bankAccounts];
      updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
      setFormData(prev => ({ ...prev, bankAccounts: updatedAccounts }));
    };

    const addBankAccount = () => {
      setFormData(prev => ({
        ...prev,
        bankAccounts: [
          ...prev.bankAccounts,
          {
            id: Date.now(),
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            accountType: '',
            openingBalance: '0.00'
          }
        ]
      }));
    };

    const removeBankAccount = (index: number) => {
      if (formData.bankAccounts.length <= 1) return;
      const updatedAccounts = [...formData.bankAccounts];
      updatedAccounts.splice(index, 1);
      setFormData(prev => ({ ...prev, bankAccounts: updatedAccounts }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingPartyId) {
        // Update existing party
        setPartyDetails(prev => prev.map(party => 
          party.id === editingPartyId ? { ...formData, id: editingPartyId } : party
        ));
      } else {
        // Add new party
        const newParty: PartyDetails = {
          ...formData,
          id: Date.now()
        };
        setPartyDetails(prev => [...prev, newParty]);
      }
      setShowPartyForm(false);
      setEditingPartyId(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingPartyId ? 'Edit Party' : 'Add New Party'}
            </h2>
            <button 
              onClick={() => {
                setShowPartyForm(false);
                setEditingPartyId(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Party Name</label>
                  <input
                    type="text"
                    name="partyName"
                    value={formData.partyName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter party name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Number</label>
                  <input
                    type="text"
                    name="certificateNumber"
                    value={formData.certificateNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter certificate number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="27ABCDE1234F1Z5"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Banking Information</h3>
                <button
                  type="button"
                  onClick={addBankAccount}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Banknote className="w-4 h-4 mr-1" />
                  Add Another Account
                </button>
              </div>
              
              {formData.bankAccounts.map((account, index) => (
                <div key={account.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Bank Account #{index + 1}</h4>
                    {formData.bankAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBankAccount(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={account.bankName}
                        onChange={(e) => handleBankAccountChange(index, 'bankName', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={account.accountNumber}
                        onChange={(e) => handleBankAccountChange(index, 'accountNumber', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        value={account.ifscCode}
                        onChange={(e) => handleBankAccountChange(index, 'ifscCode', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="HDFC0001234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                      <select
                        value={account.accountType}
                        onChange={(e) => handleBankAccountChange(index, 'accountType', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Account Type</option>
                        <option value="Savings Account">Savings Account</option>
                        <option value="Current Account">Current Account</option>
                        <option value="Fixed Deposit">Fixed Deposit</option>
                        <option value="Recurring Deposit">Recurring Deposit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Opening Balance</label>
                      <input
                        type="text"
                        value={account.openingBalance}
                        onChange={(e) => handleBankAccountChange(index, 'openingBalance', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Credentials */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ERP ID</label>
                  <input
                    type="text"
                    name="erpId"
                    value={formData.erpId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ERP ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ERP Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords[`erp-${editingPartyId || 'new'}`] ? "text" : "password"}
                      name="erpPassword"
                      value={formData.erpPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter ERP password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        [`erp-${editingPartyId || 'new'}`]: !prev[`erp-${editingPartyId || 'new'}`]
                      }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords[`erp-${editingPartyId || 'new'}`] ? 
                        <EyeOff className="h-5 w-5 text-gray-500" /> : 
                        <Eye className="h-5 w-5 text-gray-500" />
                      }
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CMR ID</label>
                  <input
                    type="text"
                    name="cmrId"
                    value={formData.cmrId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter CMR ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CMR Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords[`cmr-${editingPartyId || 'new'}`] ? "text" : "password"}
                      name="cmrPassword"
                      value={formData.cmrPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter CMR password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        [`cmr-${editingPartyId || 'new'}`]: !prev[`cmr-${editingPartyId || 'new'}`]
                      }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords[`cmr-${editingPartyId || 'new'}`] ? 
                        <EyeOff className="h-5 w-5 text-gray-500" /> : 
                        <Eye className="h-5 w-5 text-gray-500" />
                      }
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PDF ID</label>
                  <input
                    type="text"
                    name="pdfId"
                    value={formData.pdfId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter PDF ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PDF Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords[`pdf-${editingPartyId || 'new'}`] ? "text" : "password"}
                      name="pdfPassword"
                      value={formData.pdfPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter PDF password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        [`pdf-${editingPartyId || 'new'}`]: !prev[`pdf-${editingPartyId || 'new'}`]
                      }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords[`pdf-${editingPartyId || 'new'}`] ? 
                        <EyeOff className="h-5 w-5 text-gray-500" /> : 
                        <Eye className="h-5 w-5 text-gray-500" />
                      }
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CSC ID</label>
                  <input
                    type="text"
                    name="cscId"
                    value={formData.cscId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter CSC ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CSC Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords[`csc-${editingPartyId || 'new'}`] ? "text" : "password"}
                      name="cscPassword"
                      value={formData.cscPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter CSC password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        [`csc-${editingPartyId || 'new'}`]: !prev[`csc-${editingPartyId || 'new'}`]
                      }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords[`csc-${editingPartyId || 'new'}`] ? 
                        <EyeOff className="h-5 w-5 text-gray-500" /> : 
                        <Eye className="h-5 w-5 text-gray-500" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button 
                type="button"
                onClick={() => {
                  setShowPartyForm(false);
                  setEditingPartyId(null);
                }}
                className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingPartyId ? 'Update Party' : 'Save Party'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Party Detail Modal
  const PartyDetailModal = () => {
    if (!selectedParty) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{selectedParty.partyName}</h2>
            <button 
              onClick={() => setSelectedParty(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Party Name</p>
                  <p className="font-medium">{selectedParty.partyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Certificate Number</p>
                  <p className="font-medium">{selectedParty.certificateNumber}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedParty.address}</p>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Tax Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">PAN Number</p>
                  <p className="font-medium">{selectedParty.panNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">GST Number</p>
                  <p className="font-medium">{selectedParty.gstNumber}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email ID</p>
                  <p className="font-medium">{selectedParty.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{selectedParty.phone}</p>
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Banking Information</h3>
              {selectedParty.bankAccounts.map((account, index) => (
                <div key={account.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Bank Account #{index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="font-medium">{account.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Number</p>
                      <p className="font-medium">{account.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">IFSC Code</p>
                      <p className="font-medium">{account.ifscCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Type</p>
                      <p className="font-medium">{account.accountType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Opening Balance</p>
                      <p className="font-medium">{account.openingBalance}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Credentials */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">System Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">ERP ID</p>
                    <p className="font-medium">{selectedParty.erpId}</p>
                  </div>
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">ERP Password</p>
                    <p className="font-medium">
                      {showPasswords[`erp-${selectedParty.id}`] ? selectedParty.erpPassword : '••••••••'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      [`erp-${selectedParty.id}`]: !prev[`erp-${selectedParty.id}`]
                    }))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords[`erp-${selectedParty.id}`] ? 
                      <EyeOff className="w-5 h-5" /> : 
                      <Eye className="w-5 h-5" />
                    }
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">CMR ID</p>
                    <p className="font-medium">{selectedParty.cmrId}</p>
                  </div>
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">CMR Password</p>
                    <p className="font-medium">
                      {showPasswords[`cmr-${selectedParty.id}`] ? selectedParty.cmrPassword : '••••••••'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      [`cmr-${selectedParty.id}`]: !prev[`cmr-${selectedParty.id}`]
                    }))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords[`cmr-${selectedParty.id}`] ? 
                      <EyeOff className="w-5 h-5" /> : 
                      <Eye className="w-5 h-5" />
                    }
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">PDF ID</p>
                    <p className="font-medium">{selectedParty.pdfId}</p>
                  </div>
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">PDF Password</p>
                    <p className="font-medium">
                      {showPasswords[`pdf-${selectedParty.id}`] ? selectedParty.pdfPassword : '••••••••'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      [`pdf-${selectedParty.id}`]: !prev[`pdf-${selectedParty.id}`]
                    }))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords[`pdf-${selectedParty.id}`] ? 
                      <EyeOff className="w-5 h-5" /> : 
                      <Eye className="w-5 h-5" />
                    }
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">CSC ID</p>
                    <p className="font-medium">{selectedParty.cscId}</p>
                  </div>
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">CSC Password</p>
                    <p className="font-medium">
                      {showPasswords[`csc-${selectedParty.id}`] ? selectedParty.cscPassword : '••••••••'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      [`csc-${selectedParty.id}`]: !prev[`csc-${selectedParty.id}`]
                    }))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords[`csc-${selectedParty.id}`] ? 
                      <EyeOff className="w-5 h-5" /> : 
                      <Eye className="w-5 h-5" />
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".xlsx, .xls"
        className="hidden"
      />
      <input
        type="file"
        ref={partyFileInputRef}
        onChange={handlePartyFileImport}
        accept=".xlsx, .xls"
        className="hidden"
      />
      
 

      {/* Party Details Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Party Details</h3>
            <div className="flex space-x-3">
              <button 
                onClick={() => partyFileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button 
                onClick={handlePartyExport}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={() => {
                  setEditingPartyId(null);
                  setShowPartyForm(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Party</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partyDetails.map((party) => (
              <div 
                key={party.id} 
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedParty(party)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{party.partyName}</h4>
                    <p className="text-sm text-gray-500 mt-1">{party.certificateNumber}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPartyId(party.id);
                      setShowPartyForm(true);
                    }}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">PAN:</span>
                    <span className="font-medium">{party.panNumber}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">GST:</span>
                    <span className="font-medium">{party.gstNumber}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Email:</span>
                    <span className="font-medium truncate">{party.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Phone:</span>
                    <span className="font-medium">{party.phone}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Click to view details</span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      

      {showForm && <AuditForm />}
      {showPartyForm && <PartyForm />}
      {selectedParty && <PartyDetailModal />}
    </div>
  );
};

export default AuditManagement;