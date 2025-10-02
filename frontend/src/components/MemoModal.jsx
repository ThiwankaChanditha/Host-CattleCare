import React, { useState, useEffect } from 'react';
import {
  XIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  CalendarIcon,
  BookOpenIcon
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function MemoModal({ isOpen, onClose, onMemoUpdate }) {
  const { token } = useAuth();
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMemo, setEditingMemo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    due_date: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchMemos();
    }
  }, [isOpen]);

  const fetchMemos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ldi/memos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        setMemos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching memos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingMemo
        ? `/api/ldi/memos/${editingMemo._id}`
        : '/api/ldi/memos';

      const method = editingMemo ? 'put' : 'post';

      const response = await axios[method](url, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setFormData({ title: '', content: '', priority: 'medium', due_date: '' });
        setShowAddForm(false);
        setEditingMemo(null);
        fetchMemos();
        if (onMemoUpdate) onMemoUpdate();
      }
    } catch (error) {
      console.error('Error saving memo:', error);
    }
  };

  const handleEdit = (memo) => {
    setEditingMemo(memo);
    setFormData({
      title: memo.title,
      content: memo.content,
      priority: memo.priority,
      due_date: memo.due_date ? new Date(memo.due_date).toISOString().split('T')[0] : ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (memoId) => {
    if (!window.confirm('Are you sure you want to delete this memo?')) return;

    try {
      const response = await axios.delete(`/api/ldi/memos/${memoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        fetchMemos();
        if (onMemoUpdate) onMemoUpdate();
      }
    } catch (error) {
      console.error('Error deleting memo:', error);
    }
  };

  const handleStatusToggle = async (memo) => {
    try {
      const newStatus = memo.status === 'pending' ? 'completed' : 'pending';
      const response = await axios.put(`/api/ldi/memos/${memo._id}`, {
        ...memo,
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        fetchMemos();
        if (onMemoUpdate) onMemoUpdate();
      }
    } catch (error) {
      console.error('Error updating memo status:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'completed' ? (
      <CheckCircleIcon className="w-4 h-4 text-green-600" />
    ) : (
      <ClockIcon className="w-4 h-4 text-yellow-600" />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Memo Book</h2>
              <p className="text-sm text-gray-500">Manage your reminders and notes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative z-50 p-3 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal">
            <XIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Memo List */}
          <div className="w-full lg:w-1/2 border-r border-gray-200 lg:border-r-0 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Memos</h3>
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingMemo(null);
                    setFormData({ title: '', content: '', priority: 'medium', due_date: '' });
                  }}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-sm">Add Memo</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading memos...</p>
                </div>
              ) : memos.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No memos yet. Create your first memo!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memos.map((memo) => (
                    <div
                      key={memo._id}
                      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${memo.status === 'completed'
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-200'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(memo.status)}
                            <h4 className={`font-semibold text-sm ${memo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}>
                              {memo.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(memo.priority)}`}>
                              {memo.priority}
                            </span>
                          </div>
                          <p className={`text-sm mb-2 ${memo.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {memo.content}
                          </p>
                          {memo.due_date && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{new Date(memo.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleStatusToggle(memo)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title={memo.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                          >
                            {memo.status === 'completed' ? (
                              <ClockIcon className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(memo)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Edit memo"
                          >
                            <EditIcon className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(memo._id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete memo"
                          >
                            <TrashIcon className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="w-full lg:w-1/2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingMemo ? 'Edit Memo' : 'Add New Memo'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMemo(null);
                    setFormData({ title: '', content: '', priority: 'medium', due_date: '' });
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <XIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter memo title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter memo content"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingMemo ? 'Update Memo' : 'Add Memo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingMemo(null);
                      setFormData({ title: '', content: '', priority: 'medium', due_date: '' });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
