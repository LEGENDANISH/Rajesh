// src/components/AuditManagement/AuditManagement.tsx
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
  Edit
} from 'lucide-react';
import AuditForm from './AuditForm';
import PartyForm from './PartyForm';
import PartyDetailModal from './PartyDetailModal';
import { AuditRecord, PartyDetails, YearSummary } from './types';
import { importAuditRecords, importPartyDetails, exportAuditRecords, exportPartyDetails, calculateSummary } from './utils';

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
    return saved
      ? JSON.parse(saved)
      : [
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

  // Save party details to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('partyDetails', JSON.stringify(partyDetails));
  }, [partyDetails]);

  // Calculate summary initially and when auditRecords change
  useEffect(() => {
    setYearwiseSummary(calculateSummary(auditRecords));
  }, [auditRecords]);


  // --- Import Handlers ---
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importAuditRecords(file, setAuditRecords, setYearwiseSummary);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePartyFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importPartyDetails(file, setPartyDetails);
    // Reset file input
    if (partyFileInputRef.current) {
      partyFileInputRef.current.value = '';
    }
  };

  // --- Export Handlers ---
  const handleExport = () => {
    exportAuditRecords(auditRecords);
  };

  const handlePartyExport = () => {
    exportPartyDetails(partyDetails);
  };

  // --- Party Form Handlers ---
  const handlePartyFormSubmit = (partyData: Omit<PartyDetails, 'id'>, id?: number) => {
    if (id !== undefined) {
      // Update existing party
      setPartyDetails(prev =>
        prev.map(party => (party.id === id ? { ...partyData, id } : party))
      );
    } else {
      // Add new party
      const newParty: PartyDetails = {
        ...partyData,
        id: Date.now()
      };
      setPartyDetails(prev => [...prev, newParty]);
    }
    setEditingPartyId(null); // Clear editing state
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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Management</h2>
          <p className="text-gray-600">Track audit progress and generate reports</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Audits</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Start Audit</span>
          </button>
        </div>
      </div>

      {/* Year-wise Summary */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Year-wise Audit Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {yearwiseSummary.map((year, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-900">{year.year}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    year.percentage === 100
                      ? 'bg-green-100 text-green-800'
                      : year.percentage >= 80
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {year.percentage}%
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{year.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-green-600">{year.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-amber-600">{year.pending}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    year.percentage === 100
                      ? 'bg-green-500'
                      : year.percentage >= 80
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${year.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
            {partyDetails.map(party => (
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
                    onClick={e => {
                      e.stopPropagation();
                      setEditingPartyId(party.id);
                      setShowPartyForm(true);
                    }}
                    className="text-gray-400 hover:text-blue-600"
                    aria-label={`Edit ${party.partyName}`}
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

      {/* Audit Records */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Audit Records</h3>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Party
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Auditor
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  PDF
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditRecords.map(audit => (
                <tr key={audit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{audit.party}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {audit.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(audit.startDate).toLocaleDateString()} -{' '}
                    {new Date(audit.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {audit.auditor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {audit.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {audit.status === 'in-progress' && (
                        <Clock className="w-4 h-4 text-blue-600" />
                      )}
                      {audit.status === 'pending' && (
                        <XCircle className="w-4 h-4 text-amber-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          audit.status === 'completed'
                            ? 'text-green-600'
                            : audit.status === 'in-progress'
                            ? 'text-blue-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {audit.status.replace('-', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {audit.pdfGenerated ? (
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Download</span>
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">Not available</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    {audit.status !== 'completed' && (
                      <button className="text-green-600 hover:text-green-900">
                        <FileCheck className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && <AuditForm onClose={() => setShowForm(false)} partyDetails={partyDetails} />}
      {showPartyForm && (
        <PartyForm
          onClose={() => {
            setShowPartyForm(false);
            setEditingPartyId(null);
          }}
          onSubmit={handlePartyFormSubmit}
          partyToEdit={
            editingPartyId !== null
              ? partyDetails.find(p => p.id === editingPartyId) || null
              : null
          }
        />
      )}
      {selectedParty && (
        <PartyDetailModal party={selectedParty} onClose={() => setSelectedParty(null)} />
      )}
    </div>
  );
};

export default AuditManagement;