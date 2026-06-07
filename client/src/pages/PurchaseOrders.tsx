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
  Close as RejectIcon,
  LocalMall as ReceiveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { getPermissionsFromToken } from '../utils/jwt';
import { PurchaseOrder, Supplier, Warehouse, Product } from '../types';

const PurchaseOrders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('token');
  const permissions = getPermissionsFromToken(token);

  // Permission Checks
  const canAdd = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === 'inventory:add');
  const canApprove = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === 'inventory:edit');

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      supplierId: '',
      warehouseId: '',
      details: [{ productId: '', quantity: 1, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  const fetchDropdowns = async () => {
    try {
      const [supRes, whRes, prodRes] = await Promise.all([
        axiosInstance.get('/masters/suppliers'),
        axiosInstance.get('/masters/warehouses'),
        axiosInstance.get('/products'),
      ]);
      if (supRes.data.succeeded) setSuppliers(supRes.data.data);
      if (whRes.data.succeeded) setWarehouses(whRes.data.data);
      if (prodRes.data.succeeded) setProducts(prodRes.data.data);
    } catch (err) {
      console.error('Failed to load dropdown masters', err);
    }
  };

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/purchaseorders');
      if (response.data.succeeded) {
        setPurchaseOrders(response.data.data);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Failed to fetch POs', severity: 'error' }));
      }
    } catch (err) {
      console.error('Failed to load POs', err);
      dispatch(showAlert({ message: 'Error loading Purchase Orders', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    fetchDropdowns();
  }, []);

  const handleOpen = () => {
    reset({
      supplierId: '',
      warehouseId: '',
      details: [{ productId: '', quantity: 1, rate: 0 }],
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
      const response = await axiosInstance.get(`/purchaseorders/${id}`);
      if (response.data.succeeded) {
        setSelectedPo(response.data.data);
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
      const response = await axiosInstance.post('/purchaseorders', formData);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Purchase Order draft created successfully!', severity: 'success' }));
        fetchPurchaseOrders();
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
    if (!window.confirm('Are you sure you want to approve this Purchase Order?')) return;
    
    setActionLoading(true);
    try {
      const response = await axiosInstance.post(`/purchaseorders/${id}/approve`);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Purchase Order approved successfully!', severity: 'success' }));
        fetchPurchaseOrders();
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

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this Purchase Order request?')) return;
    
    setActionLoading(true);
    try {
      const response = await axiosInstance.post(`/purchaseorders/${id}/reject`);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Purchase Order request rejected.', severity: 'info' }));
        fetchPurchaseOrders();
        setDetailOpen(false);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Rejection failed', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to reject.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceive = async (id: string) => {
    if (!window.confirm('Are you sure you want to mark this PO as Received? This will automatically generate a Stock In receipt and add items to warehouse inventory.')) return;
    
    setActionLoading(true);
    try {
      const response = await axiosInstance.post(`/purchaseorders/${id}/receive`);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Purchase Order received and inventory updated!', severity: 'success' }));
        fetchPurchaseOrders();
        setDetailOpen(false);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Receive failed', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to receive.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const calculateTotal = (po: PurchaseOrder | null) => {
    if (!po) return 0;
    return po.details.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const columns: GridColDef[] = [
    { field: 'poNumber', headerName: 'PO Number', width: 150, sortable: true },
    {
      field: 'date',
      headerName: 'Date Created',
      width: 160,
      valueFormatter: (params: any) => new Date(params).toLocaleString(),
    },
    { field: 'supplierName', headerName: 'Supplier', width: 200 },
    { field: 'warehouseName', headerName: 'Target Warehouse', width: 180 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        let color: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default';
        if (params.value === 'Approved') color = 'info';
        if (params.value === 'Received') color = 'success';
        if (params.value === 'Rejected') color = 'error';
        return <Chip label={params.value} size="small" color={color} />;
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
            Purchase Orders
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage purchasing workflows, approvals, and inventory receiving.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchPurchaseOrders} color="inherit">
            <RefreshIcon />
          </IconButton>
          {canAdd && (
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
              Create Purchase Order
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 400, width: '100%' }}>
        <DataGrid
          rows={purchaseOrders}
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

      {/* Request PO Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Draft Purchase Order</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{xs: 6}} >
                <Controller
                  name="supplierId"
                  control={control}
                  rules={{ required: 'Supplier is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField {...field} select fullWidth label="Supplier" error={!!error} helperText={error?.message}>
                      {suppliers.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.supplierName}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{xs: 6}} >
                <Controller
                  name="warehouseId"
                  control={control}
                  rules={{ required: 'Warehouse is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField {...field} select fullWidth label="Receive Warehouse" error={!!error} helperText={error?.message}>
                      {warehouses.map((w) => (
                        <MenuItem key={w.id} value={w.id}>{w.warehouseName}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Order Details
            </Typography>

            {fields.map((field, idx) => (
              <Box key={field.id} sx={{ mb: 2.5, p: 2, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size={{xs: 12, sm: 5}} >
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
                  <Grid size={{xs: 6, sm: 3}} >
                    <Controller
                      name={`details.${idx}.quantity` as any}
                      control={control}
                      rules={{ required: 'Required', min: { value: 1, message: 'Min 1' } }}
                      render={({ field: qtyField, fieldState: { error } }) => (
                        <TextField {...qtyField} type="number" fullWidth label="Quantity" error={!!error} helperText={error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 6, sm: 3}} >
                    <Controller
                      name={`details.${idx}.rate` as any}
                      control={control}
                      rules={{ required: 'Required', min: { value: 0, message: 'Min 0' } }}
                      render={({ field: rateField, fieldState: { error } }) => (
                        <TextField {...rateField} type="number" fullWidth label="Unit Rate ($)" error={!!error} helperText={error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 1}} >
                    <IconButton color="error" onClick={() => remove(idx)} disabled={fields.length === 1}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button variant="outlined" color="primary" onClick={() => append({ productId: '', quantity: 1, rate: 0 })} sx={{ mt: 1 }}>
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
          <span>Purchase Order: {selectedPo?.poNumber}</span>
          <Chip
            label={selectedPo?.status}
            color={
              selectedPo?.status === 'Received'
                ? 'success'
                : selectedPo?.status === 'Approved'
                ? 'info'
                : selectedPo?.status === 'Rejected'
                ? 'error'
                : 'default'
            }
          />
        </DialogTitle>
        <DialogContent dividers>
          {selectedPo && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{xs: 6}} >
                  <Typography variant="subtitle2" color="textSecondary">Supplier</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedPo.supplierName}</Typography>
                </Grid>
                <Grid size={{xs: 6}} >
                  <Typography variant="subtitle2" color="textSecondary">Target Warehouse</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedPo.warehouseName}</Typography>
                </Grid>
                <Grid size={{xs: 6}} >
                  <Typography variant="subtitle2" color="textSecondary">Order Date</Typography>
                  <Typography variant="body1">{new Date(selectedPo.date).toLocaleString()}</Typography>
                </Grid>
                <Grid size={{xs: 6}} >
                  <Typography variant="subtitle2" color="textSecondary">Order Value Total</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    ${calculateTotal(selectedPo).toFixed(2)}
                  </Typography>
                </Grid>
                {selectedPo.approvedBy && (
                  <Grid size={{xs: 6}} >
                    <Typography variant="subtitle2" color="textSecondary">Approved By / Date</Typography>
                    <Typography variant="body1">{selectedPo.approvedBy} on {new Date(selectedPo.approvedDate!).toLocaleString()}</Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Items Ordered</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Code</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">Qty Ordered</TableCell>
                      <TableCell align="right">Unit Rate</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPo.details.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productCode}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{item.quantity}</TableCell>
                        <TableCell align="right">${item.rate.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${(item.quantity * item.rate).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 700 }}>Total Value</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ${calculateTotal(selectedPo).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          
          {selectedPo?.status === 'Draft' && canApprove && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => handleReject(selectedPo.id)}
                disabled={actionLoading}
              >
                Reject Order
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => handleApprove(selectedPo.id)}
                disabled={actionLoading}
              >
                Approve Order
              </Button>
            </Box>
          )}

          {selectedPo?.status === 'Approved' && canApprove && (
            <Button
              variant="contained"
              color="success"
              startIcon={<ReceiveIcon />}
              onClick={() => handleReceive(selectedPo.id)}
              disabled={actionLoading}
            >
              Mark Received & Stock In
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrders;
