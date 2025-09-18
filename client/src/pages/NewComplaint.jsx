import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function NewComplaint() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // ADDED: State for departments and selected department
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('');

  const navigate = useNavigate();

  // ADDED: useEffect to fetch departments when component mounts
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (error) {
        console.error("Failed to fetch departments", error);
        alert("Could not load departments. Please try again later.");
      }
    };
    fetchDepartments();
  }, []);


  const handleFileChange = (e) => {
    const selected = e.target.files;
    setFiles(selected);
    const filesArray = Array.from(selected).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setSelectedFiles(filesArray);
  };

  const removeFile = (index) => {
    const dataTransfer = new DataTransfer();
    Array.from(files).filter((_, i) => i !== index).forEach(file => dataTransfer.items.add(file));
    setFiles(dataTransfer.files);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', desc);
      fd.append('department', department); // ADDED: Append selected department ID
      
      if (files) {
        for (let i = 0; i < files.length; i++) {
          fd.append('attachments', files[i]);
        }
      }
      
      await api.post('/complaints', fd);
      alert('Complaint submitted successfully!');
      navigate('/my');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit a New Complaint</h1>
          <p className="mt-2 text-lg text-gray-600">Provide details about your issue and we'll help resolve it</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <form onSubmit={submit} className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Title *
              </label>
              <input
                id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your complaint" required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* ADDED: Department Selection Dropdown */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Select Department *
              </label>
              <select
                id="department" value={department} onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="" disabled>-- Please choose a department --</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                id="description" value={desc} onChange={(e) => setDesc(e.target.value)}
                placeholder="Please provide a detailed description..." required rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            {/* Attachments Section (Unchanged) */}
            <div>
               {/* ... (rest of the attachments JSX is unchanged) ... */}
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <button type="button" onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {/* MODIFIED: Disable button if department is not selected */}
              <button type="submit" disabled={isLoading || !title || !desc || !department}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}