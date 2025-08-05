// import React, { useState } from 'react';
// import { 
//   Plus, 
//   Calendar, 
//   FileCheck, 
//   CheckCircle, 
//   XCircle, 
//   Clock,
//   Download,
//   Eye,
//   Filter
// } from 'lucide-react';

// const AuditManagement: React.FC = () => {
//   const [showForm, setShowForm] = useState(false);

//   const auditRecords = [
//     {
//       id: 1,
//       year: '2024-25',
//       party: 'ABC Enterprises',
//       startDate: '2025-01-01',
//       endDate: '2025-01-31',
//       status: 'completed',
//       auditor: 'CA. John Smith',
//       completionDate: '2025-01-31',
//       pdfGenerated: true
//     },
//     {
//       id: 2,
//       year: '2024-25',
//       party: 'XYZ Corporation',
//       startDate: '2025-01-01',
//       endDate: '2025-01-31',
//       status: 'in-progress',
//       auditor: 'CA. Jane Doe',
//       completionDate: null,
//       pdfGenerated: false
//     },
//     {
//       id: 3,
//       year: '2023-24',
//       party: 'Global Industries',
//       startDate: '2024-04-01',
//       endDate: '2024-03-31',
//       status: 'pending',
//       auditor: 'CA. Mike Johnson',
//       completionDate: null,
//       pdfGenerated: false
//     }
//   ];

//   const yearwiseSummary = [
//     { year: '2024-25', total: 45, completed: 38, pending: 7, percentage: 84 },
//     { year: '2023-24', total: 42, completed: 42, pending: 0, percentage: 100 },
//     { year: '2022-23', total: 38, completed: 36, pending: 2, percentage: 95 },
//     { year: '2021-22', total: 35, completed: 35, pending: 0, percentage: 100 }
//   ];

//   const AuditForm = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-900">Start New Audit</h2>
//           <button 
//             onClick={() => setShowForm(false)}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             ✕
//           </button>
//         </div>
        
//         <form className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Party Name</label>
//               <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//                 <option>Select Party</option>
//                 <option>ABC Enterprises</option>
//                 <option>XYZ Corporation</option>
//                 <option>Global Industries</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year</label>
//               <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//                 <option>2024-25</option>
//                 <option>2023-24</option>
//                 <option>2022-23</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
//               <input 
//                 type="date" 
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
//               <input 
//                 type="date" 
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Auditor</label>
//               <input 
//                 type="text" 
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="CA. Name"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Audit Type</label>
//               <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//                 <option>Internal Audit</option>
//                 <option>Statutory Audit</option>
//                 <option>Tax Audit</option>
//                 <option>Compliance Audit</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4 pt-4">
//             <button 
//               type="button"
//               onClick={() => setShowForm(false)}
//               className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
//             >
//               Cancel
//             </button>
//             <button 
//               type="submit"
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Start Audit
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Audit Management</h2>
//           <p className="text-gray-600">Track audit progress and generate reports</p>
//         </div>
//         <button 
//           onClick={() => setShowForm(true)}
//           className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="w-5 h-5" />
//           <span>Start Audit</span>
//         </button>
//       </div>

//       {/* Year-wise Summary */}
//       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//         <h3 className="text-lg font-semibold text-gray-900 mb-6">Year-wise Audit Summary</h3>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           {yearwiseSummary.map((year, index) => (
//             <div key={index} className="bg-gray-50 p-4 rounded-lg">
//               <div className="flex justify-between items-center mb-3">
//                 <h4 className="font-semibold text-gray-900">{year.year}</h4>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   year.percentage === 100 
//                     ? 'bg-green-100 text-green-800' 
//                     : year.percentage >= 80 
//                     ? 'bg-blue-100 text-blue-800' 
//                     : 'bg-amber-100 text-amber-800'
//                 }`}>
//                   {year.percentage}%
//                 </span>
//               </div>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Total:</span>
//                   <span className="font-medium">{year.total}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Completed:</span>
//                   <span className="font-medium text-green-600">{year.completed}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Pending:</span>
//                   <span className="font-medium text-amber-600">{year.pending}</span>
//                 </div>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
//                 <div 
//                   className={`h-2 rounded-full transition-all duration-300 ${
//                     year.percentage === 100 ? 'bg-green-500' : year.percentage >= 80 ? 'bg-blue-500' : 'bg-amber-500'
//                   }`}
//                   style={{ width: `${year.percentage}%` }}
//                 ></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Audit Records */}
//       <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">Audit Records</h3>
//             <div className="flex space-x-3">
//               <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
//                 <Filter className="w-4 h-4" />
//                 <span>Filter</span>
//               </button>
//               <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
//                 <Download className="w-4 h-4" />
//                 <span>Export</span>
//               </button>
//             </div>
//           </div>
//         </div>
        
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Party</th>
//                 <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Year</th>
//                 <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Period</th>
//                 <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Auditor</th>
//                 <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">PDF</th>
//                 <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {auditRecords.map((audit) => (
//                 <tr key={audit.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{audit.party}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {audit.year}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {new Date(audit.startDate).toLocaleDateString()} - {new Date(audit.endDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {audit.auditor}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center space-x-2">
//                       {audit.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
//                       {audit.status === 'in-progress' && <Clock className="w-4 h-4 text-blue-600" />}
//                       {audit.status === 'pending' && <XCircle className="w-4 h-4 text-amber-600" />}
//                       <span className={`text-sm font-medium ${
//                         audit.status === 'completed' ? 'text-green-600' :
//                         audit.status === 'in-progress' ? 'text-blue-600' : 'text-amber-600'
//                       }`}>
//                         {audit.status.replace('-', ' ')}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {audit.pdfGenerated ? (
//                       <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
//                         <Download className="w-4 h-4" />
//                         <span className="text-sm">Download</span>
//                       </button>
//                     ) : (
//                       <span className="text-sm text-gray-400">Not available</span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <button className="text-blue-600 hover:text-blue-900 mr-3">
//                       <Eye className="w-4 h-4" />
//                     </button>
//                     {audit.status !== 'completed' && (
//                       <button className="text-green-600 hover:text-green-900">
//                         <FileCheck className="w-4 h-4" />
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {showForm && <AuditForm />}
//     </div>
//   );
// };

// export default AuditManagement;