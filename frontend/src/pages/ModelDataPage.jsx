import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, AlertTriangle, Loader2 } from 'lucide-react';
import DynamicTable from '../components/DynamicTable';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const ModelDataPage = () => {
  const { modelName } = useParams();
  
  // State for schema, data, and UI
  const [schema, setSchema] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for Modal and Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentItem, setCurrentItem] = useState(null); // Item to edit
  const [formLoading, setFormLoading] = useState(false);

  // Capitalize modelName for display (e.g., "Product")
  const capitalizedModelName = useMemo(() => 
    modelName.charAt(0).toUpperCase() + modelName.slice(1),
    [modelName]
  );

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      const response = await api.get(`/${modelName}`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
    }
  };

  // Initial load: Fetch both schema and data
  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch schema and data in parallel
        const [schemaResponse, dataResponse] = await Promise.all([
          api.get(`/models/${capitalizedModelName}`),
          api.get(`/${modelName}`)
        ]);
        
        setSchema(schemaResponse.data);
        setData(dataResponse.data);
        
      } catch (err) {
        console.error('Error loading page data:', err);
        setError(err.response?.data?.message || 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };
    
    loadPageData();
  }, [modelName, capitalizedModelName]); // Re-run if modelName changes

  // --- Modal & Form Handlers ---
  
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setCurrentItem(item);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (modalMode === 'create') {
        // --- Create ---
        await api.post(`/${modelName}`, formData);
      } else {
        // --- Update ---
        await api.put(`/${modelName}/${currentItem.id}`, formData);
      }
      
      handleCloseModal();
      await fetchData(); // Refresh data in the table
      
    } catch (err) {
      console.error('Error saving item:', err);
      // TODO: Set a form-specific error
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // A simple confirmation dialog.
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/${modelName}/${id}`);
        await fetchData(); // Refresh data
      } catch (err) {
        console.error('Error deleting item:', err);
        setError(err.response?.data?.message || 'Failed to delete item');
      }
    }
  };
  
  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="flex items-center text-2xl font-bold text-red-600">
          <AlertTriangle className="mr-3" /> Error
        </h1>
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  if (!schema) {
    return <div>Model schema not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          {capitalizedModelName}
        </h1>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center px-4 py-2 font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
        >
          <Plus size={18} className="mr-2" />
          Add New
        </button>
      </div>
      
      {/* Table */}
      <DynamicTable 
        fields={schema.fields}
        data={data}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />
      
      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={modalMode === 'create' ? `New ${capitalizedModelName}` : `Edit ${capitalizedModelName}`}
      >
        <DynamicForm 
          fields={schema.fields}
          initialData={currentItem}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default ModelDataPage;
