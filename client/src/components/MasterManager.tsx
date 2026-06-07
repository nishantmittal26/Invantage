import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { getPermissionsFromToken } from '../utils/jwt';

interface FieldConfig {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  defaultValue?: any;
}

interface MasterManagerProps {
  title: string;
  moduleName: string; // e.g. "Products" or "Inventory" for permissions check
  endpoint: string;    // e.g. "/masters/categories"
  fields: FieldConfig[];
  columns: GridColDef[];
  idField?: string;
}

const MasterManager: React.FC<MasterManagerProps> = ({
  title,
  moduleName,
  endpoint,
  fields,
  columns,
  idField = 'id',
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const token = localStorage.getItem('token');
  const permissions = getPermissionsFromToken(token);

  // Permission Checks
  const canAdd = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === `${moduleName}:Add`.toLowerCase());
  const canEdit = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === `${moduleName}:Edit`.toLowerCase());
  const canDelete = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === `${moduleName}:Delete`.toLowerCase());

  const { control, handleSubmit, reset, setValue } = useForm();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(endpoint);
      if (response.data.succeeded) {
        setData(response.data.data);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Failed to fetch items', severity: 'error' }));
      }
    } catch (err: any) {
      console.error('Failed to load items', err);
      dispatch(showAlert({ message: 'Error loading data from server', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [endpoint]);

  const handleOpen = (itemToEdit: any = null) => {
    if (itemToEdit) {
      setEditId(itemToEdit[idField]);
      fields.forEach((field) => {
        setValue(field.name, itemToEdit[field.name]);
      });
    } else {
      setEditId(null);
      reset(
        fields.reduce((acc, f) => {
          acc[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
          return acc;
        }, {} as any)
      );
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    reset();
  };

  const onSubmit = async (formData: any) => {
    setSubmitLoading(true);
    try {
      let response;
      if (editId) {
        // Update
        response = await axiosInstance.put(endpoint, { ...formData, id: editId });
      } else {
        // Create
        response = await axiosInstance.post(endpoint, formData);
      }

      if (response.data.succeeded) {
        dispatch(showAlert({ message: `${title} saved successfully!`, severity: 'success' }));
        fetchItems();
        handleClose();
      } else {
        dispatch(showAlert({ message: response.data.message || 'Action failed', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'An error occurred.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${title.toLowerCase()}?`)) return;

    try {
      const response = await axiosInstance.delete(`${endpoint}/${id}`);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: `${title} deleted successfully!`, severity: 'success' }));
        fetchItems();
      } else {
        dispatch(showAlert({ message: response.data.message || 'Delete failed', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete item.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  };

  const actionColumn: GridColDef = {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {canEdit && (
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpen(params.row)} size="small" color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row[idField])} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
  };

  const gridColumns = [...columns];
  if (canEdit || canDelete) {
    gridColumns.push(actionColumn);
  }

  return (
    <Box className="animate-fade-in" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your master list of {title.toLowerCase()}.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchItems} color="inherit">
            <RefreshIcon />
          </IconButton>
          {canAdd && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Add {title}
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 400, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={gridColumns}
          loading={loading}
          getRowId={(row) => row[idField]}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Upsert Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? `Edit ${title}` : `Add New ${title}`}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {fields.map((field) => (
              <Controller
                key={field.name}
                name={field.name}
                control={control}
                rules={{ required: field.required ? `${field.label} is required` : false }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <TextField
                    fullWidth
                    label={field.label}
                    type={field.type || 'text'}
                    multiline={field.multiline}
                    rows={field.rows}
                    value={value || ''}
                    onChange={onChange}
                    error={!!error}
                    helperText={error?.message}
                    size="medium"
                  />
                )}
              />
            ))}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose} disabled={submitLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitLoading}
            >
              {submitLoading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MasterManager;
