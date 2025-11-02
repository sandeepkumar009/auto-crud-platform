import React, { useState, useEffect } from 'react';

// Renders a data form dynamically based on a model's fields.
const DynamicForm = ({ fields, initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({});

  // When initialData changes (e.g., when "Edit" is clicked),
  // pre-populate the form state.
  useEffect(() => {
    // Create an empty form state from the fields
    const emptyForm = fields.reduce((acc, field) => {
      acc[field.name] = field.default !== undefined ? field.default : '';
      if (field.type === 'boolean') {
        acc[field.name] = field.default !== undefined ? field.default : false;
      }
      return acc;
    }, {});
    
    // Overwrite with initialData if it exists
    setFormData(initialData ? { ...emptyForm, ...initialData } : emptyForm);
  }, [initialData, fields]);

  // Handle changes for all input types
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Helper to render the correct input based on field type
  const renderField = (field) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={formData[field.name] || false}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            required={field.required}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        );
      case 'text':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            required={field.required}
            rows="3"
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            id={field.name}
            name={field.name}
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={handleChange}
            required={field.required}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        );
      case 'string':
      default:
        return (
          <input
            type="text"
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            required={field.required}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
            {field.name} {field.required && '*'}
          </label>
          {renderField(field)}
        </div>
      ))}
      
      {/* Form Actions */}
      <div className="flex justify-end pt-4 space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm disabled:bg-indigo-400 hover:bg-indigo-700"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
