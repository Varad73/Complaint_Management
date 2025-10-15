import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000';

export default function MyComplaints() {
  const [allComplaints, setAllComplaints] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);

  useEffect(() => {
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
        console.error('Error fetching data:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load data. Please try again later.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredList(allComplaints);
    } else {
      const filtered = allComplaints.filter(c => c.department?._id === selectedFilter);
      setFilteredList(filtered);
    }
  }, [selectedFilter, allComplaints]);

  const handleDelete = (complaintId) => {
    toast((t) => (
      <div className="flex flex-col items-center gap-3 p-2">
        <div className="flex items-center gap-2 text-amber-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="font-semibold">Are you sure you want to delete this complaint?</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDelete(complaintId);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
    });
  };

  const confirmDelete = async (complaintId) => {
    const deleteToast = toast.loading('Deleting complaint...');
    try {
      await api.delete(`/complaints/${complaintId}`);
      toast.success('Complaint deleted successfully!', { id: deleteToast });
      setAllComplaints(prev => prev.filter(c => c._id !== complaintId));
      setFilteredList(prev => prev.filter(c => c._id !== complaintId));
    } catch (err) {
      console.error('Failed to delete complaint:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete complaint.';
      toast.error(errorMessage, { id: deleteToast });
    }
  };

  const toggleHistory = (id) => {
    setExpandedComplaintId(prevId => (prevId === id ? null : id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Review': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Work in Progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString) => new Date(dateString).toLocaleString();

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (error && allComplaints.length === 0) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Complaints</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[88vh] overflow-hidden bg-gray-50 flex">
      {/* Left Sidebar - Fixed */}
      <div className="w-80 bg-white border-r border-gray-200 shadow-sm flex-shrink-0">
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Complaints</h1>
            <p className="text-gray-600 text-sm">
              View, manage, and track all your submitted complaints
            </p>
          </div>

          {/* Statistics */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Total Complaints</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{allComplaints.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Currently Showing</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{filteredList.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          {/* Enhanced Filter Section - ShadCN Style */}
          {allComplaints.length > 0 && (
            <div className="mb-8 space-y-4">
              <div className="space-y-2">
                <label htmlFor="departmentFilter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Filter by Department
                </label>
                <div className="relative">
                  <select
                    id="departmentFilter"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                    style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="all">All Departments ({allComplaints.length})</option>
                    {departments.map(dept => {
                      const count = allComplaints.filter(c => c.department?._id === dept._id).length;
                      return (
                        <option key={dept._id} value={dept._id}>
                          {dept.name} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-4 w-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Filter Status Badge */}
              {selectedFilter !== 'all' && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                      style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                      </svg>
                      Filtered
                    </div>
                    <span className="text-sm text-blue-700 font-medium">
                      {departments.find(d => d._id === selectedFilter)?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                    style={{ color: '#6b7280' }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#6b7280';
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="sr-only">Clear filter</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="mt-auto">
            <Link
              to="/new"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Right Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Empty State */}
          {filteredList.length === 0 && !isLoading ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="text-gray-400 mb-6">
                  <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedFilter === 'all' ? 'No complaints yet' : 'No complaints match your filter'}
                </h3>
                <p className="text-gray-500 mb-8">
                  {selectedFilter === 'all'
                    ? 'Ready to submit your first complaint? Get started now.'
                    : 'Try adjusting your filter or submit a new complaint.'}
                </p>
                <Link
                  to="/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Submit New Complaint
                </Link>
              </div>
            </div>
          ) : (
            /* Complaints Feed */
            <div className="space-y-4">
              {filteredList.map((complaint) => (
                <div key={complaint._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Complaint Header */}
                  <div className="p-6 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                          {complaint.title}
                        </h3>
                        {complaint.department && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                            </svg>
                            {complaint.department.name}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        <div className="text-sm text-gray-500 font-medium">
                          {formatDate(complaint.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complaint Image */}
                  {complaint.image && (
                    <div className="px-6 pb-4">
                      <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={`${API_BASE_URL}${complaint.image}`}
                          alt="Complaint attachment"
                          className="w-full max-h-96 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Complaint Description */}
                  <div className="px-6 pb-6">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleHistory(complaint._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {expandedComplaintId === complaint._id ? 'Hide History' : 'View History'}
                      </button>
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* History Section */}
                  {expandedComplaintId === complaint._id && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Complaint Timeline
                        </h4>
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                          <div className="space-y-6">
                            {complaint.history && complaint.history.slice().reverse().map((entry, index) => (
                              <div key={index} className="relative flex items-start gap-4">
                                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm ${index === 0 ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-gray-900">{entry.status}</h5>
                                    <span className="text-sm text-gray-500 font-medium">
                                      {formatDateTime(entry.timestamp)}
                                    </span>
                                  </div>
                                  {index === 0 && (
                                    <div className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                      Current Status
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}