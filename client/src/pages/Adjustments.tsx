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
  CircularProgress,
  MenuItem,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { getPermissionsFromToken } from '../utils/jwt';
import { Adjustment, Warehouse, Product, AdjustmentReason } from '../types';

const reasonOptions = [
  { value: AdjustmentReason.StockCountingDifference, label: 'Stock Counting Difference' },
  { value: AdjustmentReason.DamagedGoods, label: 'Damaged Goods' },
  { value: AdjustmentReason.TheftOrLoss, label: 'Theft or Loss' },
  { value: AdjustmentReason.ExpiredItems, label: 'Expired Items' },
  { value: AdjustmentReason.Other, label: 'Other' },
];

const Adjustments: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [currentQty, setCurrentQty] = useState<number | null>(null);
  const [fetchingStock, setFetchingStock] = useState(false);

  const token = localStorage.getItem('token');
  const permissions = getPermissionsFromToken(token);

  // Permission Checks
  const canAdd = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === 'inventory:add');

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      productId: '',
      warehouseId: '',
      adjustQuantity: 0,
      reason: AdjustmentReason.StockCountingDifference,
      remarks: '',
    },
  });

  const watchedProductId = watch('productId');
  const watchedWarehouseId = watch('warehouseId');

  useEffect(() => {
    const fetchStock = async () => {
      if (watchedProductId && watchedWarehouseId) {
        setFetchingStock(true);
        try {
          const res = await axiosInstance.get(`/products/${watchedProductId}/stocks`);
          if (res.data.succeeded) {
            const list = res.data.data;
            const item = list.find((ws: any) => ws.warehouseId === watchedWarehouseId);
            setCurrentQty(item ? item.currentStock : 0);
          }
        } catch (err) {
          console.error(err);
          setCurrentQty(0);
        } finally {
          setFetchingStock(false);
        }
      } else {
        setCurrentQty(null);
      }
    };
    fetchStock();
  }, [watchedProductId, watchedWarehouseId]);

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

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/transactions/adjustments');
      if (response.data.succeeded) {
        setAdjustments(response.data.data);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Failed to fetch adjustments', severity: 'error' }));
      }
    } catch (err) {
      console.error('Failed to load adjustments', err);
      dispatch(showAlert({ message: 'Error loading inventory adjustments', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
    fetchDropdowns();
  }, []);

  const handleOpen = () => {
    reset({
      productId: '',
      warehouseId: '',
      adjustQuantity: 0,
      reason: AdjustmentReason.StockCountingDifference,
      remarks: '',
    });
    setCurrentQty(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = async (formData: any) => {
    // Check if adjustment makes stock negative
    if (currentQty !== null && currentQty + Number(formData.adjustQuantity) < 0) {
      dispatch(showAlert({ message: 'Cannot adjust stock below zero.', severity: 'error' }));
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await axiosInstance.post('/transactions/adjustments', {
        ...formData,
        adjustQuantity: Number(formData.adjustQuantity),
      });

      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Stock adjusted and updated successfully!', severity: 'success' }));
        fetchAdjustments();
        handleClose();
      } else {
        dispatch(showAlert({ message: response.data.message || 'Adjustment failed', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'An error occurred.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 160,
      valueFormatter: (params: any) => new Date(params).toLocaleString(),
    },
    { field: 'productCode', headerName: 'Product Code', width: 120 },
    { field: 'productName', headerName: 'Product Name', width: 200 },
    { field: 'warehouseName', headerName: 'Warehouse', width: 160 },
    { field: 'currentStock', headerName: 'Stock Before', width: 120, align: 'right', type: 'number' },
    {
      field: 'adjustQuantity',
      headerName: 'Adjusted Qty',
      width: 120,
      align: 'right',
      type: 'number',
      renderCell: (params) => {
        const val = params.value as number;
        const color = val > 0 ? 'success' : 'error';
        const prefix = val > 0 ? '+' : '';
        return <Chip label={`${prefix}${val}`} size="small" color={color} variant="outlined" />;
      },
    },
    {
      field: 'reason',
      headerName: 'Reason',
      width: 180,
      valueGetter: (params: any) => {
        const opt = reasonOptions.find((o) => o.value === params);
        return opt ? opt.label : 'Unknown';
      },
    },
    { field: 'remarks', headerName: 'Remarks / Explanation', flex: 1 },
  ];

  return (
    <Box className="animate-fade-in" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Inventory Adjustments
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Record physical stock count variations, damaged goods, or write-offs.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchAdjustments} color="inherit">
            <RefreshIcon />
          </IconButton>
          {canAdd && (
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
              New Adjustment
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 400, width: '100%' }}>
        <DataGrid
          rows={adjustments}
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

      {/* Record Adjustment Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Inventory Adjustment</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Controller
              name="productId"
              control={control}
              rules={{ required: 'Product is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} select fullWidth label="Product" error={!!error} helperText={error?.message}>
                  {products.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.productName} ({p.productCode})</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="warehouseId"
              control={control}
              rules={{ required: 'Warehouse is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} select fullWidth label="Warehouse" error={!!error} helperText={error?.message}>
                  {warehouses.map((w) => (
                    <MenuItem key={w.id} value={w.id}>{w.warehouseName}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Current Stock Level Helper */}
            {watchedProductId && watchedWarehouseId && (
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">Current Warehouse Stock:</Typography>
                {fetchingStock ? (
                  <CircularProgress size={16} />
                ) : (
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {currentQty !== null ? `${currentQty} items` : '0 items'}
                  </Typography>
                )}
              </Box>
            )}

            <Controller
              name="adjustQuantity"
              control={control}
              rules={{
                required: 'Adjust Quantity is required',
                validate: (v) => Number(v) !== 0 || 'Cannot adjust by 0',
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Adjustment Quantity"
                  error={!!error}
                  helperText={error ? error.message : 'Enter positive for addition, negative for deduction (e.g. -5)'}
                />
              )}
            />

            <Controller
              name="reason"
              control={control}
              rules={{ required: 'Reason is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} select fullWidth label="Reason Category" error={!!error} helperText={error?.message}>
                  {reasonOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="remarks"
              control={control}
              rules={{ required: 'Remarks are required to document the correction details' }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} fullWidth label="Remarks / Explanation" multiline rows={3} error={!!error} helperText={error?.message} />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitLoading}>
              {submitLoading ? <CircularProgress size={24} color="inherit" /> : 'Adjust Balances'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Adjustments;
