import { useState, useEffect, useCallback, useMemo, Fragment, useRef } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import {
  API_BASE_URL,
  STATUS_OPTIONS,
  getPriorityBadge,
  getSentimentBadge,
  getStatusConfig,
  getFullImageUrl,
} from '../constants';

const PAGE_SIZE = 10;

const DEFAULT_COLUMNS = ['User', 'Department', 'Title', 'Status', 'Priority', 'Submitted', 'Actions'];
const STORAGE_KEY = 'adminColumns';

function loadColumns() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_COLUMNS;
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function SkeletonRow({ visibleColumns }) {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div></td>
      {visibleColumns.map(col => (
        <td key={col} className="px-6 py-4">
          <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${col === 'Title' ? 'w-36' : col === 'User' ? 'w-24' : 'w-20'}`}></div>
        </td>
      ))}
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div></td>
    </tr>
  );
}

function StatCard({ label, value, borderColor, icon, iconBg }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border-l-4 ${borderColor} hover:shadow-md transition-shadow transition-colors`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusDropdown({ complaint, onUpdate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentConfig = getStatusConfig(complaint.status);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${currentConfig.badge} hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer`}
        title="Click to change status"
      >
        <div className={`w-2 h-2 rounded-full ${currentConfig.bg}`}></div>
        {complaint.status}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-30 py-1 overflow-hidden">
          {STATUS_OPTIONS.map(opt => {
            const cfg = getStatusConfig(opt);
            return (
              <button
                key={opt}
                onClick={() => { onUpdate(complaint._id, opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                  opt === complaint.status
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${cfg.bg}`}></div>
                {opt}
                {opt === complaint.status && (
                  <svg className="w-4 h-4 ml-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', department: '', priority: '' });
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(loadColumns);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const columnsRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (columnsRef.current && !columnsRef.current.contains(e.target)) setShowColumnsMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    document.title = 'SmartGrievance - Admin Dashboard';
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/departments");
        setDepartments(res.data);
      } catch (err) {
        toast.error("Could not load departments");
      }
    };
    fetchDepartments();
  }, []);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const res = await api.get('/complaints', { params: activeFilters });
      setComplaints(res.data.all);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchComplaints(), 300);
    return () => clearTimeout(timer);
  }, [fetchComplaints]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: '', status: '', department: '', priority: '' });
    setCurrentPage(1);
    searchRef.current?.focus();
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await api.patch(`/complaints/${complaintId}/status`, { status: newStatus });
      toast.success('Status updated');
      setComplaints(prev => prev.map(c =>
        c._id === complaintId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
      ));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus) { toast.error('Please select a status'); return; }
    try {
      await Promise.all([...selectedIds].map(id =>
        api.patch(`/complaints/${id}/status`, { status: bulkStatus })
      ));
      toast.success(`${selectedIds.size} complaints updated`);
      setShowBulkModal(false);
      setSelectedIds(new Set());
      fetchComplaints();
    } catch (err) {
      toast.error('Bulk update failed');
    }
  };

  const handleDelete = async (complaintId) => {
    if (window.confirm('Delete this complaint permanently?')) {
      try {
        await api.delete(`/complaints/${complaintId}`);
        toast.success('Complaint deleted');
        setComplaints(prev => prev.filter(c => c._id !== complaintId));
        setSelectedIds(prev => { const next = new Set(prev); next.delete(complaintId); return next; });
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return (
        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return (
      <svg className={`w-4 h-4 text-blue-600 ml-1 inline transition-transform ${sortConfig.direction === 'asc' ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  const sortedComplaints = useMemo(() => {
    const sorted = [...complaints];
    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (sortConfig.key) {
        case 'user':
          aVal = a.user?.name || '';
          bVal = b.user?.name || '';
          break;
        case 'department':
          aVal = a.department?.name || '';
          bVal = b.department?.name || '';
          break;
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'priority':
          const pOrder = { high: 3, medium: 2, low: 1 };
          aVal = pOrder[a.priority] || 0;
          bVal = pOrder[b.priority] || 0;
          break;
        case 'createdAt':
        default:
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
      }
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [complaints, sortConfig]);

  const totalPages = Math.ceil(sortedComplaints.length / PAGE_SIZE);
  const paginatedComplaints = sortedComplaints.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const colSpanTotal = 2 + visibleColumns.length; // checkbox + expand + visible cols

  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
    pending: complaints.filter(c => !['Resolved', 'Closed'].includes(c.status)).length,
    inReview: complaints.filter(c => c.status === 'In Review').length,
    inProgress: complaints.filter(c => c.status === 'Work in Progress').length
  };

  const toggleRowExpansion = (complaintId) => {
    setExpandedRow(expandedRow === complaintId ? null : complaintId);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedComplaints.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedComplaints.map(c => c._id)));
    }
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const colHeaderMap = {
    User: { key: 'user', label: 'User' },
    Department: { key: 'department', label: 'Department' },
    Title: { key: 'title', label: 'Title' },
    Status: { key: 'status', label: 'Status' },
    Priority: { key: 'priority', label: 'Priority' },
    Submitted: { key: 'createdAt', label: 'Submitted' },
    Actions: { key: null, label: 'Actions' },
  };

  const exportCSV = () => {
    const cols = ['Title', 'User', 'Email', 'Department', 'Status', 'Priority', 'Sentiment', 'Submitted', 'Description'];
    const rows = sortedComplaints.map(c => [
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.user?.name || ''}"`,
      `"${c.user?.email || ''}"`,
      `"${c.department?.name || ''}"`,
      c.status,
      c.priority || '',
      c.sentiment || '',
      new Date(c.createdAt).toISOString().split('T')[0],
      `"${(c.description || '').replace(/"/g, '""')}"`,
    ].join(','));
    const csv = [cols.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all complaints</p>
        </div>
        <div className="flex items-center gap-3">
          {complaints.length > 0 && (
            <>
              <div className="relative" ref={columnsRef}>
                <button
                  onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  Columns
                </button>
                {showColumnsMenu && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-30 py-2">
                    {DEFAULT_COLUMNS.map(col => (
                      <label
                        key={col}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col)}
                          onChange={() => toggleColumn(col)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        {col}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Total Complaints"
          value={stats.total}
          borderColor="border-blue-500"
          iconBg="bg-blue-100"
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          borderColor="border-green-500"
          iconBg="bg-green-100"
          icon={<svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          borderColor="border-orange-500"
          iconBg="bg-orange-100"
          icon={<svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="In Review"
          value={stats.inReview}
          borderColor="border-yellow-500"
          iconBg="bg-yellow-100"
          icon={<svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          borderColor="border-purple-500"
          iconBg="bg-purple-100"
          icon={<svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchRef}
              type="text"
              name="search"
              placeholder="Search by title..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {Object.entries(filters).filter(([_, v]) => v !== '').map(([key, val]) => (
              <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                {key === 'search' ? 'Search' : key.charAt(0).toUpperCase() + key.slice(1)}: {val.length > 20 ? val.slice(0, 20) + '...' : val}
                <button onClick={() => { setFilters(prev => ({ ...prev, [key]: '' })); setCurrentPage(1); }} className="hover:text-blue-900 dark:hover:text-blue-100">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {selectedIds.size} selected
          </div>
          <div className="flex-1"></div>
          <button
            onClick={() => window.confirm(`Delete ${selectedIds.size} complaints?`) && Promise.all([...selectedIds].map(id => api.delete(`/complaints/${id}`))).then(() => { toast.success('Deleted'); fetchComplaints(); }).catch(() => toast.error('Failed'))}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors font-medium"
          >
            Delete Selected
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all font-medium"
          >
            Update Status
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 w-10"></th>
                  {visibleColumns.map(col => (
                    <th key={col} className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} visibleColumns={visibleColumns} />)}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 w-10">
                    <input
                      type="checkbox"
                      checked={paginatedComplaints.length > 0 && selectedIds.size === paginatedComplaints.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 w-10"></th>
                  {visibleColumns.map(col => {
                    const meta = colHeaderMap[col];
                    return (
                      <th key={col} className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {meta.key ? (
                          <button onClick={() => handleSort(meta.key)} className="hover:text-blue-600 transition-colors whitespace-nowrap">
                            {meta.label}<SortIcon column={meta.key} />
                          </button>
                        ) : meta.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedComplaints.map((c) => {
                  const priorityBadge = c.priority ? getPriorityBadge(c.priority) : null;
                  const hasImage = !!c.image;

                  return (
                    <Fragment key={c._id}>
                      <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${selectedIds.has(c._id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(c._id)}
                            onChange={() => toggleSelect(c._id)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleRowExpansion(c._id)}
                            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"
                            aria-label="Expand row"
                          >
                            <svg className={`w-5 h-5 transform transition-transform ${expandedRow === c._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>

                        {visibleColumns.includes('User') && (
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{c.user?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{c.user?.email || ''}</div>
                          </td>
                        )}

                        {visibleColumns.includes('Department') && (
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{c.department?.name || 'N/A'}</td>
                        )}

                        {visibleColumns.includes('Title') && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white max-w-[200px] truncate" title={c.title}>
                                {c.title}
                              </div>
                              {hasImage && (
                                <button
                                  onClick={() => { setSelectedComplaint(c); setIsImageViewerOpen(true); }}
                                  className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="View attached image"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.includes('Status') && (
                          <td className="px-6 py-4">
                            <StatusDropdown complaint={c} onUpdate={handleStatusUpdate} />
                          </td>
                        )}

                        {visibleColumns.includes('Priority') && (
                          <td className="px-6 py-4">
                            {priorityBadge && (
                              <div className={`w-3 h-3 rounded-full ${priorityBadge.dot}`} title={priorityBadge.label}></div>
                            )}
                          </td>
                        )}

                        {visibleColumns.includes('Submitted') && (
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              <span className="text-gray-400 dark:text-gray-500 ml-1">· {relativeTime(c.createdAt)}</span>
                            </div>
                          </td>
                        )}

                        {visibleColumns.includes('Actions') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDelete(c._id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>

                      {expandedRow === c._id && (
                        <tr className="bg-gray-50 dark:bg-gray-900">
                          <td colSpan={colSpanTotal} className="px-6 py-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description:</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{c.description}</p>
                              </div>
                              <div className="flex flex-wrap gap-6">
                                {c.sentiment && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Sentiment:</h4>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSentimentBadge(c.sentiment).bg} ${getSentimentBadge(c.sentiment).text}`}>
                                      {getSentimentBadge(c.sentiment).label}
                                    </span>
                                  </div>
                                )}
                                {c.priority && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Priority:</h4>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(c.priority).bg} ${getPriorityBadge(c.priority).text}`}>
                                      <div className={`w-2 h-2 rounded-full ${getPriorityBadge(c.priority).dot}`}></div>
                                      {getPriorityBadge(c.priority).label}
                                    </span>
                                  </div>
                                )}
                                {hasImage && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Image:</h4>
                                    <button
                                      onClick={() => { setSelectedComplaint(c); setIsImageViewerOpen(true); }}
                                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                      View Image →
                                    </button>
                                  </div>
                                )}
                              </div>
                              {c.history && c.history.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Status History:</h4>
                                  <div className="relative ml-2">
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="space-y-3">
                                      {c.history.slice().reverse().map((entry, idx) => (
                                        <div key={idx} className="flex items-center text-sm relative">
                                          <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-gray-50 dark:ring-gray-900 relative z-10 flex-shrink-0"></div>
                                          <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">{entry.status}</span>
                                          <span className="mx-2 text-gray-400">→</span>
                                          <span className="text-gray-500 dark:text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan={colSpanTotal} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="font-medium">No complaints found</p>
                      {hasActiveFilters && (
                        <button onClick={resetFilters} className="mt-2 text-blue-600 text-sm hover:text-blue-700">
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, sortedComplaints.length)} of {sortedComplaints.length}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Status Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowBulkModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bulk Status Update</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Update status for {selectedIds.size} selected complaints
              </p>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 mb-6"
              >
                <option value="">Select status...</option>
                {STATUS_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdate}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-md transition"
                >
                  Update All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {isImageViewerOpen && selectedComplaint && selectedComplaint.image && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setIsImageViewerOpen(false)}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsImageViewerOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close image viewer"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors">
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedComplaint.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Submitted by: {selectedComplaint.user?.name}</p>
              </div>
              <img
                src={getFullImageUrl(selectedComplaint.image)}
                alt={selectedComplaint.title}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%" y="50%" text-anchor="middle" dy=".3em">Image Not Found</text></svg>';
                }}
              />
              <div className="p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedComplaint.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
