"use client";

import React, { useState } from "react";
import { Download, Filter, Search } from "lucide-react";

const initialReports = [
  { id: "REP-001", date: "2026-04-20", type: "Admission", student: "Emma Watson", status: "Completed", amount: 1500 },
  { id: "REP-002", date: "2026-04-19", type: "Fee Payment", student: "John Smith", status: "Pending", amount: 4500 },
  { id: "REP-003", date: "2026-04-18", type: "Admission", student: "Chris Evans", status: "Completed", amount: 1500 },
  { id: "REP-004", date: "2026-04-17", type: "Fee Payment", student: "Sarah Connor", status: "Completed", amount: 2000 },
  { id: "REP-005", date: "2026-04-15", type: "Leave Request", student: "Tom Holland", status: "Approved", amount: 0 },
];

export default function ReportsPage() {
  const [data, setData] = useState(initialReports);
  const [filterType, setFilterType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) => {
    let match = true;
    if (filterType !== "All" && item.type !== filterType) match = false;
    if (startDate && new Date(item.date) < new Date(startDate)) match = false;
    if (endDate && new Date(item.date) > new Date(endDate)) match = false;
    if (search && !item.student.toLowerCase().includes(search.toLowerCase()) && !item.id.toLowerCase().includes(search.toLowerCase())) match = false;
    return match;
  });

  const exportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = Object.keys(filteredData[0]).join(",");
    const rows = filteredData.map(obj => Object.values(obj).join(",")).join("\n");
    const csvContent = `${headers}\n${rows}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `school_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Reports</h1>
          <p className="text-gray-400 mt-2">Generate, filter, and export school data.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center px-4 py-2 bg-brand text-white rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:bg-brand/90 transition-all font-medium"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search ID or Name" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Report Type</label>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand appearance-none"
              >
                <option value="All" className="bg-slate-900">All Types</option>
                <option value="Admission" className="bg-slate-900">Admission</option>
                <option value="Fee Payment" className="bg-slate-900">Fee Payment</option>
                <option value="Leave Request" className="bg-slate-900">Leave Request</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Report ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Type</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Student/Staff Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white-[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium">{row.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{row.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{row.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{row.student}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{row.amount > 0 ? `$${row.amount}` : '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      row.status === 'Completed' || row.status === 'Approved' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No records found matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
