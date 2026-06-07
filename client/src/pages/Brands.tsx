import React from 'react';
import MasterManager from '../components/MasterManager';
import { GridColDef } from '@mui/x-data-grid';

const Brands: React.FC = () => {
  const fields = [
    { name: 'brandName', label: 'Brand Name', required: true },
    { name: 'description', label: 'Description', multiline: true, rows: 3 },
  ];

  const columns: GridColDef[] = [
    { field: 'brandName', headerName: 'Brand Name', width: 220, sortable: true },
    { field: 'description', headerName: 'Description', flex: 1, sortable: true },
  ];

  return (
    <MasterManager
      title="Brand"
      moduleName="Products"
      endpoint="/masters/brands"
      fields={fields}
      columns={columns}
    />
  );
};

export default Brands;
