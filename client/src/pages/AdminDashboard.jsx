import { useState, useEffect, useCallback, Fragment } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  
  const statusOptions = ['Submitted', 'In Review', 'Work in Progress', 'Resolved', 'Closed'];
  
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
        toast.error("Could not load departments.");
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
      const errorMessage = err.response?.data?.message || 'Failed to fetch complaints.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchComplaints();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [fetchComplaints]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', status: '', department: '' });
  };

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
    setNewStatus('');
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    
    try {
      await api.patch(`/complaints/${selectedComplaint._id}/status`, { status: newStatus });
      toast.success('Status updated successfully!');
      handleCloseModal();
      fetchComplaints();
    } catch (err) {
      console.error('Failed to update status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update status.';
      toast.error(errorMessage);
    }
  };
  
  const handleDelete = (complaintId) => {
    toast((t) => (
      <div className="flex flex-col items-center gap-3">
        <p className="font-semibold">Are you sure you want to delete this?</p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDelete(complaintId);
            }}
            className="px-4 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
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
      setComplaints(prev => prev.filter(c => c._id !== complaintId));
      if (expandedRow === complaintId) {
         setExpandedRow(null);
      }
    } catch (err) {
      console.error('Failed to delete complaint:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete complaint.';
      toast.error(errorMessage, { id: deleteToast });
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'In Review': return 'bg-indigo-100 text-indigo-800';
      case 'Work in Progress': return 'bg-amber-100 text-amber-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (error && complaints.length === 0) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                name="search"
                placeholder="Search by title..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <button
                onClick={resetFilters}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {loading ? (
             <div className="p-8 text-center">Loading complaints...</div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaints.length > 0 ? complaints.map((c) => (
                    <Fragment key={c._id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.user?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.department?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-4">
                          <button
                            onClick={() => handleOpenModal(c)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button onClick={() => toggleRow(c._id)} className="text-blue-600 hover:text-blue-900 font-medium">
                            {expandedRow === c._id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      {expandedRow === c._id && (
                        <tr className="bg-gray-50">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="text-sm text-gray-800">
                              <p className="font-semibold">Description:</p>
                              <p className="mb-4">{c.description}</p>
                              {c.image && (
                                <div>
                                  <p className="font-semibold mb-2">Image:</p>
                                  <img 
                                    src={`${API_BASE_URL}${c.image}`} 
                                    alt="Complaint attachment" 
                                    className="rounded-lg max-h-80 w-auto object-cover border shadow-sm"
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">No complaints match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-10 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Complaint Status</h2>
            <p className="mb-1 text-sm"><span className="font-semibold">Complaint:</span> {selectedComplaint.title}</p>
            <form onSubmit={handleStatusUpdate}>
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">New Status</label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}