import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const getDefaultValueForType = (type) => {
  switch (type) {
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'date':
      return '';
    case 'string':
    case 'text':
    default:
      return '';
  }
};

const RenderDefaultInput = ({ field, index, onChange }) => {
  const commonProps = {
    name: 'default',
    value: field.default,
    onChange: (e) => onChange(index, e),
    className: "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
  };

  switch (field.type) {
    case 'number':
      return (
        <input
          {...commonProps}
          type="number"
          placeholder="e.g., 0"
        />
      );
    case 'boolean':
      return (
        <select {...commonProps}>
          <option value="false">False</option>
          <option value="true">True</option>
        </select>
      );
    case 'date':
      return (
        <input
          {...commonProps}
          type="date"
        />
      );
    case 'string':
    case 'text':
    default:
      return (
        <input
          {...commonProps}
          type="text"
          placeholder="e.g., 'Pending'"
        />
      );
  }
};


const ModelBuilderPage = () => {
  const { user } = useAuth();
  
  const [modelName, setModelName] = useState('');
  const [ownerField, setOwnerField] = useState('');

  const [fields, setFields] = useState([
    { name: '', type: 'string', required: false, unique: false, default: '' },
  ]);

  const [rbac, setRbac] = useState({
    Admin: ['all'],
    Manager: ['read', 'create', 'update'],
    Viewer: ['read'],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFieldChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newFields = [...fields];

    const currentField = newFields[index];

    if (type === 'checkbox') {
      currentField[name] = checked;
    } else {
      currentField[name] = value;
    }

    // If the 'type' dropdown was changed, reset the default value
    if (name === 'type') {
      currentField.default = getDefaultValueForType(value);
    }

    setFields(newFields);
  };

  const handleAddField = () => {
    setFields([
      ...fields,
      { name: '', type: 'string', required: false, unique: false, default: '' },
    ]);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const handleRbacChange = (role, perm) => {
    setRbac((prevRbac) => {
      const currentPerms = prevRbac[role] ? [...prevRbac[role]] : [];
      let newPerms = [];

      if (perm === 'all') {
        // If 'all' is clicked, toggle it. If 'all' is being added, it's the only perm.
        newPerms = currentPerms.includes('all') ? [] : ['all'];
      } else {
        // If any other perm is clicked...
        // Remove 'all' if it exists
        newPerms = currentPerms.filter(p => p !== 'all');
        
        // Toggle the specific permission
        if (newPerms.includes(perm)) {
          newPerms = newPerms.filter(p => p !== perm); // Toggle off
        } else {
          newPerms.push(perm); // Toggle on
        }
      }

      return { ...prevRbac, [role]: newPerms };
    });
  };

  const isRbacChecked = (role, perm) => {
    if (!rbac[role]) return false;
    if (rbac[role].includes('all')) return true;
    return rbac[role].includes(perm);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!modelName) {
      setError('Model Name is required.');
      setLoading(false);
      return;
    }
    for (const field of fields) {
      if (!field.name) {
        setError('All fields must have a name.');
        setLoading(false);
        return;
      }
    }

    const payload = {
      name: modelName,
      ownerField: ownerField || undefined,
      fields: fields.map(f => ({
        ...f,
        default: f.default === '' ? undefined : f.default,
      })),
      rbac: rbac,
    };

    try {
      const response = await api.post('/models/publish', payload);
      setSuccess(response.data.message);
      
      setModelName('');
      setOwnerField('');
      setFields([{ name: '', type: 'string', required: false, unique: false, default: '' }]);
      setRbac({
        Admin: ['all'],
        Manager: ['read', 'create', 'update'],
        Viewer: ['read'],
      });

      // We reload the page to force the sidebar to refetch the new model list.
      // A small delay lets the user read the success message.
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };
    
  // Only Admins can see this page
  if (user.role !== 'Admin') {
    return (
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          You must be an Admin to access the Model Builder.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Model Builder</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Card 1: Core Info --- */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Core Information</h2>
          <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
            <div>
              <label htmlFor="modelName" className="block text-sm font-medium text-gray-700">
                Model Name
              </label>
              <input
                type="text"
                id="modelName"
                value={modelName}
                onChange={(e) => setModelName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Product or Employee"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Singular, alphanumeric (e.g., "Product").
              </p>
            </div>
            <div>
              <label htmlFor="ownerField" className="block text-sm font-medium text-gray-700">
                Owner Field (Optional)
              </label>
              <input
                type="text"
                id="ownerField"
                value={ownerField}
                onChange={(e) => setOwnerField(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., ownerId or createdBy"
              />
              <p className="mt-1 text-xs text-gray-500">
                Field name to store the user ID of the record creator.
              </p>
            </div>
          </div>
        </div>

        {/* --- Card 2: Fields --- */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Fields</h2>
          <div className="mt-4 space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 p-4 border rounded-md md:grid-cols-12">
                {/* Field Name */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={field.name}
                    onChange={(e) => handleFieldChange(index, e)}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    placeholder="e.g., firstName"
                    required
                  />
                </div>
                {/* Field Type */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={field.type}
                    onChange={(e) => handleFieldChange(index, e)}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  >
                    <option value="string">String</option>
                    <option value="text">Text (Long String)</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="date">Date</option>
                  </select>
                </div>                
                {/* Default Value */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Default Value</label>
                  <RenderDefaultInput 
                    field={field} 
                    index={index} 
                    onChange={handleFieldChange} 
                  />
                </div>
                {/* Options (Checkboxes) */}
                <div className="flex items-center space-x-4 md:col-span-2 md:pt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="required"
                      checked={field.required}
                      onChange={(e) => handleFieldChange(index, e)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="unique"
                      checked={field.unique}
                      onChange={(e) => handleFieldChange(index, e)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Unique</span>
                  </label>
                </div>
                {/* Remove Button */}
                <div className="flex items-center justify-end md:col-span-1 md:pt-6">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(index)}
                      className="p-2 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddField}
            className="flex items-center px-4 py-2 mt-4 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200"
          >
            <Plus size={16} className="mr-2" />
            Add Field
          </button>
        </div>

        {/* --- Card 3: RBAC --- */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Role-Based Access Control (RBAC)</h2>
          <table className="w-full mt-4 text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-sm font-medium text-gray-600">Role</th>
                <th className="p-2 text-sm font-medium text-gray-600">Create</th>
                <th className="p-2 text-sm font-medium text-gray-600">Read</th>
                <th className="p-2 text-sm font-medium text-gray-600">Update</th>
                <th className="p-2 text-sm font-medium text-gray-600">Delete</th>
                <th className="p-2 text-sm font-medium text-gray-600">All</th>
              </tr>
            </thead>
            <tbody>
              {['Admin', 'Manager', 'Viewer'].map((role) => (
                <tr key={role} className="border-b last:border-b-0">
                  <td className="p-2 font-medium text-gray-700">{role}</td>
                  {['create', 'read', 'update', 'delete', 'all'].map((perm) => (
                    <td key={perm} className="p-2">
                      <input
                        type="checkbox"
                        disabled={role === 'Admin'}
                        checked={isRbacChecked(role, perm)}
                        onChange={() => handleRbacChange(role, perm)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded disabled:bg-gray-200"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Submission Area --- */}
        <div className="flex items-center justify-end space-x-4">
          {error && (
            <div className="flex items-center text-sm text-red-600">
              <AlertTriangle size={18} className="mr-2" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle size={18} className="mr-2" /> {success}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 font-medium text-white rounded-md shadow-sm 
              ${loading 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
          >
            {loading ? 'Publishing...' : 'Publish Model'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModelBuilderPage;
