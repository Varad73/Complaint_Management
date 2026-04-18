import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000';

const getPriorityBadge = (priority) => {
  const badges = {
    high: { bg: 'bg-red-100', text: 'text-red-800', label: '🔴 High Priority' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🟡 Medium Priority' },
    low: { bg: 'bg-green-100', text: 'text-green-800', label: '🟢 Low Priority' }
  };
  return badges[priority] || badges.low;
};

const getSentimentBadge = (sentiment) => {
  const sentiments = {
    Negative: { bg: 'bg-orange-100', text: 'text-orange-800', label: '😠 Negative' },
    Neutral: { bg: 'bg-gray-100', text: 'text-gray-800', label: '😐 Neutral' },
    Positive: { bg: 'bg-blue-100', text: 'text-blue-800', label: '😊 Positive' }
  };
  return sentiments[sentiment] || sentiments.Neutral;
};

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', department: '', priority: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  
  const statusOptions = ['Submitted', 'In Review', 'Work in Progress', 'Resolved', 'Closed'];
  
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/departments") ;
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
  };

  const resetFilters = () => {
    setFilters({ search: '', status: '', department: '', priority: '' });
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/complaints/${selectedComplaint._id}/status`, { status: newStatus });
      toast.success('Status updated successfully!');
      setIsModalOpen(false);
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await api.delete(`/complaints/${complaintId}`);
        toast.success('Complaint deleted');
        fetchComplaints();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-blue-100 text-blue-800',
      'In Review': 'bg-yellow-100 text-yellow-800',
      'Work in Progress': 'bg-orange-100 text-orange-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const cleanPath = imagePath.replace(/^\/?(uploads\/)?/, '');
    return `${API_BASE_URL}/uploads/${cleanPath}`;
  };

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Manage and track all complaints</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-orange-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">In Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inReview}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search by title..."
            value={filters.search}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <button
            onClick={resetFilters}
            className="bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700 transition-all"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-10"></th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Sentiment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaints.map((c) => (
                  <>
                    <tr key={c._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRowExpansion(c._id)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <svg className={`w-5 h-5 transform transition-transform ${expandedRow === c._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{c.user?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{c.user?.email || ''}</div>
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.department?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{c.title}</div>
                       </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                       </td>
                      {/* AI Priority Badge */}
                      <td className="px-6 py-4">
                        {c.priority && (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(c.priority).bg} ${getPriorityBadge(c.priority).text}`}>
                            {getPriorityBadge(c.priority).label}
                          </span>
                        )}
                       </td>
                      {/* AI Sentiment Badge */}
                      <td className="px-6 py-4">
                        {c.sentiment && (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSentimentBadge(c.sentiment).bg} ${getSentimentBadge(c.sentiment).text}`}>
                            {getSentimentBadge(c.sentiment).label}
                          </span>
                        )}
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {c.image ? (
                          <button
                            onClick={() => {
                              setSelectedComplaint(c);
                              setIsImageViewerOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            View
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">No image</span>
                        )}
                       </td>
                      <td className="px-6 py-4 space-x-3">
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setNewStatus(c.status);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                       </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {expandedRow === c._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="10" className="px-6 py-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Description:</h4>
                              <p className="text-sm text-gray-700">{c.description}</p>
                            </div>
                            {c.history && c.history.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Status History:</h4>
                                <div className="space-y-2">
                                  {c.history.slice().reverse().map((entry, idx) => (
                                    <div key={idx} className="flex items-center text-sm">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                      <span className="font-medium text-gray-700">{entry.status}</span>
                                      <span className="mx-2 text-gray-400">→</span>
                                      <span className="text-gray-500">{new Date(entry.timestamp).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-2">📭</div>
                      <p>No complaints found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Update Status</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Complaint: <span className="font-medium">{selectedComplaint.title}</span>
              </p>
              <form onSubmit={handleStatusUpdate}>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 mb-6"
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-md transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
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
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{selectedComplaint.title}</h3>
                <p className="text-sm text-gray-500">Submitted by: {selectedComplaint.user?.name}</p>
              </div>
              <img
                src={getFullImageUrl(selectedComplaint.image)}
                alt={selectedComplaint.title}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  toast.error('Failed to load image');
                }}
              />
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}