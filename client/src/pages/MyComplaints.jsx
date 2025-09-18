import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function MyComplaints() {
  const [allComplaints, setAllComplaints] = useState([]); // Holds the original full list
  const [filteredList, setFilteredList] = useState([]); // Holds the list for display
  const [departments, setDepartments] = useState([]); // Holds departments for the filter
  const [selectedFilter, setSelectedFilter] = useState('all'); // Tracks the current filter
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch both complaints and departments
        const [complaintsRes, departmentsRes] = await Promise.all([
          api.get('/complaints/my'),
          api.get('/departments')
        ]);
        setAllComplaints(complaintsRes.data.list);
        setFilteredList(complaintsRes.data.list); // Initially, show all
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

  // ADDED: useEffect to apply filter when selection changes
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredList(allComplaints);
    } else {
      const filtered = allComplaints.filter(c => c.department?._id === selectedFilter);
      setFilteredList(filtered);
    }
  }, [selectedFilter, allComplaints]);


  const getStatusColor = (status) => { /* ... (unchanged) ... */ };
  const formatDate = (dateString) => { /* ... (unchanged) ... */ };

  if (isLoading) { /* ... (unchanged) ... */ }
  if (error) { /* ... (unchanged) ... */ }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
          <p className="mt-2 text-gray-600">View and manage all your submitted complaints</p>
        </div>

        {/* ADDED: Filter Dropdown */}
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
            {/* ... (This part is mostly unchanged, but now shows if no complaints match filter) ... */}
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {selectedFilter === 'all' ? 'No complaints yet' : 'No complaints match filter'}
            </h3>
            {/* ... */}
          </div>
        ) : (
          <div className="space-y-4">
            {/* MODIFIED: Map over 'filteredList' instead of 'list' */}
            {filteredList.map((complaint) => (
              <div key={complaint._id} className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                  {/* ADDED: Display Department Name */}
                  {complaint.department && (
                    <p className="text-sm font-medium text-blue-600 mb-3">
                      Department: {complaint.department.name}
                    </p>
                  )}
                  <p className="text-gray-600 mb-4">{complaint.description}</p>
                  {/* ... (rest of the card is unchanged) ... */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}