import React from 'react';
import { useParams } from 'react-router-dom';

const ModelDataPage = () => {
  const { modelName } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 capitalize">
        {modelName}
      </h1>
      <p className="mt-2 text-gray-600">
        This is where the Admin will manage data for the '{modelName}' model.
      </p>
      <div className="mt-6 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Coming Soon</h2>
        <p className="mt-2 text-gray-500">
          A dynamic table and dynamic forms for creating, editing, and
          deleting '{modelName}' records will live here.
        </p>
      </div>
    </div>
  );
};

export default ModelDataPage;
