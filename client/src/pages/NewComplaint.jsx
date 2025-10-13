import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function NewComplaint() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('');

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const navigate = useNavigate();

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

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
      fd.append('department', department);
      
      if (image) {
        fd.append('image', image);
      }
      
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

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Main Image (Optional)
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div>
                      <img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded-lg object-cover"/>
                      <button type="button" onClick={removeImage} className="mt-2 text-sm text-red-600 hover:text-red-500">
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*"/>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              {/* ... (rest of the attachments JSX is unchanged) ... */}
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <button type="button" onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
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