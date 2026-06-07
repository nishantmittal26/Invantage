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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { Role } from '../types';

const Roles: React.FC = () => {
  const dispatch = useAppDispatch();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Permission Matrix state
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionsList, setPermissionsList] = useState<any[]>([]);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixSaving, setMatrixSaving] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/roles');
      if (response.data.succeeded) {
        setRoles(response.data.data);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Failed to fetch roles', severity: 'error' }));
      }
    } catch (err) {
      console.error('Failed to load roles', err);
      dispatch(showAlert({ message: 'Error loading system roles', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpen = (itemToEdit: Role | null = null) => {
    if (itemToEdit) {
      setEditId(itemToEdit.id);
      setValue('name', itemToEdit.name);
      setValue('description', itemToEdit.description || '');
    } else {
      setEditId(null);
      reset({
        name: '',
        description: '',
      });
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
        response = await axiosInstance.put('/roles', { ...formData, id: editId });
      } else {
        response = await axiosInstance.post('/roles', formData);
      }

      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Role saved successfully!', severity: 'success' }));
        fetchRoles();
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
    const roleToDelete = roles.find((r) => r.id === id);
    if (roleToDelete?.name === 'MasterAdmin' || roleToDelete?.name === 'StoreUser') {
      dispatch(showAlert({ message: 'Default system roles cannot be deleted!', severity: 'warning' }));
      return;
    }

    if (!window.confirm('Are you sure you want to delete this role? This will unassign all users mapped to it.')) return;

    try {
      const response = await axiosInstance.delete(`/roles/${id}`);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Role deleted successfully!', severity: 'success' }));
        fetchRoles();
      } else {
        dispatch(showAlert({ message: response.data.message || 'Delete failed', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete role.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  };

  const handleOpenMatrix = async (role: Role) => {
    setSelectedRole(role);
    setMatrixOpen(true);
    setMatrixLoading(true);
    try {
      const response = await axiosInstance.get(`/roles/${role.id}/permissions`);
      if (response.data.succeeded) {
        setPermissionsList(response.data.data);
      } else {
        dispatch(showAlert({ message: 'Failed to fetch permissions matrix.', severity: 'error' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(showAlert({ message: 'Failed to fetch permissions matrix.', severity: 'error' }));
    } finally {
      setMatrixLoading(false);
    }
  };

  const handleCheckboxChange = (index: number, action: 'view' | 'add' | 'edit' | 'delete', checked: boolean) => {
    const updated = [...permissionsList];
    updated[index] = {
      ...updated[index],
      [action]: checked,
    };
    setPermissionsList(updated);
  };

  const handleSaveMatrix = async () => {
    if (!selectedRole) return;
    setMatrixSaving(true);
    try {
      const response = await axiosInstance.put(`/roles/${selectedRole.id}/permissions`, permissionsList);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Permissions updated successfully! Please re-login to refresh your session.', severity: 'success' }));
        setMatrixOpen(false);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Failed to update permissions', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'An error occurred while saving.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    } finally {
      setMatrixSaving(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Role Name', width: 180, sortable: true },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const isDefault = params.row.name === 'MasterAdmin' || params.row.name === 'StoreUser';
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Configure Permission Matrix">
              <IconButton onClick={() => handleOpenMatrix(params.row)} size="small" color="success" disabled={params.row.name === 'MasterAdmin'}>
                <SecurityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Role Profile">
              <IconButton onClick={() => handleOpen(params.row)} size="small" color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Role">
              <IconButton onClick={() => handleDelete(params.row.id)} size="small" color="error" disabled={isDefault}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box className="animate-fade-in" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Roles & Permissions
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Assign module-level CRUD capability (View, Add, Edit, Delete) to roles.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchRoles} color="inherit">
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Create Role
          </Button>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 400, width: '100%' }}>
        <DataGrid
          rows={roles}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 20]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? 'Edit Role Details' : 'Create Custom Role'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Role Name is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} fullWidth label="Role Name" error={!!error} helperText={error?.message} />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Description" multiline rows={3} />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitLoading}>
              {submitLoading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Permissions Matrix Dialog */}
      <Dialog open={matrixOpen} onClose={() => setMatrixOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Permissions Matrix: {selectedRole?.name}
        </DialogTitle>
        <DialogContent dividers>
          {matrixLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Module Name</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>View</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Add</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Edit</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissionsList.map((row, idx) => (
                    <TableRow key={row.permissionId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.module || row.permissionName}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={row.view}
                          onChange={(e) => handleCheckboxChange(idx, 'view', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={row.add}
                          onChange={(e) => handleCheckboxChange(idx, 'add', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={row.edit}
                          onChange={(e) => handleCheckboxChange(idx, 'edit', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={row.delete}
                          onChange={(e) => handleCheckboxChange(idx, 'delete', e.target.checked)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMatrixOpen(false)} disabled={matrixSaving}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveMatrix} disabled={matrixSaving}>
            {matrixSaving ? <CircularProgress size={24} color="inherit" /> : 'Save Matrix'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Roles;
