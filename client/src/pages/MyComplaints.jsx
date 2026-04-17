import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000';

const getPriorityBadge = (priority) => {
  const badges = {
    high: { bg: 'bg-red-100', text: 'text-red-800', label: '🔴 High Priority', icon: '⚠️' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🟡 Medium Priority', icon: '⚡' },
    low: { bg: 'bg-green-100', text: 'text-green-800', label: '🟢 Low Priority', icon: '✅' }
  };
  return badges[priority] || badges.low;
};

const getSentimentBadge = (sentiment) => {
  const sentiments = {
    Negative: { bg: 'bg-orange-100', text: 'text-orange-800', label: '😠 Negative', icon: '😠' },
    Neutral: { bg: 'bg-gray-100', text: 'text-gray-800', label: '😐 Neutral', icon: '😐' },
    Positive: { bg: 'bg-blue-100', text: 'text-blue-800', label: '😊 Positive', icon: '😊' }
  };
  return sentiments[sentiment] || sentiments.Neutral;
};

export default function MyComplaints() {
  const [allComplaints, setAllComplaints] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
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
        toast.error('Failed to load data');
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
      setFilteredList(allComplaints.filter(c => c.department?._id === selectedFilter));
    }
  }, [selectedFilter, allComplaints]);

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

  const getStatusConfig = (status) => {
    const configs = {
      'Submitted': { color: 'bg-blue-500', text: 'text-blue-500', label: 'Submitted' },
      'In Review': { color: 'bg-yellow-500', text: 'text-yellow-500', label: 'In Review' },
      'Work in Progress': { color: 'bg-orange-500', text: 'text-orange-500', label: 'Work in Progress' },
      'Resolved': { color: 'bg-green-500', text: 'text-green-500', label: 'Resolved' },
      'Closed': { color: 'bg-gray-500', text: 'text-gray-500', label: 'Closed' }
    };
    return configs[status] || { color: 'bg-gray-500', text: 'text-gray-500', label: status };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your complaints...</p>
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
        <p className="text-gray-600 mt-2">Track and manage all your submitted complaints</p>
      </div>

      {allComplaints.length > 0 && (
        <div className="mb-6">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
        </div>
      )}

      {filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No complaints yet</h3>
          <p className="text-gray-600 mb-6">Ready to submit your first complaint?</p>
          <Link
            to="/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Submit a Complaint
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredList.map((complaint) => {
            const statusConfig = getStatusConfig(complaint.status);
            const priorityBadge = complaint.priority ? getPriorityBadge(complaint.priority) : null;
            const sentimentBadge = complaint.sentiment ? getSentimentBadge(complaint.sentiment) : null;

            return (
              <div key={complaint._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 break-words">{complaint.title}</h3>
                      {complaint.department && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          {complaint.department.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Status badge */}
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig.color} bg-opacity-10`}>
                        <div className={`w-2 h-2 rounded-full ${statusConfig.color}`}></div>
                        <span className={`text-sm font-medium ${statusConfig.text}`}>{statusConfig.label}</span>
                      </div>

                      {/* ✨ AI Priority Badge ✨ */}
                      {priorityBadge && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}>
                          {priorityBadge.label}
                        </span>
                      )}

                      {/* ✨ AI Sentiment Badge ✨ */}
                      {sentimentBadge && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${sentimentBadge.bg} ${sentimentBadge.text}`}>
                          {sentimentBadge.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{complaint.description}</p>

                  {complaint.image && (
                    <div className="mb-4">
                      <img 
                        src={`${API_BASE_URL}${complaint.image}`} 
                        alt="Complaint"
                        className="rounded-lg max-h-48 w-auto object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setExpandedComplaintId(expandedComplaintId === complaint._id ? null : complaint._id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {expandedComplaintId === complaint._id ? 'Hide History' : 'View History'}
                      </button>
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {expandedComplaintId === complaint._id && complaint.history && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                      <div className="space-y-3">
                        {complaint.history.slice().reverse().map((entry, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{entry.status}</p>
                              <p className="text-sm text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
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