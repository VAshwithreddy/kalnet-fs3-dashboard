"use client";

import React, { useState } from "react";
import { Download, Filter, Search, ChevronUp, ChevronDown } from "lucide-react";

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
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  React.useEffect(() => {
    async function fetchDbIssues() {
      try {
        const res = await fetch("/api/reports?type=issues");
        if (res.ok) {
          const resData = await res.json();
          const dbIssues = Array.isArray(resData)
            ? resData
            : (resData && resData.success && Array.isArray(resData.data) ? resData.data : []);

          const mappedIssues = dbIssues.map((issue: { id: number; createdAt: string; changeDetails: string; meta: string | null }) => {
            let reporter = "Super Admin";
            let issueTypeLabel = "";
            try {
              if (issue.meta) {
                const parsed = JSON.parse(issue.meta);
                if (parsed.reporterName) reporter = parsed.reporterName;
                if (parsed.issueType) issueTypeLabel = parsed.issueType;
              }
            } catch {
              // Ignore parse error
            }
            return {
              id: `REP-ISS-${String(issue.id).padStart(3, '0')}`,
              date: new Date(issue.createdAt).toISOString().split('T')[0],
              type: issueTypeLabel ? `System Issue (${issueTypeLabel})` : "System Issue",
              student: reporter,
              status: "Completed",
              amount: 0,
              description: issue.changeDetails
            };
          });
          setData((prevData) => {
            const staticData = prevData.filter(item => !item.id.startsWith("REP-ISS-"));
            return [...staticData, ...mappedIssues];
          });
        }
      } catch (e) {
        console.error("Failed to fetch reported issues:", e);
      }
    }
    fetchDbIssues();
  }, []);

  const filteredData = data.filter((item) => {
    let match = true;
    if (filterType !== "All") {
      if (filterType === "System Issue") {
        if (!item.type.startsWith("System Issue")) match = false;
      } else {
        if (item.type !== filterType) match = false;
      }
    }
    if (startDate && new Date(item.date) < new Date(startDate)) match = false;
    if (endDate && new Date(item.date) > new Date(endDate)) match = false;
    if (search && !item.student.toLowerCase().includes(search.toLowerCase()) && !item.id.toLowerCase().includes(search.toLowerCase())) match = false;
    return match;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const valA = a[key as keyof typeof a];
    const valB = b[key as keyof typeof b];
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ChevronUp className="w-4 h-4 ml-1 opacity-20" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1 text-primary" /> 
      : <ChevronDown className="w-4 h-4 ml-1 text-primary" />;
  };

  const exportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = Object.keys(sortedData[0]).join(",");
    const rows = sortedData.map(obj => Object.values(obj).join(",")).join("\n");
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
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">System Reports</h1>
          <p className="text-text-secondary mt-2">Generate, filter, and export school data.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center px-4 py-2 bg-primary text-text-on-primary rounded-lg shadow-shadow-btn hover:bg-primary-mid transition-all font-medium"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="bg-bg-card/70 backdrop-blur-md border border-border shadow-shadow-card p-6 rounded-2xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-text-secondary" />
              <input 
                type="text" 
                placeholder="Search ID or Name" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg-app border border-border rounded-lg pl-10 pr-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Report Type</label>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-3 text-text-secondary" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-bg-app border border-border rounded-lg pl-10 pr-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
              >
                <option value="All">All Types</option>
                <option value="Admission">Admission</option>
                <option value="Fee Payment">Fee Payment</option>
                <option value="Leave Request">Leave Request</option>
                <option value="System Issue">System Issue</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-bg-app border border-border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-bg-app border border-border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-bg-card/70 backdrop-blur-md border border-border shadow-shadow-card rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-card-hover border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary cursor-pointer select-none hover:text-text-heading" onClick={() => handleSort('id')}>
                <div className="flex items-center">Report ID {renderSortIcon('id')}</div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary cursor-pointer select-none hover:text-text-heading" onClick={() => handleSort('date')}>
                <div className="flex items-center">Date {renderSortIcon('date')}</div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary cursor-pointer select-none hover:text-text-heading" onClick={() => handleSort('type')}>
                <div className="flex items-center">Type {renderSortIcon('type')}</div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary cursor-pointer select-none hover:text-text-heading" onClick={() => handleSort('student')}>
                <div className="flex items-center">Student/Staff Name {renderSortIcon('student')}</div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary cursor-pointer select-none hover:text-text-heading" onClick={() => handleSort('amount')}>
                <div className="flex items-center">Amount {renderSortIcon('amount')}</div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary cursor-pointer select-none hover:text-text-heading" onClick={() => handleSort('status')}>
                <div className="flex items-center">Status {renderSortIcon('status')}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((row, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-bg-table-row transition-colors">
                  <td className="px-6 py-4 text-sm text-text-heading font-medium">{row.id}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{row.date}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{row.type}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{row.student}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{row.amount > 0 ? `$${row.amount}` : '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      row.status === 'Completed' ? 'bg-green text-white' :
                      row.status === 'Approved' ? 'bg-primary text-white' :
                      'bg-yellow text-white'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-text-secondary text-sm">
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
