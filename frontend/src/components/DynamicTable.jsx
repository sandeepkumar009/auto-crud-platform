import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

// Renders a data table dynamically based on a model's fields and data.
const DynamicTable = ({ fields, data, onEdit, onDelete }) => {
  
  // Helper to format data for display
  const formatValue = (value, type) => {
    if (type === 'boolean') {
      return value ? (
        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Yes</span>
      ) : (
        <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">No</span>
      );
    }
    if (type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    if (value === null || value === undefined) {
      return <span className="text-gray-400">N/A</span>;
    }
    return String(value);
  };
  
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="w-full min-w-max">
        {/* Table Header */}
        <thead>
          <tr className="border-b bg-gray-50">
            {fields.map((field) => (
              <th key={field.name} className="px-4 py-3 text-sm font-semibold text-left text-gray-600 uppercase">
                {field.name}
              </th>
            ))}
            <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="divide-y">
          {data.length === 0 ? (
            <tr>
              <td colSpan={fields.length + 1} className="p-4 text-center text-gray-500">
                No data found.
              </td>
            </tr>
          ) : (
            data.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                {fields.map((field) => (
                  <td key={field.name} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {formatValue(record[field.name], field.type)}
                  </td>
                ))}
                {/* Action Buttons */}
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  <button 
                    onClick={() => onEdit(record)} 
                    className="p-2 text-indigo-600 rounded-full hover:bg-indigo-100"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(record.id)}
                    className="p-2 ml-2 text-red-600 rounded-full hover:bg-red-100"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
