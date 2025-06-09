import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import courseService from '../../services/courseService';

const CourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const isEditMode = !!courseId;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      if (isEditMode) {
        try {
          setInitialLoading(true);
          const courseData = await courseService.getCourseById(courseId);
          setFormData({
            title: courseData.title,
            description: courseData.description,
            mediaUrl: courseData.mediaUrl || ''
          });
        } catch (err) {
          console.error('Error fetching course:', err);
          toast.error('Failed to load course data');
          navigate('/instructor/courses');
        } finally {
          setInitialLoading(false);
        }
      }
    };

    fetchCourse();
  }, [courseId, isEditMode, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }
    
    if (uploadType === 'url' && formData.mediaUrl && !isValidUrl(formData.mediaUrl)) {
      newErrors.mediaUrl = 'Please enter a valid URL';
    }
    
    if (uploadType === 'file' && !selectedFile && !formData.mediaUrl) {
      newErrors.mediaFile = 'Please select a file to upload';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    // Basic check first
    if (!url || url.trim() === '') return false;
    
    // Special case for YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return true;
    }
    
    // General URL validation
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Clear any previous media URL when a new file is selected
      setFormData(prev => ({
        ...prev,
        mediaUrl: ''
      }));
    }
  };

  const handleUploadTypeChange = (type) => {
    setUploadType(type);
    // Clear values when switching between types
    if (type === 'url') {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setFormData(prev => ({
        ...prev,
        mediaUrl: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      console.log('Form submission started with data:', formData);
      console.log('Upload type:', uploadType);
      
      // 1. Prepare the media URL based on upload type
      let finalMediaUrl = '';
      
      // Handle file upload case
      if (uploadType === 'file' && selectedFile) {
        console.log('Uploading local file:', selectedFile.name, selectedFile.size, 'bytes');
        
        // Create a form data object for file upload
        const fileFormData = new FormData();
        fileFormData.append('file', selectedFile, selectedFile.name);
        
        // Log what we're sending for debugging
        console.log('FormData details:', {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type
        });
        
        try {
          // Upload the file to blob storage
          const uploadResult = await courseService.uploadMedia(fileFormData, (progress) => {
            setUploadProgress(progress);
          });
          
          console.log('File upload successful. Received URL:', uploadResult.mediaUrl);
          finalMediaUrl = uploadResult.mediaUrl;
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          throw new Error('Failed to upload media file. Please try again.');
        }
      } 
      // Handle YouTube URL case
      else if (uploadType === 'url') {
        // Try directly testing the YouTube URL before course creation
        try {
          const testUrl = formData.mediaUrl.trim();
          console.log('Using YouTube URL:', testUrl);
          
          // Ensure URL is properly formatted
          let formattedUrl = testUrl;
          if (formattedUrl && !formattedUrl.startsWith('http')) {
            formattedUrl = 'https://' + formattedUrl;
            console.log('Added https protocol to URL:', formattedUrl);
          }
          
          // Test the URL directly with backend
          console.log('Testing YouTube URL with backend...');
          const testResult = await courseService.testYoutubeUrl(formattedUrl);
          console.log('YouTube URL test successful:', testResult);
          
          // Use the successful URL
          finalMediaUrl = formattedUrl;
          console.log('Final URL to be sent to backend:', finalMediaUrl);
        } catch (urlError) {
          console.error('YouTube URL test failed:', urlError);
          toast.error('Invalid YouTube URL. Please check and try again.');
          setLoading(false);
          return;
        }
      }
      
      // 2. Prepare course data with the final media URL
      const courseData = {
        title: formData.title,
        description: formData.description,
        instructorId: currentUser.userId
      };
      
      // Only add mediaUrl if it's not empty
      if (finalMediaUrl) {
        courseData.mediaUrl = finalMediaUrl;
      }
      
      console.log('Submitting course data to backend:', courseData);
      
      // 3. Create or update the course
      if (isEditMode) {
        const updatedCourse = await courseService.updateCourse(courseId, {
          courseId,
          ...courseData
        });
        console.log('Course updated successfully:', updatedCourse);
        toast.success('Course updated successfully');
      } else {
        const newCourse = await courseService.createCourse(courseData);
        console.log('Course created successfully:', newCourse);
        toast.success('Course created successfully');
      }
      
      // 4. Navigate to the courses page
      navigate('/instructor/courses');
    } catch (error) {
      console.error('Course submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save course. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h1>{isEditMode ? 'Edit Course' : 'Create New Course'}</h1>
          <p className="text-muted">
            {isEditMode 
              ? 'Update your course information' 
              : 'Fill in the details to create a new course'}
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Course Title*</label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter course title"
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description*</label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    id="description"
                    name="description"
                    rows="6"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter course description"
                  ></textarea>
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>
                
                <div className="mb-4">
                  <label className="form-label">Course Media</label>
                  
                  <div className="btn-group w-100 mb-3" role="group">
                    <input 
                      type="radio" 
                      className="btn-check" 
                      name="uploadType" 
                      id="urlRadio" 
                      autoComplete="off" 
                      checked={uploadType === 'url'}
                      onChange={() => handleUploadTypeChange('url')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="urlRadio">
                      <i className="bi bi-link me-2"></i>URL
                    </label>
                    
                    <input 
                      type="radio" 
                      className="btn-check" 
                      name="uploadType" 
                      id="fileRadio" 
                      autoComplete="off"
                      checked={uploadType === 'file'}
                      onChange={() => handleUploadTypeChange('file')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="fileRadio">
                      <i className="bi bi-file-earmark-arrow-up me-2"></i>Upload File
                    </label>
                  </div>
                  
                  {uploadType === 'url' ? (
                    <>
                      <input
                        type="text"
                        className={`form-control ${errors.mediaUrl ? 'is-invalid' : ''}`}
                        id="mediaUrl"
                        name="mediaUrl"
                        value={formData.mediaUrl}
                        onChange={handleChange}
                        placeholder="Enter video or other media URL"
                      />
                      {errors.mediaUrl && <div className="invalid-feedback">{errors.mediaUrl}</div>}
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Enter the URL for course video content or supplementary materials.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`custom-file ${errors.mediaFile ? 'is-invalid' : ''}`}>
                        <input
                          type="file"
                          className="form-control"
                          id="mediaFile"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                        />
                        {errors.mediaFile && <div className="invalid-feedback">{errors.mediaFile}</div>}
                      </div>
                      {selectedFile && (
                        <div className="form-text mt-2">
                          <i className="bi bi-file-earmark me-1"></i>
                          Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </div>
                      )}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="progress mt-2">
                          <div 
                            className="progress-bar progress-bar-striped progress-bar-animated" 
                            role="progressbar" 
                            style={{width: `${uploadProgress}%`}} 
                            aria-valuenow={uploadProgress} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          >
                            {uploadProgress}%
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="d-flex justify-content-between">
                  <Link to="/instructor/courses" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : isEditMode ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Tips for Creating Courses</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Provide a clear, descriptive title
                </li>
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Include detailed course description
                </li>
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Add relevant media content
                </li>
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Create assessments to test knowledge
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h5 className="card-title">What's Next?</h5>
              <p className="card-text">
                After creating your course, you can add assessments for students to complete.
              </p>
              <p className="card-text">
                You'll be able to track student progress and view results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;
