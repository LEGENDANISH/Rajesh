// src/components/AuditManagement/PartyForm.tsx
import React, { useState } from 'react';
import { X, Eye, EyeOff, Banknote } from 'lucide-react';
import { PartyDetails, BankAccount } from './types';

interface PartyFormProps {
  onClose: () => void;
  onSubmit: (partyData: Omit<PartyDetails, 'id'>, id?: number) => void; // onSubmit handler
  partyToEdit?: PartyDetails | null; // Optional prop for editing
}

const PartyForm: React.FC<PartyFormProps> = ({ onClose, onSubmit, partyToEdit }) => {
  const [formData, setFormData] = useState<Omit<PartyDetails, 'id'>>(() => {
    return partyToEdit
      ? {
          ...partyToEdit,
          bankAccounts: [...partyToEdit.bankAccounts] // Deep copy bank accounts
        }
      : {
          partyName: '',
          certificateNumber: '',
          address: '',
          panNumber: '',
          gstNumber: '',
          email: '',
          phone: '',
          bankAccounts: [
            {
              id: Date.now(), // Temporary ID for new accounts
              bankName: '',
              accountNumber: '',
              ifscCode: '',
              accountType: '',
              openingBalance: '0.00'
            }
          ],
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

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Determine if it's an edit or add based on partyToEdit prop
    const id = partyToEdit ? partyToEdit.id : undefined;
    onSubmit(formData, id); // Call parent's submit handler
    onClose(); // Close the form
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {partyToEdit ? 'Edit Party' : 'Add New Party'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Number
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
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
                      aria-label="Remove Account"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={account.bankName}
                      onChange={e => handleBankAccountChange(index, 'bankName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={account.accountNumber}
                      onChange={e => handleBankAccountChange(index, 'accountNumber', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={account.ifscCode}
                      onChange={e => handleBankAccountChange(index, 'ifscCode', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="HDFC0001234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <select
                      value={account.accountType}
                      onChange={e => handleBankAccountChange(index, 'accountType', e.target.value)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Balance
                    </label>
                    <input
                      type="text"
                      value={account.openingBalance}
                      onChange={e =>
                        handleBankAccountChange(index, 'openingBalance', e.target.value)
                      }
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ERP Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords['erp'] ? 'text' : 'password'}
                    name="erpPassword"
                    value={formData.erpPassword}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ERP password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('erp')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPasswords['erp'] ? "Hide password" : "Show password"}
                  >
                    {showPasswords['erp'] ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CMR Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords['cmr'] ? 'text' : 'password'}
                    name="cmrPassword"
                    value={formData.cmrPassword}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter CMR password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('cmr')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPasswords['cmr'] ? "Hide password" : "Show password"}
                  >
                    {showPasswords['cmr'] ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords['pdf'] ? 'text' : 'password'}
                    name="pdfPassword"
                    value={formData.pdfPassword}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter PDF password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('pdf')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPasswords['pdf'] ? "Hide password" : "Show password"}
                  >
                    {showPasswords['pdf'] ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSC Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords['csc'] ? 'text' : 'password'}
                    name="cscPassword"
                    value={formData.cscPassword}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter CSC password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('csc')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPasswords['csc'] ? "Hide password" : "Show password"}
                  >
                    {showPasswords['csc'] ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {partyToEdit ? 'Update Party' : 'Save Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartyForm;

