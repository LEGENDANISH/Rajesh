// src/components/TransactionTracking/TransactionTracking.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Download,
  Upload,
  Calendar,
  Edit3,
  Plus,
  ChevronDown,
  Mail // Import the Mail icon
} from 'lucide-react';
import * as XLSX from 'xlsx'; // Ensure XLSX is installed
import DetailPopup from './DetailPopup';
import MessagePopup from './MessagePopup'; // Import the MessagePopup component
// --- Add the import for FetchedEmails ---
import { PartySummary, SelectedTabType, PopupMode, CustomDateRange, FetchedEmails } from './types'; // Ensure FetchedEmails is imported
import { formatCurrency, parseCurrency, parseDateString, getMonthOptions, prepareExportData } from './utils';

// --- Define the initial test data (fallback) ---
const initialTestData: PartySummary[] = [
  {
    id: crypto.randomUUID(),
    partyName: 'ABC Enterprises',
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
    partyName: 'XYZ Suppliers',
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
    partyName: 'Global Industries',
    tallyLastTransactionDate: '2024-07-01', // Past date for testing
    tallyCashBalance: 2345000,
    erpLastTransactionDate: '2024-07-01',
    erpCashBalance: 2200000,
    erpLastDayEndDate: '2024-07-01',
    erpLastDayCashBalance: 2150000,
    auditYear: '2022-23'
  }
];

const TransactionTracking: React.FC = () => {
  // --- Initialize state from localStorage or fallback data ---
  const [partySummaries, setPartySummaries] = useState<PartySummary[]>(() => {
    const savedData = localStorage.getItem('transactionPartySummaries');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Basic check to ensure it's an array (you might add more robust validation)
        if (Array.isArray(parsedData)) {
          console.log("Loaded party summaries from localStorage.");
          return parsedData;
        } else {
          console.warn("Data in localStorage for 'transactionPartySummaries' is not an array. Using fallback data.");
        }
      } catch (error) {
        console.error("Error parsing data from localStorage for 'transactionPartySummaries':", error);
      }
    }
    console.log("Using initial test data for party summaries.");
    return initialTestData; // Use fallback data if localStorage is empty/invalid
  });

  // --- Save partySummaries to localStorage whenever it changes ---
  useEffect(() => {
    try {
      localStorage.setItem('transactionPartySummaries', JSON.stringify(partySummaries));
      console.log("Party summaries saved to localStorage.");
    } catch (error) {
      console.error("Error saving party summaries to localStorage:", error);
      // Optionally, alert the user if saving fails persistently
      // alert("Warning: Could not save data locally. Changes might be lost on refresh.");
    }
  }, [partySummaries]); // Depend on partySummaries

  const [selectedTab, setSelectedTab] = useState<SelectedTabType>('TALLY');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({ start: null, end: null });
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

  // --- State for Message Popup ---
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);

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

  const comparisonDate = getComparisonDate(); // This is used for the popup

  // --- Graph Calculation Logic ---
  const graphData = useMemo(() => {
    const totalParties = partySummaries.length;
    let partiesTillSelectedDate = 0; // This will now represent "Done" parties

    if (selectedTab === 'AUDIT') {
      // Keep AUDIT logic based on auditYear if that's still desired for AUDIT tab graph
      partiesTillSelectedDate = partySummaries.filter(
        (p) => p.auditYear && p.auditYear.trim() !== ''
      ).length;
    } else if (selectedTab === 'TALLY') {
      // For TALLY tab, graph checks if ANY of erpLastTransactionDate OR tallyLastTransactionDate OR erpLastDayEndDate is AFTER the selected date.
      // If ANY date is after or equal, the party counts towards "Done".
      const selectedComparisonDate = new Date(selectedDate); // Use selectedDate state directly for graph
      selectedComparisonDate.setHours(0, 0, 0, 0);

      partiesTillSelectedDate = partySummaries.filter((p) => {
        const dateFieldsToCheck: (keyof PartySummary)[] = ['erpLastTransactionDate', 'tallyLastTransactionDate', 'erpLastDayEndDate'];
        for (const dateField of dateFieldsToCheck) {
            const dateString = p[dateField];
            if (typeof dateString === 'string' && dateString) {
                const partyDate = new Date(dateString);
                if (!isNaN(partyDate.getTime())) {
                    partyDate.setHours(0, 0, 0, 0);
                    // If any date is >= selected date, it counts towards "Done"
                    if (partyDate >= selectedComparisonDate) {
                        return true; // Counts towards "Done"
                    }
                }
            }
        }
        // If none of the dates are >= selected date, it does NOT count towards "Done"
        return false;
      }).length;

    } else {
      // Default ERP logic (can be adjusted if needed)
      // Original logic: Done if erpLastTransactionDate <= selected date
      // New logic (based on your clarification): Done if erpLastTransactionDate >= selected date
      const selectedComparisonDate = new Date(selectedDate); // Use selectedDate state directly for graph
      selectedComparisonDate.setHours(0, 0, 0, 0);

      partiesTillSelectedDate = partySummaries.filter((p) => {
        if (!p.erpLastTransactionDate) return false;
        const partyDate = new Date(p.erpLastTransactionDate);
        if (isNaN(partyDate.getTime())) return false;
        partyDate.setHours(0, 0, 0, 0);
        // Changed from <= to >= based on your clarification
        return partyDate >= selectedComparisonDate; // Compare against selectedDate
      }).length;
    }

    const pendingParties = totalParties - partiesTillSelectedDate;
    return [
      { label: 'Total Parties', value: totalParties, color: 'bg-blue-500' },
      {
        label: 'Done Parties', // Renamed for clarity based on new logic
        value: partiesTillSelectedDate,
        color: 'bg-green-500'
      },
      { label: 'Pending Parties', value: pendingParties, color: 'bg-yellow-500' }
    ];
  }, [partySummaries, selectedTab, selectedDate]); // Ensure this re-runs when these change, especially selectedDate

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
        setPartySummaries(imported); // This will trigger the useEffect to save to localStorage
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
    try {
        // --- Use the current partySummaries state for export ---
        const wb = prepareExportData(partySummaries); // Pass the current state
        XLSX.writeFile(wb, 'party_summary.xlsx');
        console.log("Exported current party summaries to Excel.");
    } catch (err) {
         console.error('Export error:', err);
         alert('Error exporting file. Please try again.');
    }
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
    setPartySummaries((prev) => [newParty, ...prev]); // This will trigger the useEffect to save to localStorage
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
      ); // This will trigger the useEffect to save to localStorage
      setEditingPartyId(null);
    }
  };

  const handleCancelEdit = () => {
    if (editingPartyId) {
      const current = partySummaries.find((p) => p.id === editingPartyId);
      if (current && current.partyName.trim() === '') {
        // If it was a newly added row with no name, remove it
        setPartySummaries((prev) => prev.filter((p) => p.id !== editingPartyId)); // Triggers save
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
      } as PartySummary); // Type assertion
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      } as PartySummary); // Type assertion
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

  // --- Handlers for Message Popup ---
  const openMessagePopup = () => {
    setIsMessagePopupOpen(true);
  };

  const closeMessagePopup = () => {
    setIsMessagePopupOpen(false);
  };

  // --- This function is passed to MessagePopup and called when "Send" is clicked ---
  const handleSendMessage = (message: string, selectedParties: PartySummary[]) => {
    // TODO: Implement actual message sending logic here (e.g., API call)
    console.log("Sending message:", message, "To parties:", selectedParties.map(p => p.partyName));
    alert(`Message sent (simulated)!\nMessage: ${message}\nTo: ${selectedParties.map(p => p.partyName).join(', ')}`);
    // Close the popup after sending (optional)
    // closeMessagePopup();
  };

  // --- This function is passed to MessagePopup and called when "Fetch Emails" is clicked ---
  // It fetches emails by reading partyDetails directly from localStorage.
  const handleFetchEmails = async (partyNames: string[]): Promise<FetchedEmails> => {
    console.log("Fetching emails for party names from localStorage (partyDetails):", partyNames);

    return new Promise((resolve) => {
      // Simulate slight async delay (reading from localStorage is synchronous, but network calls would be async)
      setTimeout(() => {
        const emailMap: FetchedEmails = {};
        let localPartyDetails: any[] = []; // Use 'any' or import the specific type // TODO: Type this properly

        // --- Read partyDetails from localStorage ---
        try {
          const savedPartyDetails = localStorage.getItem('partyDetails'); // Key used by AuditManagement
          if (savedPartyDetails) {
            // Parse the data from localStorage
            localPartyDetails = JSON.parse(savedPartyDetails);
            // Add a basic type check if needed
            if (!Array.isArray(localPartyDetails)) {
               console.error("Data in localStorage for 'partyDetails' is not an array.");
               resolve(emailMap);
               return;
            }
          } else {
             console.log("No 'partyDetails' found in localStorage.");
             resolve(emailMap);
             return;
          }
        } catch (error) {
          console.error("Error parsing 'partyDetails' from localStorage:", error);
          resolve(emailMap);
          return;
        }

        // --- Logic to find emails (same as before, but using localPartyDetails) ---
        partyNames.forEach(partyName => {
            // Find the corresponding party in the localPartyDetails array (read from localStorage)
            const matchingPartyDetail = localPartyDetails.find(
                (detail: any) => detail.partyName === partyName // TODO: Type 'detail' properly
            );

            // Find the corresponding partySummary to get its ID for the FetchedEmails map
            const matchingPartySummary = partySummaries.find(
                summary => summary.partyName === partyName
            );

            if (matchingPartySummary) {
                const partyId = matchingPartySummary.id;
                // Check if email exists and is not empty/just whitespace
                if (matchingPartyDetail?.email && matchingPartyDetail.email.trim() !== '') {
                    // Valid email found in localStorage data
                    emailMap[partyId] = matchingPartyDetail.email.trim();
                } else {
                    // Email not found or is empty/undefined/whitespace for this party
                    emailMap[partyId] = null;
                }
            } else {
                 // This case handles if a partyName requested isn't in the current partySummaries list
                 console.warn(`Party name '${partyName}' requested for email fetch but not found in current partySummaries.`);
                 // Cannot map to ID
            }
        });

        console.log("Fetched emails result from localStorage partyDetails:", emailMap);
        resolve(emailMap);
      }, 50); // Very short delay to mimic potential async nature
    });
    // --- End Logic ---
  };


  const updateParty = (updated: PartySummary) => {
    setPartySummaries((prev) => prev.map((p) => (p.id === updated.id ? updated : p))); // Triggers save
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
        <nav className="-mb-px flex space-x-8 items-center">
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
          {/* Message Button - Placed outside the map for clear positioning */}
          <button
            onClick={openMessagePopup}
            className="ml-auto flex items-center space-x-1 px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Message</span>
          </button>
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
        comparisonDate={comparisonDate} // Pass the comparisonDate (handles custom range or selectedDate)
        parties={partySummaries}
        onClose={closePopup}
        onUpdateParty={updateParty}
        editingPartyId={editingPartyId}
        setEditingPartyId={setEditingPartyId}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        isOpen={isPopupOpen}
      />

      {/* Message Popup */}
      <MessagePopup
        isOpen={isMessagePopupOpen}
        onClose={closeMessagePopup}
        parties={partySummaries} // Pass the main party data
        selectedTab={selectedTab}
        onSend={handleSendMessage}
        onFetchEmails={handleFetchEmails} // Pass the fetch handler that reads from localStorage
      />
    </div>
  );
};

export default TransactionTracking;