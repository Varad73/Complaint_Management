import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ✨ Client-side department keyword matching (same as backend)
function suggestDepartmentClient(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  const deptKeywords = {
    'Sewage Management': [
      'sewage', 'drain', 'drainage', 'sewer', 'blocked', 'clogged', 'overflow', 'wastewater',
      'toilet', 'manhole', 'pipe burst', 'smell', 'stagnant water', 'flooding', 'sump'
    ],
    'Road Maintenance': [
      'road', 'pothole', 'street', 'asphalt', 'pavement', 'crack', 'speed bump',
      'footpath', 'sidewalk', 'bridge', 'culvert', 'traffic signal', 'signboard',
      'streetlight', 'road safety', 'accident', 'speed breaker'
    ],
    'Electricity': [
      'electricity', 'power', 'voltage', 'wire', 'pole', 'transformer', 'fuse', 'trip',
      'outage', 'blackout', 'shock', 'electrical', 'meter', 'bill', 'street light',
      'light not working', 'sparking', 'earthing'
    ]
  };
  
  for (const [dept, keywords] of Object.entries(deptKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      return dept;
    }
  }
  return null;
}

export default function NewComplaint() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // ✨ AI suggestion state
  const [aiSuggestion, setAiSuggestion] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (error) {
        toast.error("Could not load departments");
      }
    };
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // ✨ Clear suggestion when user manually changes department
    if (name === 'department') {
      setAiSuggestion(null);
    }
  };

  // ✨ Function to get AI suggestion based on current title+description
  const getAiSuggestion = () => {
    if (!formData.title && !formData.description) {
      toast.error('Please enter a title or description first');
      return;
    }
    const suggested = suggestDepartmentClient(formData.title, formData.description);
    if (suggested) {
      setAiSuggestion(suggested);
      toast.success(`AI suggests: ${suggested}`, { icon: '🤖' });
    } else {
      setAiSuggestion(null);
      toast.error('Could not detect department. Please select manually.', { icon: '🔍' });
    }
  };

  // ✨ Apply the AI suggestion to the department dropdown
  const applySuggestion = () => {
    if (aiSuggestion) {
      const matchedDept = departments.find(d => d.name === aiSuggestion);
      if (matchedDept) {
        setFormData(prev => ({ ...prev, department: matchedDept._id }));
        toast.success(`Department set to ${aiSuggestion}`);
        setAiSuggestion(null);
      } else {
        toast.error('Department not found in list');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error('Please upload an image file');
    }
  }, []);

  const removeImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('department', formData.department);
      if (image) fd.append('image', image);

      await api.post('/complaints', fd);
      toast.success('Complaint submitted successfully!');
      navigate('/my');
    } catch (error) {
      toast.error('Failed to submit complaint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Submit a Complaint
        </h1>
        <p className="text-gray-600 mt-2">We're here to help resolve your issue quickly</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={submit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complaint Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief summary of your issue"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Department *
              </label>
              <button
                type="button"
                onClick={getAiSuggestion}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <span>🤖</span> Suggest Department
              </button>
            </div>
            
            {/* AI Suggestion Banner */}
            {aiSuggestion && (
              <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  🤖 AI suggests: <strong>{aiSuggestion}</strong>
                </span>
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700"
                >
                  Apply
                </button>
              </div>
            )}
            
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select a department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              placeholder="Please provide detailed information about your complaint..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Image (Optional)
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              {imagePreview ? (
                <div className="text-center">
                  <img src={imagePreview} alt="Preview" className="mx-auto h-40 w-auto rounded-lg object-cover"/>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-3 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input id="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*"/>
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}