import React from 'react';
import MasterManager from '../components/MasterManager';
import { GridColDef } from '@mui/x-data-grid';

const Suppliers: React.FC = () => {
  const fields = [
    { name: 'supplierName', label: 'Supplier Name', required: true },
    { name: 'contactPerson', label: 'Contact Person', required: true },
    { name: 'email', label: 'Email', required: true, type: 'email' },
    { name: 'mobile', label: 'Mobile', required: true },
    { name: 'gstNumber', label: 'GST Number', required: true },
    { name: 'address', label: 'Address', multiline: true, rows: 2, required: true },
    { name: 'city', label: 'City' },
    { name: 'state', label: 'State' },
    { name: 'country', label: 'Country' },
  ];

  const columns: GridColDef[] = [
    { field: 'supplierName', headerName: 'Supplier Name', width: 200, sortable: true },
    { field: 'contactPerson', headerName: 'Contact Person', width: 150 },
    { field: 'email', headerName: 'Email', width: 180 },
    { field: 'mobile', headerName: 'Mobile', width: 130 },
    { field: 'gstNumber', headerName: 'GST Number', width: 130 },
    { field: 'city', headerName: 'City', width: 120 },
    { field: 'state', headerName: 'State', width: 120 },
  ];

  return (
    <MasterManager
      title="Supplier"
      moduleName="Inventory"
      endpoint="/masters/suppliers"
      fields={fields}
      columns={columns}
    />
  );
};

export default Suppliers;
