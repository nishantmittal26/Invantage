import React from 'react';
import MasterManager from '../components/MasterManager';
import { GridColDef } from '@mui/x-data-grid';

const Units: React.FC = () => {
  const fields = [
    { name: 'unitName', label: 'Unit Name', required: true },
  ];

  const columns: GridColDef[] = [
    { field: 'unitName', headerName: 'Unit Name', flex: 1, sortable: true },
  ];

  return (
    <MasterManager
      title="Unit"
      moduleName="Products"
      endpoint="/masters/units"
      fields={fields}
      columns={columns}
    />
  );
};

export default Units;
