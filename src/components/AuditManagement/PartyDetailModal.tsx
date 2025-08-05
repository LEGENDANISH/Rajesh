

// src/components/AuditManagement/PartyDetailModal.tsx
import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import { PartyDetails } from './types';

interface PartyDetailModalProps {
  party: PartyDetails;
  onClose: () => void;
}

const PartyDetailModal: React.FC<PartyDetailModalProps> = ({ party, onClose }) => {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{party.partyName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Party Name</p>
                <p className="font-medium">{party.partyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Certificate Number</p>
                <p className="font-medium">{party.certificateNumber}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{party.address}</p>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Tax Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">PAN Number</p>
                <p className="font-medium">{party.panNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">GST Number</p>
                <p className="font-medium">{party.gstNumber}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email ID</p>
                <p className="font-medium">{party.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{party.phone}</p>
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Banking Information
            </h3>
            {party.bankAccounts.map((account, index) => (
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              System Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">ERP ID</p>
                  <p className="font-medium">{party.erpId}</p>
                </div>
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">ERP Password</p>
                  <p className="font-medium">
                    {showPasswords['erp'] ? party.erpPassword : '••••••••'}
                  </p>
                </div>
                <button
                  onClick={() => togglePasswordVisibility('erp')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={showPasswords['erp'] ? "Hide password" : "Show password"}
                >
                  {showPasswords['erp'] ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">CMR ID</p>
                  <p className="font-medium">{party.cmrId}</p>
                </div>
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">CMR Password</p>
                  <p className="font-medium">
                    {showPasswords['cmr'] ? party.cmrPassword : '••••••••'}
                  </p>
                </div>
                <button
                  onClick={() => togglePasswordVisibility('cmr')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={showPasswords['cmr'] ? "Hide password" : "Show password"}
                >
                  {showPasswords['cmr'] ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">PDF ID</p>
                  <p className="font-medium">{party.pdfId}</p>
                </div>
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">PDF Password</p>
                  <p className="font-medium">
                    {showPasswords['pdf'] ? party.pdfPassword : '••••••••'}
                  </p>
                </div>
                <button
                  onClick={() => togglePasswordVisibility('pdf')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={showPasswords['pdf'] ? "Hide password" : "Show password"}
                >
                  {showPasswords['pdf'] ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">CSC ID</p>
                  <p className="font-medium">{party.cscId}</p>
                </div>
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">CSC Password</p>
                  <p className="font-medium">
                    {showPasswords['csc'] ? party.cscPassword : '••••••••'}
                  </p>
                </div>
                <button
                  onClick={() => togglePasswordVisibility('csc')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={showPasswords['csc'] ? "Hide password" : "Show password"}
                >
                  {showPasswords['csc'] ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyDetailModal;