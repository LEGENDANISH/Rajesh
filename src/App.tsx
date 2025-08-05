import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PartyDatabase from './components/PartyDatabase';
import SystemStatus from './components/SystemStatus';
import TransactionTracking from './components/TransactionTracking/TransactionTracking';
import AuditManagement from './components/AuditManagement/AuditManagement';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'party-database':
        return <PartyDatabase />;

      case 'transactions':
        return <TransactionTracking />;
 
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Business Management Suite</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;