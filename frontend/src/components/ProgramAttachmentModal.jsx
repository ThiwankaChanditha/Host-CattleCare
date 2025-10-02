import React, { useState, useEffect } from 'react';
import { XIcon, UploadIcon, FileIcon, TrashIcon, DownloadIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ProgramAttachmentModal({ isOpen, onClose, program }) {
  const { token } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && program) {
      fetchAttachments();
    }
  }, [isOpen, program]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/programs/${program._id}/attachments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAttachments(response.data);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setError('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', description);

      const response = await axios.post(
        `/api/programs/${program._id}/attachments`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setAttachments(prev => [response.data, ...prev]);
      setSelectedFile(null);
      setDescription('');
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      await axios.delete(`/api/programs/${program._id}/attachments/${attachmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAttachments(prev => prev.filter(att => att._id !== attachmentId));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      setError('Failed to delete attachment');
    }
  };

  const handleDownload = async (attachment) => {
    try {
      // Use the new download route with authentication
      const response = await axios.get(
        `/api/programs/${program._id}/attachments/${attachment._id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          responseType: 'blob', // Important for file downloads
        }
      );

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.original_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Attachments - {program?.program_name}
          </h2>
          <button
            onClick={onClose}
            className="relative z-50 p-3 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal">
            <XIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Attachment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: 10MB. Supported formats: PDF, Word, Excel, Images, Text
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter a description for this attachment..."
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <UploadIcon className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Attachment'}
              </button>
            </div>
          </div>

          {/* Attachments List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Attachments</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading attachments...</p>
              </div>
            ) : attachments.length === 0 ? (
              <div className="text-center py-8">
                <FileIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No attachments found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div key={attachment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileIcon className="w-8 h-8 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">{attachment.original_name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(attachment.file_size)} • 
                            {new Date(attachment.uploaded_at).toLocaleDateString()} • 
                            Uploaded by {attachment.uploaded_by?.full_name || attachment.uploaded_by?.username || 'Unknown'}
                          </p>
                          {attachment.description && (
                            <p className="text-sm text-gray-600 mt-1">{attachment.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(attachment)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <DownloadIcon className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(attachment._id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
