import React from 'react';
import MasterManager from '../components/MasterManager';
import { GridColDef } from '@mui/x-data-grid';

const Categories: React.FC = () => {
  const fields = [
    { name: 'categoryName', label: 'Category Name', required: true },
    { name: 'description', label: 'Description', multiline: true, rows: 3 },
  ];

  const columns: GridColDef[] = [
    { field: 'categoryName', headerName: 'Category Name', width: 220, sortable: true },
    { field: 'description', headerName: 'Description', flex: 1, sortable: true },
  ];

  return (
    <MasterManager
      title="Category"
      moduleName="Products"
      endpoint="/masters/categories"
      fields={fields}
      columns={columns}
    />
  );
};

export default Categories;
