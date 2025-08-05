import React from 'react';
import { 
  Users, 
  TrendingUp, 
  FileCheck, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Parties',
      value: '247',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Transactions',
      value: '1,834',
      change: '+8.3%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Pending Audits',
      value: '23',
      change: '-15%',
      changeType: 'negative',
      icon: FileCheck,
      color: 'amber'
    }
  ];

  const recentTransactions = [
    { id: 1, party: 'ABC Enterprises', amount: 125000, type: 'credit', date: '2025-01-15' },
    { id: 2, party: 'XYZ Corporation', amount: 87500, type: 'debit', date: '2025-01-15' },
    { id: 3, party: 'Global Industries', amount: 234500, type: 'credit', date: '2025-01-14' },
    { id: 4, party: 'Tech Solutions', amount: 156000, type: 'debit', date: '2025-01-14' },
    { id: 5, party: 'Manufacturing Co.', amount: 198000, type: 'credit', date: '2025-01-13' }
  ];

  const auditStatus = [
    { month: 'Jan 2025', completed: 85, total: 100 },
    { month: 'Dec 2024', completed: 100, total: 100 },
    { month: 'Nov 2024', completed: 92, total: 98 },
    { month: 'Oct 2024', completed: 100, total: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            amber: 'bg-amber-50 text-amber-600 border-amber-200'
          };
          
          return (
            <div key={index} className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg border ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Data Visualization */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <DollarSign className={`w-4 h-4 ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm lg:text-base font-medium text-gray-900">{transaction.party}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className={`text-sm lg:text-base font-semibold ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Progress */}
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Audit Progress</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {auditStatus.map((audit, index) => {
              const percentage = (audit.completed / audit.total) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900">{audit.month}</span>
                    <span className="text-gray-600">{audit.completed}/{audit.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        percentage === 100 ? 'bg-green-500' : percentage >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-3 lg:p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-left">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-sm lg:text-base font-medium text-blue-900">Add New Party</p>
            <p className="text-sm text-blue-700">Register new business party</p>
          </button>
          <button className="p-3 lg:p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left">
            <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-sm lg:text-base font-medium text-green-900">Record Transaction</p>
            <p className="text-sm text-green-700">Add new transaction entry</p>
          </button>
          <button className="p-3 lg:p-4 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-left">
            <FileCheck className="w-6 h-6 text-amber-600 mb-2" />
            <p className="text-sm lg:text-base font-medium text-amber-900">Start Audit</p>
            <p className="text-sm text-amber-700">Begin audit process</p>
          </button>
          <button className="p-3 lg:p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-left">
            <FileText className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-sm lg:text-base font-medium text-purple-900">System Status</p>
            <p className="text-sm text-purple-700">View Tally & ERP status</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;