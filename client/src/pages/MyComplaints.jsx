import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

export default function MyComplaints() {
  const [allComplaints, setAllComplaints] = useState([]); 
  const [filteredList, setFilteredList] = useState([]); 
  const [departments, setDepartments] = useState([]); 
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError('Failed to load data. Please try again later.');
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

  const handleDelete = async (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      try {
        await api.delete(`/complaints/${complaintId}`);
        setAllComplaints(prev => prev.filter(c => c._id !== complaintId));
        setFilteredList(prev => prev.filter(c => c._id !== complaintId));
      } catch (err) {
        console.error('Failed to delete complaint:', err);
        alert('Failed to delete complaint. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'In Review':
        return 'bg-indigo-100 text-indigo-800';
      case 'Work in Progress':
        return 'bg-amber-100 text-amber-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  if (isLoading) return <div className="text-center p-8">Loading complaints...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
          <p className="mt-2 text-gray-600">View and manage all your submitted complaints</p>
        </div>

        {allComplaints.length > 0 && (
          <div className="mb-6">
            <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
            <select
              id="departmentFilter"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
        )}

        {filteredList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {selectedFilter === 'all' ? 'No complaints yet' : 'No complaints match filter'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">Ready to submit your first one?</p>
            <div className="mt-6">
              <Link to="/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Submit a New Complaint
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((complaint) => (
              <div key={complaint._id} className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                  {complaint.department && (
                    <p className="text-sm font-medium text-blue-600 mb-3">
                      Department: {complaint.department.name}
                    </p>
                  )}
                  {complaint.image && (
                    <div className="my-4">
                      <img 
                        src={`${API_BASE_URL}${complaint.image}`} 
                        alt="Complaint attachment" 
                        className="rounded-lg max-h-80 w-auto object-cover border shadow-sm"
                      />
                    </div>
                  )}
                  <p className="text-gray-600 mb-4">{complaint.description}</p>
                    <div className="text-xs text-gray-500">
                      Submitted on: {formatDate(complaint.createdAt)}
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-right">
                  <button
                    onClick={() => handleDelete(complaint._id)}
                    className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete Complaint
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}