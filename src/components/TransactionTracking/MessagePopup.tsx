// src/components/TransactionTracking/MessagePopup.tsx
import React, { useState, useMemo } from 'react';
import { PartySummary, SelectedTabType, FetchedEmails } from './types';
import { CheckCircle, RefreshCw } from 'lucide-react'; // Import icons

// --- Define the PartyDetails type locally or import it ---
// Assuming the structure from auditsss.txt
interface PartyDetails {
  id: number; // Or string
  partyName: string;
  email: string;
  // ... other fields
}

interface MessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  parties: PartySummary[]; // Parties from TransactionTracking (party_summary.xlsx)
  selectedTab: SelectedTabType;
  onSend: (message: string, selectedParties: PartySummary[]) => void;
  onFetchEmails: (partyNames: string[]) => Promise<FetchedEmails>; // Callback to fetch emails
}

const MessagePopup: React.FC<MessagePopupProps> = ({
  isOpen,
  onClose,
  parties,
  selectedTab,
  onSend,
  onFetchEmails,
}) => {
  const [selectedPartyIds, setSelectedPartyIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string>('');
  const [fetchedEmails, setFetchedEmails] = useState<FetchedEmails>({}); // Store fetched emails (party.id -> email or null)
  const [isFetching, setIsFetching] = useState<boolean>(false); // Loading state

  // Get party names for parties to fetch emails for
  const partyNamesToFetch = useMemo(() => {
    return parties.map(p => p.partyName);
  }, [parties]);

  // --- useMemo for isAllSelectableSelected ---
  // Determine if all parties WITH A FETCHED AND VALID EMAIL are currently selected.
  const isAllSelectableSelected = useMemo(() => {
    const partyIdsWithValidEmail = parties
      .filter(p => {
        const email = fetchedEmails[p.id];
        return email !== undefined && email !== null && email.trim() !== '';
      })
      .map(p => p.id);

    if (partyIdsWithValidEmail.length === 0) return false;
    return partyIdsWithValidEmail.every(id => selectedPartyIds.has(id));
  }, [selectedPartyIds, parties, fetchedEmails]);


  const handleFetchEmails = async () => {
    if (partyNamesToFetch.length === 0) return;
    setIsFetching(true);
    try {
      const emails = await onFetchEmails(partyNamesToFetch);
      setFetchedEmails(emails);
      // Optionally, clear previous selections if desired when fetching new emails
      // setSelectedPartyIds(new Set());
    } catch (error) {
      console.error("Error fetching emails:", error);
      alert("Failed to fetch emails. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  // --- handleSelectAllChange (Checkbox only) ---
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSelectedPartyIds(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        // Select only parties that have a successfully fetched and valid email
        parties.forEach(party => {
          const email = fetchedEmails[party.id];
          const hasValidEmail = email !== undefined && email !== null && email.trim() !== '';
          if (hasValidEmail) {
            newSet.add(party.id);
          }
        });
      } else {
        // Deselect only parties that have a fetched email (valid or invalid)
        parties.forEach(party => {
          if (fetchedEmails.hasOwnProperty(party.id)) {
            newSet.delete(party.id);
          }
        });
      }
      return newSet;
    });
  };

  // --- togglePartySelection (Checkbox only) ---
  const togglePartySelection = (partyId: string) => {
    setSelectedPartyIds(prev => {
      const newSet = new Set(prev);
      // Checkbox behavior: toggle selection
      if (newSet.has(partyId)) {
        newSet.delete(partyId);
      } else {
        newSet.add(partyId);
      }
      return newSet;
    });
  };

  const handleSendMessage = () => {
    const selectedParties = parties.filter(p => selectedPartyIds.has(p.id));
    if (selectedParties.length > 0 && message.trim()) {
        onSend(message, selectedParties);
        // Reset message after sending (optional)
        setMessage('');
        // Note: Parent decides whether to close the popup or not
        // onClose();
        // Keep fetched emails for potential future sends in the same session
    }
  };

  const handleClose = () => {
    // Reset form state on close
    setSelectedPartyIds(new Set());
    setMessage('');
    // Optionally clear fetched emails on close
    // setFetchedEmails({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Popup Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Send Message ({selectedTab})</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Fetch Button */}
        <div className="p-2 bg-gray-50 border-b text-sm flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleFetchEmails}
            disabled={partyNamesToFetch.length === 0 || isFetching}
            className={`flex items-center px-3 py-1 text-xs rounded ${
              partyNamesToFetch.length === 0 || isFetching
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Fetching...' : 'Fetch Emails'}
            {partyNamesToFetch.length > 0 && !isFetching && (
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {partyNamesToFetch.length}
              </span>
            )}
          </button>
        </div>

        {/* Popup Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Party List */}
          <div className="w-1/2 border-r overflow-y-auto p-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">Select Parties:</h4>
              {/* Select All Checkbox - only shown if there are parties with fetched emails */}
              {parties.some(p => {
                 const email = fetchedEmails[p.id];
                 return email !== undefined && email !== null && email.trim() !== '';
               }) && (
                <label className="flex items-center space-x-1 text-xs cursor-pointer text-gray-600 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={isAllSelectableSelected}
                    onChange={handleSelectAllChange}
                    className="form-checkbox h-3 w-3 text-blue-600 rounded"
                  />
                  <span>Select All (with email)</span>
                </label>
              )}
            </div>
            {parties.length > 0 ? (
              <ul className="space-y-1">
                {parties.map((party) => {
                 const wasFetched = fetchedEmails.hasOwnProperty(party.id);
                 const effectiveEmail = fetchedEmails[party.id];

                 const hasValidEmail = effectiveEmail !== null && effectiveEmail !== undefined && effectiveEmail.trim() !== '';
                 const showParty = wasFetched || !isFetching;

                 if (!showParty) return null;

                  return (
                    <li
                      key={party.id}
                      className={`flex justify-between items-center p-1 rounded text-sm ${
                        selectedPartyIds.has(party.id) ? 'bg-blue-50' : 'hover:bg-gray-100'
                      }`}
                    >
                      <label
                        className={`flex items-center flex-grow cursor-pointer truncate ${
                          selectedPartyIds.has(party.id) ? 'font-medium' : ''
                        }`}
                      >
                        <span className="truncate">{party.partyName}</span>
                        {/* Blue Tick Icon if email exists and was fetched */}
                        {wasFetched && hasValidEmail && (
                          <CheckCircle className="w-4 h-4 text-blue-500 ml-1 flex-shrink-0" />
                        )}
                        {/* Show fetching state or not found */}
                        {!wasFetched && isFetching && (
                           <span className="text-xs text-gray-400 ml-1">(Fetching...)</span>
                        )}
                        {wasFetched && !hasValidEmail && (
                           <span className="text-xs text-gray-400 ml-1">(No email)</span>
                        )}
                      </label>
                      {/* Checkbox - Disable if no valid email was found for this party or if not fetched yet */}
                      <input
                        type="checkbox" // Only checkboxes
                        checked={selectedPartyIds.has(party.id)}
                        onChange={() => togglePartySelection(party.id)}
                        disabled={!wasFetched || (wasFetched && !hasValidEmail)}
                        className={`form-checkbox h-4 w-4 text-blue-600 flex-shrink-0 ml-2 ${
                            (!wasFetched || (wasFetched && !hasValidEmail)) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm italic py-4 text-center">
               No parties available.
              </p>
            )}
          </div>

          {/* Right Message Area */}
          <div className="w-1/2 flex flex-col p-4">
            <h4 className="font-medium mb-2 text-sm">Message:</h4>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border rounded p-2 text-sm"
              placeholder="Type your message here..."
            />
            <div className="mt-2 text-xs text-gray-500">
              <span className="font-medium">Selected:</span>{' '}
              {parties.filter(p => selectedPartyIds.has(p.id)).map(p => p.partyName).join(', ') || 'None'}
            </div>
            {/* Display selected emails for confirmation */}
            <div className="mt-1 text-xs text-gray-500">
              <span className="font-medium">Emails to send to:</span>{' '}
              {parties
                .filter(p => selectedPartyIds.has(p.id))
                .map(p => {
                    const email = fetchedEmails[p.id];
                    return email && email.trim() !== '' ? email : `[No email for ${p.partyName}]`;
                })
                .filter(e => e) // Remove empty strings like '[No email...]'
                .join(', ') || 'None'}
            </div>
          </div>
        </div>

        {/* Popup Footer */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSendMessage}
            disabled={selectedPartyIds.size === 0 || !message.trim()}
            className={`px-4 py-2 text-sm text-white rounded ${
              selectedPartyIds.size === 0 || !message.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePopup;