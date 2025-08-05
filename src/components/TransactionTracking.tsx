import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Download,
  Upload,
  Calendar,
  Edit3,
  Plus,
  ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

// --- Interfaces ---
interface PartySummary {
  id: string;
  partyName: string;
  tallyLastTransactionDate: string; // ISO String format 'YYYY-MM-DD'
  tallyCashBalance: number;
  erpLastTransactionDate: string; // ISO String format 'YYYY-MM-DD'
  erpCashBalance: number;
  erpLastDayEndDate: string; // ISO String format 'YYYY-MM-DD'
  erpLastDayCashBalance: number;
  auditYear: string; // e.g., '2023-24'
}

// --- Helper Functions ---
const formatCurrency = (value: number): string => {
  return `₹${value.toLocaleString('en-IN')}`;
};

const parseCurrency = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[₹,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Converts Excel serial date number to JS Date object
const excelSerialToDate = (serial: number): Date | null => {
  // Excel's epoch starts on 1900-01-01 (or 1904 for Mac, but we'll assume PC/1900)
  // Serial number 1 corresponds to 1900-01-01. However, Excel incorrectly treats 1900 as a leap year.
  // The serial date 60 in Excel is 1900-02-29 (which didn't exist). We need to adjust for this.
  // For simplicity and common practice, we adjust by subtracting 1 if the serial is >= 60.
  // This handles most cases correctly for dates after 1900-03-01.
  if (serial < 60) {
    return new Date((serial - 1) * 86400 * 1000 + Date.UTC(1900, 0, 1));
  } else {
    return new Date((serial - 2) * 86400 * 1000 + Date.UTC(1900, 0, 1));
  }
};

// Parses a date string or Excel serial number into a normalized 'YYYY-MM-DD' string
const parseDateString = (dateValue: string | number | null | undefined): string => {
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
    // Attempt to parse the string date
    const parsed = new Date(trimmedValue);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  }

  // If we successfully got a Date object, format it to 'YYYY-MM-DD'
  if (dateObj && !isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    // Months are 0-indexed in JS Date
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // If parsing failed, return the original string or empty
  return typeof dateValue === 'string' ? dateValue.trim() : '';
};


const getMonthOptions = () => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    const month = new Date(0, i).toLocaleString('default', { month: 'long' });
    months.push({ value: i + 1, label: month });
  }
  return months;
};

// --- Detail Popup Component ---
type PopupMode = 'PENDING' | 'DONE' | null;
interface DetailPopupProps {
  mode: PopupMode;
  selectedTab: 'TALLY' | 'ERP' | 'AUDIT';
  comparisonDate: Date;
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

  const isDone = (party: PartySummary): boolean => {
    if (selectedTab === 'AUDIT') {
      return !!(party.auditYear && party.auditYear.trim() !== '');
    }
    const dateField: keyof PartySummary =
      selectedTab === 'ERP' ? 'erpLastTransactionDate' : 'tallyLastTransactionDate';
    const dateString = party[dateField];
    if (!dateString) return false;

    const partyDate = new Date(dateString);
    if (isNaN(partyDate.getTime())) return false; // Invalid date

    partyDate.setHours(0, 0, 0, 0);
    return partyDate <= comparisonDate;
  };

  const filtered = useMemo(
    () => parties.filter(p => (mode === 'DONE' ? isDone(p) : !isDone(p))),
    [parties, mode, selectedTab, comparisonDate]
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
      } as PartySummary);
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      } as PartySummary);
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

// --- Main Component ---
const TransactionTracking: React.FC = () => {
  // --- Initial State with Test Data ---
  const [partySummaries, setPartySummaries] = useState<PartySummary[]>([
    {
      id: crypto.randomUUID(),
      partyName: 'ABC Enterprises (Future)',
      tallyLastTransactionDate: '2025-01-15',
      tallyCashBalance: 1250000,
      erpLastTransactionDate: '2025-01-14',
      erpCashBalance: 1190000,
      erpLastDayEndDate: '2025-01-14',
      erpLastDayCashBalance: 1185000,
      auditYear: '2023-24'
    },
    {
      id: crypto.randomUUID(),
      partyName: 'XYZ Suppliers (Done)',
      tallyLastTransactionDate: '2024-06-15', // Past date for testing
      tallyCashBalance: 875000,
      erpLastTransactionDate: '2024-06-13',
      erpCashBalance: 915000,
      erpLastDayEndDate: '2024-06-13',
      erpLastDayCashBalance: 920000,
      auditYear: '2023-24'
    },
    {
      id: crypto.randomUUID(),
      partyName: 'Global Industries (Done)',
      tallyLastTransactionDate: '2024-07-01', // Past date for testing
      tallyCashBalance: 2345000,
      erpLastTransactionDate: '2024-07-01',
      erpCashBalance: 2200000,
      erpLastDayEndDate: '2024-07-01',
      erpLastDayCashBalance: 2150000,
      auditYear: '2022-23'
    }
  ]);

  const [selectedTab, setSelectedTab] = useState<'TALLY' | 'ERP' | 'AUDIT'>('TALLY');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [customDateRange, setCustomDateRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<PopupMode>(null);
  const [editingPartyId, setEditingPartyId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<PartySummary>({
    id: '',
    partyName: '',
    tallyLastTransactionDate: '',
    tallyCashBalance: 0,
    erpLastTransactionDate: '',
    erpCashBalance: 0,
    erpLastDayEndDate: '',
    erpLastDayCashBalance: 0,
    auditYear: ''
  });
  const partySummaryFileInputRef = useRef<HTMLInputElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthOptions = getMonthOptions();
  const currentMonthName =
    monthOptions.find((m) => m.value === selectedMonth)?.label || 'Month';

  // --- Computed Values ---
  const getComparisonDate = (): Date => {
    const dateStr = customDateRange.end || selectedDate;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      console.error("Invalid comparison date generated:", dateStr);
      return new Date(); // Fallback to today
    }
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const comparisonDate = getComparisonDate();

  const isPartyDone = (party: PartySummary): boolean => {
    if (selectedTab === 'AUDIT') {
      return !!(party.auditYear && party.auditYear.trim() !== '');
    }
    const dateField: keyof PartySummary =
      selectedTab === 'ERP' ? 'erpLastTransactionDate' : 'tallyLastTransactionDate';
    const dateString = party[dateField];
    if (!dateString) return false;

    const partyDate = new Date(dateString);
    if (isNaN(partyDate.getTime())) return false; // Handle invalid date strings

    partyDate.setHours(0, 0, 0, 0);
    return partyDate <= comparisonDate;
  };

  const graphData = useMemo(() => {
    const totalParties = partySummaries.length;
    let partiesTillSelectedDate = 0;
    if (selectedTab === 'AUDIT') {
      partiesTillSelectedDate = partySummaries.filter(
        (p) => p.auditYear && p.auditYear.trim() !== ''
      ).length;
    } else {
      partiesTillSelectedDate = partySummaries.filter((p) => isPartyDone(p)).length;
    }
    const pendingParties = totalParties - partiesTillSelectedDate;
    return [
      { label: 'Total Parties', value: totalParties, color: 'bg-blue-500' },
      {
        label: 'Parties till Selected Date',
        value: partiesTillSelectedDate,
        color: 'bg-green-500'
      },
      { label: 'Pending Parties', value: pendingParties, color: 'bg-yellow-500' }
    ];
  }, [partySummaries, selectedTab, comparisonDate]);

  // --- Handlers ---
  const handlePartySummaryFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        if (!bstr || typeof bstr !== 'string') {
            console.error("Failed to read file as binary string.");
            alert('Error reading file.');
            return;
        }
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (
          | string
          | number
          | null // Excel cells can be null
        )[][];

        const rows = data.slice(1); // Skip header row
        const imported: PartySummary[] = [];

        for (const row of rows) {
          if (!row || row.length === 0) continue; // Skip empty rows

          const [
            partyName = '',
            tallyLastTransactionDateRaw = null,
            tallyCashBalanceRaw = 0,
            erpLastTransactionDateRaw = null,
            erpCashBalanceRaw = 0,
            erpLastDayEndDateRaw = null,
            erpLastDayCashBalanceRaw = 0,
            auditYearRaw = ''
          ] = row;

          const partyNameStr = String(partyName).trim();
          if (!partyNameStr) continue; // Skip if no party name

          const newParty: PartySummary = {
            id: crypto.randomUUID(),
            partyName: partyNameStr,
            tallyLastTransactionDate: parseDateString(tallyLastTransactionDateRaw),
            tallyCashBalance: parseCurrency(tallyCashBalanceRaw),
            erpLastTransactionDate: parseDateString(erpLastTransactionDateRaw),
            erpCashBalance: parseCurrency(erpCashBalanceRaw),
            erpLastDayEndDate: parseDateString(erpLastDayEndDateRaw),
            erpLastDayCashBalance: parseCurrency(erpLastDayCashBalanceRaw),
            auditYear: String(auditYearRaw).trim()
          };

          imported.push(newParty);
        }

        setPartySummaries(imported);
        console.log(`Successfully imported ${imported.length} parties.`);
        alert(`Successfully imported ${imported.length} parties.`);

      } catch (err) {
        console.error('Import error:', err);
        alert('Error importing file. Please verify format. Check console for details.');
      }
    };
    reader.readAsBinaryString(file);
    if (partySummaryFileInputRef.current) {
      partySummaryFileInputRef.current.value = ''; // Reset input
    }
  };

  const handlePartySummaryExport = () => {
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
    XLSX.writeFile(wb, 'party_summary.xlsx');
  };

  const handleTodayClick = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setCustomDateRange({ start: null, end: null });
  };

  const handleMonthSelect = (monthValue: number) => {
    setSelectedMonth(monthValue);
    setIsMonthDropdownOpen(false);
    const year = new Date().getFullYear();
    const firstDay = new Date(year, monthValue - 1, 1)
      .toISOString()
      .split('T')[0];
    setSelectedDate(firstDay);
    setCustomDateRange({ start: null, end: null });
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setCustomDateRange({ start: null, end: null });
  };

  const handleAddNewRow = () => {
    const newParty: PartySummary = {
      id: crypto.randomUUID(),
      partyName: '',
      tallyLastTransactionDate: '',
      tallyCashBalance: 0,
      erpLastTransactionDate: '',
      erpCashBalance: 0,
      erpLastDayEndDate: '',
      erpLastDayCashBalance: 0,
      auditYear: ''
    };
    setPartySummaries((prev) => [newParty, ...prev]);
    setEditingPartyId(newParty.id);
    setEditFormData(newParty);
  };

  const handleEditClick = (id: string) => {
    const party = partySummaries.find((p) => p.id === id);
    if (!party) return;
    setEditingPartyId(id);
    setEditFormData({ ...party });
  };

  const handleSaveEdit = () => {
    if (editingPartyId) {
      setPartySummaries((prev) =>
        prev.map((p) => (p.id === editingPartyId ? editFormData : p))
      );
      setEditingPartyId(null);
    }
  };

  const handleCancelEdit = () => {
    if (editingPartyId) {
      const current = partySummaries.find((p) => p.id === editingPartyId);
      if (current && current.partyName.trim() === '') {
        setPartySummaries((prev) => prev.filter((p) => p.id !== editingPartyId));
      }
    }
    setEditingPartyId(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (
      name === 'tallyCashBalance' ||
      name === 'erpCashBalance' ||
      name === 'erpLastDayCashBalance'
    ) {
      setEditFormData({
        ...editFormData,
        [name]: parseCurrency(value)
      } as PartySummary);
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      } as PartySummary);
    }
  };

  const openDetailPopup = (mode: PopupMode) => {
    setPopupMode(mode);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupMode(null);
    setEditingPartyId(null);
  };

  const updateParty = (updated: PartySummary) => {
    setPartySummaries((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={partySummaryFileInputRef}
        onChange={handlePartySummaryFileImport}
        accept=".xlsx, .xls"
        className="hidden"
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction Tracking</h2>
          <p className="text-gray-600">Monitor financial transactions across all systems</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => partySummaryFileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Party Summary</span>
          </button>
          <button
            onClick={handlePartySummaryExport}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Party Summary</span>
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['TALLY', 'ERP', 'AUDIT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      {/* Overview Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{selectedTab} Overview</h3>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTodayClick}
              className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Today
            </button>
            {/* Month Selector */}
            <div className="relative" ref={monthDropdownRef}>
              <button
                onClick={() => setIsMonthDropdownOpen((o) => !o)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span>{currentMonthName}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isMonthDropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="py-1">
                    {monthOptions.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => handleMonthSelect(m.value)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedMonth === m.value
                            ? 'bg-blue-100 text-blue-800'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Date Picker */}
            <div className="flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={handleCalendarChange}
                className="p-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Calendar className="w-4 h-4 text-gray-500 ml-2" />
            </div>
          </div>
        </div>
        {/* Bar Chart */}
        <div className="mb-6">
          <div className="h-64 flex items-end space-x-4 justify-center">
            {graphData.map((data, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="flex items-end justify-center w-full h-48">
                  <div
                    className={`${data.color} rounded-t hover:opacity-90 transition-opacity w-3/4`}
                    style={{
                      height: `${
                        (data.value / (graphData[0].value || 1)) * 100
                      }%`
                    }}
                    title={`${data.label}: ${data.value}`}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-2 text-center">{data.label}</div>
                <div className="text-xs font-semibold text-gray-900">{data.value}</div>
              </div>
            ))}
          </div>
        </div>
        {/* View All / Actions */}
        <div className="text-center flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => openDetailPopup('PENDING')}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            Pending till Selected Date
          </button>
          <button
            onClick={() => openDetailPopup('DONE')}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
      {/* Party Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Party Summary</h3>
          <button
            onClick={handleAddNewRow}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Party Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Tally Last Transaction Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Tally Cash Balance
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  ERP Last Transaction Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  ERP Cash Balance
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  ERP Last Day End Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  ERP Last Day Cash Balance
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Audit Year
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partySummaries.map((party) => {
                const editing = editingPartyId === party.id;
                return (
                  <tr key={party.id} className="hover:bg-gray-50">
                    {editing ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <input
                            type="text"
                            name="partyName"
                            value={editFormData.partyName}
                            onChange={handleEditChange}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="date"
                            name="tallyLastTransactionDate"
                            value={editFormData.tallyLastTransactionDate}
                            onChange={handleEditChange}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          <input
                            type="text"
                            name="tallyCashBalance"
                            value={formatCurrency(editFormData.tallyCashBalance)}
                            onChange={handleEditChange}
                            className="w-full p-1 border rounded text-right"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="date"
                            name="erpLastTransactionDate"
                            value={editFormData.erpLastTransactionDate}
                            onChange={handleEditChange}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          <input
                            type="text"
                            name="erpCashBalance"
                            value={formatCurrency(editFormData.erpCashBalance)}
                            onChange={handleEditChange}
                            className="w-full p-1 border rounded text-right"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="date"
                            name="erpLastDayEndDate"
                            value={editFormData.erpLastDayEndDate}
                            onChange={handleEditChange}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          <input
                            type="text"
                            name="erpLastDayCashBalance"
                            value={formatCurrency(editFormData.erpLastDayCashBalance)}
                            onChange={handleEditChange}
                            className="w-full p-1 border rounded text-right"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="text"
                            name="auditYear"
                            value={editFormData.auditYear}
                            onChange={handleEditChange}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={handleSaveEdit}
                            className="mr-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {party.partyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {party.tallyLastTransactionDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(party.tallyCashBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {party.erpLastTransactionDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(party.erpCashBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {party.erpLastDayEndDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(party.erpLastDayCashBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {party.auditYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleEditClick(party.id)}
                            className="flex items-center text-blue-500 hover:text-blue-700 text-xs gap-1"
                          >
                            <Edit3 className="w-4 h-4" /> Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Detail Popup */}
      <DetailPopup
        mode={popupMode}
        selectedTab={selectedTab}
        comparisonDate={comparisonDate}
        parties={partySummaries}
        onClose={closePopup}
        onUpdateParty={updateParty}
        editingPartyId={editingPartyId}
        setEditingPartyId={setEditingPartyId}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        isOpen={isPopupOpen}
      />
    </div>
  );
};

export default TransactionTracking;