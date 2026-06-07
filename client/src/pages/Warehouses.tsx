import React from 'react';
import MasterManager from '../components/MasterManager';
import { GridColDef } from '@mui/x-data-grid';

const Warehouses: React.FC = () => {
  const fields = [
    { name: 'warehouseCode', label: 'Warehouse Code', required: true },
    { name: 'warehouseName', label: 'Warehouse Name', required: true },
    { name: 'address', label: 'Address', required: true, multiline: true, rows: 2 },
    { name: 'manager', label: 'Manager Name', required: true },
  ];

  const columns: GridColDef[] = [
    { field: 'warehouseCode', headerName: 'Code', width: 140, sortable: true },
    { field: 'warehouseName', headerName: 'Warehouse Name', width: 220, sortable: true },
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'manager', headerName: 'Manager', width: 180, sortable: true },
  ];

  return (
    <MasterManager
      title="Warehouse"
      moduleName="Inventory"
      endpoint="/masters/warehouses"
      fields={fields}
      columns={columns}
    />
  );
};

export default Warehouses;
