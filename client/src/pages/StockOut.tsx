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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Check as ApproveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { getPermissionsFromToken } from '../utils/jwt';
import { StockOutHeader, Warehouse, Product } from '../types';

const StockOut: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [transactions, setTransactions] = useState<StockOutHeader[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<StockOutHeader | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('token');
  const permissions = getPermissionsFromToken(token);

  // Permission Checks
  const canAdd = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === 'inventory:add');
  const canApprove = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === 'inventory:edit');

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      warehouseId: '',
      departmentOrUser: '',
      details: [{ productId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  const fetchDropdowns = async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        axiosInstance.get('/masters/warehouses'),
        axiosInstance.get('/products'),
      ]);
      if (whRes.data.succeeded) setWarehouses(whRes.data.data);
      if (prodRes.data.succeeded) setProducts(prodRes.data.data);
    } catch (err) {
      console.error('Failed to load dropdown masters', err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/transactions/stockout');
      if (response.data.succeeded) {
        setTransactions(response.data.data);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Failed to fetch Stock Outs', severity: 'error' }));
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
      dispatch(showAlert({ message: 'Error loading Stock Out transactions', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchDropdowns();
  }, []);

  const handleOpen = () => {
    reset({
      warehouseId: '',
      departmentOrUser: '',
      details: [{ productId: '', quantity: 1 }],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleViewDetails = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await axiosInstance.get(`/transactions/stockout/${id}`);
      if (response.data.succeeded) {
        setSelectedTx(response.data.data);
        setDetailOpen(true);
      }
    } catch (err) {
      console.error('Failed to load detail', err);
      dispatch(showAlert({ message: 'Error loading details', severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const onSubmit = async (formData: any) => {
    setSubmitLoading(true);
    try {
      const response = await axiosInstance.post('/transactions/stockout', formData);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Stock Out transaction saved as Draft!', severity: 'success' }));
        fetchTransactions();
        handleClose();
      } else {
        dispatch(showAlert({ message: response.data.message || 'Create failed', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'An error occurred.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this Stock Out? This will deduct from warehouse inventory balances immediately.')) return;
    
    setActionLoading(true);
    try {
      const response = await axiosInstance.post(`/transactions/stockout/${id}/approve`);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Stock Out approved and inventory updated successfully!', severity: 'success' }));
        fetchTransactions();
        setDetailOpen(false);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Approval failed', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to approve.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'transactionNo', headerName: 'Transaction No', width: 180, sortable: true },
    {
      field: 'date',
      headerName: 'Date',
      width: 160,
      valueFormatter: (params: any) => new Date(params).toLocaleString(),
    },
    { field: 'warehouseName', headerName: 'Warehouse', width: 180 },
    { field: 'departmentOrUser', headerName: 'Depart / Issued To', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const isApp = params.value === 'Approved';
        return <Chip label={params.value} size="small" color={isApp ? 'success' : 'default'} />;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton onClick={() => handleViewDetails(params.row.id)} size="small" color="primary">
            <ViewIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box className="animate-fade-in" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Stock Out Transactions
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Record items issued or sold out from warehouses.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchTransactions} color="inherit">
            <RefreshIcon />
          </IconButton>
          {canAdd && (
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
              Issue Stock Out
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 400, width: '100%' }}>
        <DataGrid
          rows={transactions}
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

      {/* Record Stock Out Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Stock Out / Issue Items</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{xs: 6}} >
                <Controller
                  name="warehouseId"
                  control={control}
                  rules={{ required: 'Warehouse is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField {...field} select fullWidth label="Source Warehouse" error={!!error} helperText={error?.message}>
                      {warehouses.map((w) => (
                        <MenuItem key={w.id} value={w.id}>{w.warehouseName}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{xs: 6}} >
                <Controller
                  name="departmentOrUser"
                  control={control}
                  rules={{ required: 'Department or User is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField {...field} fullWidth label="Department or Issued To" error={!!error} helperText={error?.message} />
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Transaction Items
            </Typography>

            {fields.map((field, idx) => (
              <Box key={field.id} sx={{ mb: 2.5, p: 2, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size={{xs: 12, sm: 7}} >
                    <Controller
                      name={`details.${idx}.productId` as any}
                      control={control}
                      rules={{ required: 'Product is required' }}
                      render={({ field: selectField, fieldState: { error } }) => (
                        <TextField {...selectField} select fullWidth label="Select Product" error={!!error} helperText={error?.message}>
                          {products.map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.productName} ({p.productCode})</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 10, sm: 4}} >
                    <Controller
                      name={`details.${idx}.quantity` as any}
                      control={control}
                      rules={{ required: 'Required', min: { value: 1, message: 'Min 1' } }}
                      render={({ field: qtyField, fieldState: { error } }) => (
                        <TextField {...qtyField} type="number" fullWidth label="Quantity" error={!!error} helperText={error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 2, sm: 1}} >
                    <IconButton color="error" onClick={() => remove(idx)} disabled={fields.length === 1}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button variant="outlined" color="primary" onClick={() => append({ productId: '', quantity: 1 })} sx={{ mt: 1 }}>
              Add Product Line
            </Button>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitLoading}>
              {submitLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Draft'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Detail view dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Stock Out: {selectedTx?.transactionNo}</span>
          <Chip label={selectedTx?.status} color={selectedTx?.status === 'Approved' ? 'success' : 'default'} />
        </DialogTitle>
        <DialogContent dividers>
          {selectedTx && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{xs: 6}} >
                  <Typography variant="subtitle2" color="textSecondary">Source Warehouse</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedTx.warehouseName}</Typography>
                </Grid>
                <Grid size={{xs: 6}} >
                  <Typography variant="subtitle2" color="textSecondary">Issued / Department</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedTx.departmentOrUser}</Typography>
                </Grid>
                <Grid size={{xs: 6}} >
                  <Typography variant="subtitle2" color="textSecondary">Created Date</Typography>
                  <Typography variant="body1">{new Date(selectedTx.date).toLocaleString()}</Typography>
                </Grid>
                {selectedTx.status === 'Approved' && (
                  <Grid size={{xs: 6}} >
                    <Typography variant="subtitle2" color="textSecondary">Approved By / Date</Typography>
                    <Typography variant="body1">{selectedTx.approvedBy} on {new Date(selectedTx.approvedDate!).toLocaleString()}</Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Items Issued</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Code</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">Qty Issued</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTx.details.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productCode}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          {selectedTx?.status === 'Draft' && canApprove && (
            <Button
              variant="contained"
              color="success"
              startIcon={<ApproveIcon />}
              onClick={() => handleApprove(selectedTx.id)}
              disabled={actionLoading}
            >
              Approve & Deduct Stock
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockOut;
