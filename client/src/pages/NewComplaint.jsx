import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DESCRIPTION_MAX = 1000;

export default function NewComplaint() {
  const [formData, setFormData] = useState({ title: '', description: '', department: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SmartGrievance - New Complaint';
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
    if (name === 'description' && value.length > DESCRIPTION_MAX) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'department') setAiSuggestion(null);
  };

  const getAiSuggestion = async () => {
    if (!formData.title && !formData.description) {
      toast.error('Please enter a title or description first');
      return;
    }
    try {
      const res = await api.post('/complaints/suggest-department', {
        title: formData.title,
        description: formData.description
      });
      const suggested = res.data.department;
      if (suggested) {
        setAiSuggestion(suggested);
        toast.success(`AI suggests: ${suggested}`, { icon: '\u{1F916}' });
      } else {
        setAiSuggestion(null);
        toast.error('Could not detect department. Please select manually.', { icon: '\u{1F50D}' });
      }
    } catch {
      toast.error('Failed to get AI suggestion');
    }
  };

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

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
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
    if (imagePreview) { URL.revokeObjectURL(imagePreview); setImagePreview(null); }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', department: '' });
    setImage(null);
    if (imagePreview) { URL.revokeObjectURL(imagePreview); setImagePreview(null); }
    setAiSuggestion(null);
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
      resetForm();
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
        <p className="text-gray-600 dark:text-gray-400 mt-2">We&apos;re here to help resolve your issue quickly</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <form onSubmit={submit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Complaint Title *</label>
            <input
              type="text" name="title" value={formData.title} onChange={handleInputChange}
              placeholder="Brief summary of your issue" required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department *</label>
              <button type="button" onClick={getAiSuggestion} className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                Suggest Department
              </button>
            </div>

            {aiSuggestion && (
              <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">AI suggests: <strong>{aiSuggestion}</strong></span>
                <button type="button" onClick={applySuggestion} className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">Apply</button>
              </div>
            )}

            <select
              name="department" value={formData.department} onChange={handleInputChange} required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select a department</option>
              {departments.map(dept => (<option key={dept._id} value={dept._id}>{dept.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
            <textarea
              name="description" value={formData.description} onChange={handleInputChange} rows={6}
              placeholder="Please provide detailed information about your complaint..." required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${formData.description.length > DESCRIPTION_MAX * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.description.length}/{DESCRIPTION_MAX}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attach Image (Optional)</label>
            <div
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all ${
                isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {imagePreview ? (
                <div className="text-center">
                  <img src={imagePreview} alt="Preview" className="mx-auto h-40 w-auto rounded-lg object-cover" />
                  <button type="button" onClick={removeImage} className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium">Remove Image</button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="image-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input id="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
