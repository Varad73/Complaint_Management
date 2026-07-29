import { useEffect, useState, useMemo } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  STATUS_OPTIONS,
  getPriorityBadge,
  getSentimentBadge,
  getStatusConfig,
  API_BASE_URL,
} from '../constants';

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

export default function MyComplaints() {
  const [allComplaints, setAllComplaints] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);

  useEffect(() => {
    document.title = 'SmartGrievance - My Complaints';
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [complaintsRes, departmentsRes] = await Promise.all([
          api.get('/complaints/my'),
          api.get('/departments')
        ]);
        setAllComplaints(complaintsRes.data.list);
        setFilteredList(complaintsRes.data.list);
        setDepartments(departmentsRes.data);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...allComplaints];

    if (selectedFilter !== 'all') {
      result = result.filter(c => c.department?._id === selectedFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [allComplaints, selectedFilter, statusFilter, searchQuery, sortBy]);

  useEffect(() => {
    setFilteredList(filtered);
  }, [filtered]);

  const handleDelete = async (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await api.delete(`/complaints/${complaintId}`);
        toast.success('Complaint deleted successfully');
        setAllComplaints(prev => prev.filter(c => c._id !== complaintId));
      } catch (err) {
        toast.error('Failed to delete complaint');
      }
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          My Complaints
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage all your submitted complaints</p>
      </div>

      {allComplaints.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      )}

      {filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {allComplaints.length === 0 ? 'No complaints yet' : 'No matching complaints'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {allComplaints.length === 0
              ? 'Ready to submit your first complaint?'
              : 'Try adjusting your filters or search query.'}
          </p>
          {allComplaints.length === 0 && (
            <Link
              to="/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Submit a Complaint
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredList.map((complaint) => {
            const statusConfig = getStatusConfig(complaint.status);
            const priorityBadge = complaint.priority ? getPriorityBadge(complaint.priority) : null;
            const sentimentBadge = complaint.sentiment ? getSentimentBadge(complaint.sentiment) : null;

            return (
              <div key={complaint._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 break-words">{complaint.title}</h3>
                      {complaint.department && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                          {complaint.department.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig.badge}`}>
                        <div className={`w-2 h-2 rounded-full ${statusConfig.bg}`}></div>
                        <span className="text-sm font-medium">{statusConfig.label || complaint.status}</span>
                      </div>

                      {priorityBadge && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}>
                          <div className={`w-2 h-2 rounded-full ${priorityBadge.dot}`}></div>
                          {priorityBadge.label}
                        </span>
                      )}

                      {sentimentBadge && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${sentimentBadge.bg} ${sentimentBadge.text}`}>
                          {sentimentBadge.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{complaint.description}</p>

                  {complaint.image && (
                    <div className="mb-4">
                      <img
                        src={`${API_BASE_URL}${complaint.image}`}
                        alt="Complaint"
                        className="rounded-lg max-h-48 w-auto object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setExpandedComplaintId(expandedComplaintId === complaint._id ? null : complaint._id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                      >
                        <svg className={`w-4 h-4 transition-transform ${expandedComplaintId === complaint._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {expandedComplaintId === complaint._id ? 'Hide History' : 'View History'}
                      </button>
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {expandedComplaintId === complaint._id && complaint.history && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Timeline</h4>
                      <div className="relative ml-2">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="space-y-4">
                          {complaint.history.slice().reverse().map((entry, idx) => (
                            <div key={idx} className="flex items-start space-x-4 relative">
                              <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-800 relative z-10 mt-1"></div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{entry.status}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(entry.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
