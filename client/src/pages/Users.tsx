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
  Grid,
  MenuItem,
  Chip,
  Switch,
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
import { User } from '../types';

const rolesList = ['MasterAdmin', 'InventoryManager', 'StoreUser'];

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users');
      if (response.data.succeeded) {
        setUsers(response.data.data);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Failed to fetch users', severity: 'error' }));
      }
    } catch (err) {
      console.error('Failed to load users', err);
      dispatch(showAlert({ message: 'Error loading user accounts list', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpen = (itemToEdit: User | null = null) => {
    if (itemToEdit) {
      setEditId(itemToEdit.id);
      setValue('firstName', itemToEdit.firstName);
      setValue('lastName', itemToEdit.lastName);
      setValue('email', itemToEdit.email);
      setValue('role', itemToEdit.role);
      setValue('mobile', itemToEdit.mobile || '');
    } else {
      setEditId(null);
      reset({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'StoreUser',
        mobile: '',
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
        // Update user (excludes password/username change on edit)
        response = await axiosInstance.put('/users', {
          id: editId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          mobile: formData.mobile,
        });
      } else {
        // Create user
        response = await axiosInstance.post('/users', formData);
      }

      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'User account saved successfully!', severity: 'success' }));
        fetchUsers();
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

  const handleToggleStatus = async (id: string) => {
    if (id === currentUser?.token) {
      dispatch(showAlert({ message: 'Cannot deactivate your own active session!', severity: 'warning' }));
      return;
    }

    try {
      const response = await axiosInstance.post('/users/toggle-status', { id });
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'User account status toggled successfully!', severity: 'success' }));
        fetchUsers();
      } else {
        dispatch(showAlert({ message: response.data.message || 'Failed to toggle status', severity: 'error' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(showAlert({ message: 'Failed to update user status.', severity: 'error' }));
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.token) {
      dispatch(showAlert({ message: 'Cannot delete your own active account!', severity: 'warning' }));
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user account?')) return;

    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'User account deleted successfully!', severity: 'success' }));
        fetchUsers();
      } else {
        dispatch(showAlert({ message: response.data.message || 'Delete failed', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete user.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  };

  const columns: GridColDef[] = [
    { field: 'username', headerName: 'Username', width: 140, sortable: true },
    {
      field: 'name',
      headerName: 'Full Name',
      width: 180,
      valueGetter: (_value: any, row: any) => `${row.firstName} ${row.lastName}`,
    },
    { field: 'email', headerName: 'Email Address', width: 200 },
    { field: 'mobile', headerName: 'Mobile', width: 130 },
    { field: 'role', headerName: 'System Role', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        const isActive = params.value === 'Active';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              size="small"
              checked={isActive}
              onChange={() => handleToggleStatus(params.row.id)}
            />
            <Chip
              label={params.value}
              size="small"
              color={isActive ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit Profile">
            <IconButton onClick={() => handleOpen(params.row)} size="small" color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Account">
            <IconButton onClick={() => handleDelete(params.row.id)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box className="animate-fade-in" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            User Accounts
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage users, block/unblock accounts, and assign system access roles.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchUsers} color="inherit">
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Create User
          </Button>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 400, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]}
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
          {editId ? 'Edit User Profile' : 'Create System User'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid size={{xs: 6}} >
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField {...field} fullWidth label="First Name" error={!!error} helperText={error?.message} />
                  )}
                />
              </Grid>
              <Grid size={{xs: 6}} >
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField {...field} fullWidth label="Last Name" error={!!error} helperText={error?.message} />
                  )}
                />
              </Grid>
            </Grid>

            {!editId && (
              <Controller
                name="username"
                control={control}
                rules={{ required: 'Username is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField {...field} fullWidth label="Username" error={!!error} helperText={error?.message} />
                )}
              />
            )}

            <Controller
              name="email"
              control={control}
              rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} type="email" fullWidth label="Email Address" error={!!error} helperText={error?.message} />
              )}
            />

            {!editId && (
              <Controller
                name="password"
                control={control}
                rules={{ required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } }}
                render={({ field, fieldState: { error } }) => (
                  <TextField {...field} type="password" fullWidth label="Initial Password" error={!!error} helperText={error?.message} />
                )}
              />
            )}

            <Controller
              name="mobile"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Mobile Number" />
              )}
            />

            <Controller
              name="role"
              control={control}
              rules={{ required: 'Role is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} select fullWidth label="Assign System Role" error={!!error} helperText={error?.message}>
                  {rolesList.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </TextField>
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
    </Box>
  );
};

export default Users;
