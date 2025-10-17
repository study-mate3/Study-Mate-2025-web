import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';

const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingTask = null,
  initialDate = null 
}) => {
  const [formData, setFormData] = useState({
    description: '',
    list: 'Personal',
    dueDate: '',
    subTasks: '',
    priority: 'low',
    completed: false,
  });

  const [listOptions] = useState(['Personal', 'Work', 'Study']);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        description: editingTask.description || '',
        list: editingTask.list || 'Personal',
        dueDate: editingTask.dueDate || '',
        subTasks: editingTask.subTasks || '',
        priority: editingTask.priority || 'low',
        completed: editingTask.completed || false,
      });
    } else {
      setFormData({
        description: '',
        list: 'Personal',
        dueDate: initialDate || '',
        subTasks: '',
        priority: 'low',
        completed: false,
      });
    }
  }, [editingTask, initialDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.description.trim()) {
      onSubmit(formData, editingTask?.id);
      setFormData({
        description: '',
        list: 'Personal',
        dueDate: '',
        subTasks: '',
        priority: 'low',
        completed: false,
      });
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: '"Inter", sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter task description..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              required
            />
          </div>

          {/* List and Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                List
              </label>
              <select
                value={formData.list}
                onChange={(e) => handleChange('list', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {listOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sub Tasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Tasks
            </label>
            <input
              type="text"
              value={formData.subTasks}
              onChange={(e) => handleChange('subTasks', e.target.value)}
              placeholder="Add sub tasks (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

TaskForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingTask: PropTypes.object,
  initialDate: PropTypes.string,
};

export default TaskForm;
