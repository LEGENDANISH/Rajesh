// src/components/TransactionTracking/DetailPopup.tsx
import React, { useMemo } from 'react';
import { Edit3 } from 'lucide-react';
import { PartySummary, PopupMode, SelectedTabType } from './types';
import { formatCurrency, parseCurrency } from './utils';

interface DetailPopupProps {
  mode: PopupMode;
  selectedTab: SelectedTabType;
  comparisonDate: Date; // This is the date used for filtering (end of custom range or selectedDate)
  parties: PartySummary[];
  onClose: () => void;
  onUpdateParty: (updated: PartySummary) => void;
  editingPartyId: string | null;
  setEditingPartyId: (id: string | null) => void;
  editFormData: PartySummary;
  setEditFormData: (p: PartySummary) => void;
  isOpen: boolean;
}

const DetailPopup: React.FC<DetailPopupProps> = ({
  mode,
  selectedTab,
  comparisonDate,
  parties,
  onClose,
  onUpdateParty,
  editingPartyId,
  setEditingPartyId,
  editFormData,
  setEditFormData,
  isOpen
}) => {
  if (!isOpen || !mode) return null;

  // --- Popup Filtering Logic ---
  const isDone = (party: PartySummary): boolean => {
    if (selectedTab === 'AUDIT') {
      return !!(party.auditYear && party.auditYear.trim() !== '');
    }

    // Requirement: For TALLY tab, popup checks if ANY of erpLastTransactionDate OR tallyLastTransactionDate OR erpLastDayEndDate is AFTER the selected date.
    // If ANY date is after or equal, the party is Done. Otherwise, it's Pending.
    if (selectedTab === 'TALLY') {
        const dateFieldsToCheck: (keyof PartySummary)[] = ['erpLastTransactionDate', 'tallyLastTransactionDate', 'erpLastDayEndDate'];
        for (const dateField of dateFieldsToCheck) {
            const dateString = party[dateField];
            if (typeof dateString === 'string' && dateString) {
                const partyDate = new Date(dateString);
                if (!isNaN(partyDate.getTime())) {
                    partyDate.setHours(0, 0, 0, 0);
                    // If any date is >= selected date, it's considered "Done"
                    if (partyDate >= comparisonDate) {
                        return true; // Done
                    }
                }
            }
        }
        // If none of the dates are >= selected date, it's "Pending"
        return false;
    }

    // Default ERP logic (can be adjusted if needed)
    // Original logic: Done if erpLastTransactionDate <= selected date
    // New logic (based on your clarification): Done if erpLastTransactionDate >= selected date
    const dateField: keyof PartySummary =
      selectedTab === 'ERP' ? 'erpLastTransactionDate' : 'tallyLastTransactionDate';
    const dateString = party[dateField];
    if (!dateString) return false;
    const partyDate = new Date(dateString);
    if (isNaN(partyDate.getTime())) return false; // Invalid date
    partyDate.setHours(0, 0, 0, 0);
    // Changed from <= to >= based on your clarification
    return partyDate >= comparisonDate;
  };

  const filtered = useMemo(
    () => {
        return parties.filter(p => (mode === 'DONE' ? isDone(p) : !isDone(p)));
    },
    [parties, mode, selectedTab, comparisonDate] // Ensure this re-runs when these change
  );

  const startEdit = (party: PartySummary) => {
    setEditingPartyId(party.id);
    setEditFormData({ ...party });
  };

  const saveEdit = () => {
    if (editingPartyId) {
      onUpdateParty(editFormData);
      setEditingPartyId(null);
    }
  };

  const cancelEdit = () => {
    setEditingPartyId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (
      name === 'tallyCashBalance' ||
      name === 'erpCashBalance' ||
      name === 'erpLastDayCashBalance'
    ) {
      setEditFormData({
        ...editFormData,
        [name]: parseCurrency(value)
      } as PartySummary); // Type assertion needed due to dynamic key
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      } as PartySummary); // Type assertion needed due to dynamic key
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === 'DONE' ? 'Done' : 'Pending'} Parties ({selectedTab})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Close
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Party Name</th>
                  {selectedTab !== 'AUDIT' && (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                        {selectedTab === 'ERP'
                          ? 'ERP Last Transaction Date'
                          : 'Tally Last Transaction Date'}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Cash Balance</th>
                    </>
                  )}
                  {selectedTab === 'ERP' && (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                        ERP Last Day End Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                        ERP Last Day Cash Balance
                      </th>
                    </>
                  )}
                  {selectedTab === 'AUDIT' && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Audit Year</th>
                  )}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((party) => {
                  const editing = editingPartyId === party.id;
                  return (
                    <tr key={party.id} className="hover:bg-gray-50">
                      {editing ? (
                        <>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              name="partyName"
                              value={editFormData.partyName}
                              onChange={handleChange}
                              className="w-full p-1 border rounded"
                            />
                          </td>
                          {selectedTab !== 'AUDIT' && (
                            <>
                              <td className="px-4 py-2">
                                <input
                                  type="date"
                                  name={
                                    selectedTab === 'ERP'
                                      ? 'erpLastTransactionDate'
                                      : 'tallyLastTransactionDate'
                                  }
                                  value={
                                    selectedTab === 'ERP'
                                      ? editFormData.erpLastTransactionDate
                                      : editFormData.tallyLastTransactionDate
                                  }
                                  onChange={handleChange}
                                  className="w-full p-1 border rounded"
                                />
                              </td>
                              <td className="px-4 py-2 text-right">
                                <input
                                  type="text"
                                  name={
                                    selectedTab === 'ERP'
                                      ? 'erpCashBalance'
                                      : 'tallyCashBalance'
                                  }
                                  value={
                                    selectedTab === 'ERP'
                                      ? formatCurrency(editFormData.erpCashBalance)
                                      : formatCurrency(editFormData.tallyCashBalance)
                                  }
                                  onChange={handleChange}
                                  className="w-full p-1 border rounded text-right"
                                />
                              </td>
                            </>
                          )}
                          {selectedTab === 'ERP' && (
                            <>
                              <td className="px-4 py-2">
                                <input
                                  type="date"
                                  name="erpLastDayEndDate"
                                  value={editFormData.erpLastDayEndDate}
                                  onChange={handleChange}
                                  className="w-full p-1 border rounded"
                                />
                              </td>
                              <td className="px-4 py-2 text-right">
                                <input
                                  type="text"
                                  name="erpLastDayCashBalance"
                                  value={formatCurrency(editFormData.erpLastDayCashBalance)}
                                  onChange={handleChange}
                                  className="w-full p-1 border rounded text-right"
                                />
                              </td>
                            </>
                          )}
                          {selectedTab === 'AUDIT' && (
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                name="auditYear"
                                value={editFormData.auditYear}
                                onChange={handleChange}
                                className="w-full p-1 border rounded"
                              />
                            </td>
                          )}
                          <td className="px-4 py-2">
                            <button
                              onClick={saveEdit}
                              className="mr-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 font-medium">{party.partyName}</td>
                          {selectedTab !== 'AUDIT' && (
                            <>
                              <td className="px-4 py-2">
                                {selectedTab === 'ERP'
                                  ? party.erpLastTransactionDate
                                  : party.tallyLastTransactionDate}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {selectedTab === 'ERP'
                                  ? formatCurrency(party.erpCashBalance)
                                  : formatCurrency(party.tallyCashBalance)}
                              </td>
                            </>
                          )}
                          {selectedTab === 'ERP' && (
                            <>
                              <td className="px-4 py-2">{party.erpLastDayEndDate}</td>
                              <td className="px-4 py-2 text-right">
                                {formatCurrency(party.erpLastDayCashBalance)}
                              </td>
                            </>
                          )}
                          {selectedTab === 'AUDIT' && (
                            <td className="px-4 py-2">{party.auditYear}</td>
                          )}
                          <td className="px-4 py-2">
                            <button
                              onClick={() => startEdit(party)}
                              className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={selectedTab === 'ERP' ? 6 : selectedTab === 'AUDIT' ? 3 : 4}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No {mode === 'DONE' ? 'done' : 'pending'} parties for current selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right text-xs text-gray-600">
            Editing a row that flips its status will make it disappear automatically.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPopup;