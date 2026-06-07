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
  InputAdornment,
  Avatar,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
  ViewList as StockIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { getPermissionsFromToken } from '../utils/jwt';
import { Product, Category, Brand, Unit, WarehouseStock } from '../types';

const Products: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Stock dialog state
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);

  const token = localStorage.getItem('token');
  const permissions = getPermissionsFromToken(token);

  // Permissions check
  const canAdd = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === 'products:add');
  const canEdit = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === 'products:edit');
  const canDelete = user?.role === 'MasterAdmin' || permissions.some((p) => p.toLowerCase() === 'products:delete');

  const { control, handleSubmit, reset, setValue } = useForm();

  const fetchDropdowns = async () => {
    try {
      const [catRes, brandRes, unitRes] = await Promise.all([
        axiosInstance.get('/masters/categories'),
        axiosInstance.get('/masters/brands'),
        axiosInstance.get('/masters/units'),
      ]);
      
      if (catRes.data.succeeded) setCategories(catRes.data.data);
      if (brandRes.data.succeeded) setBrands(brandRes.data.data);
      if (unitRes.data.succeeded) setUnits(unitRes.data.data);
    } catch (err) {
      console.error('Failed to load dropdown masters', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/products');
      if (response.data.succeeded) {
        setProducts(response.data.data);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Failed to fetch products', severity: 'error' }));
      }
    } catch (err: any) {
      console.error('Failed to load products', err);
      dispatch(showAlert({ message: 'Error loading products list', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDropdowns();
  }, []);

  const handleOpen = (itemToEdit: Product | null = null) => {
    if (itemToEdit) {
      setEditId(itemToEdit.id);
      setValue('productCode', itemToEdit.productCode);
      setValue('sku', itemToEdit.sku);
      setValue('productName', itemToEdit.productName);
      setValue('description', itemToEdit.description);
      setValue('categoryId', itemToEdit.categoryId);
      setValue('brandId', itemToEdit.brandId);
      setValue('unitId', itemToEdit.unitId);
      setValue('reorderLevel', itemToEdit.reorderLevel);
      setValue('minimumStock', itemToEdit.minimumStock);
      setValue('maximumStock', itemToEdit.maximumStock);
      setValue('costPrice', itemToEdit.costPrice);
      setValue('sellingPrice', itemToEdit.sellingPrice);
      setValue('barcode', itemToEdit.barcode);
      setValue('imageUrl', itemToEdit.imageUrl);
      
      if (itemToEdit.imageUrl) {
        // Build full URL if relative
        const cleanUrl = itemToEdit.imageUrl.startsWith('http')
          ? itemToEdit.imageUrl
          : `https://localhost:7007${itemToEdit.imageUrl}`;
        setSelectedImage(cleanUrl);
      } else {
        setSelectedImage(null);
      }
      setImageBase64(null);
    } else {
      setEditId(null);
      reset({
        productCode: '',
        sku: '',
        productName: '',
        description: '',
        categoryId: '',
        brandId: '',
        unitId: '',
        reorderLevel: 10,
        minimumStock: 5,
        maximumStock: 500,
        costPrice: 0,
        sellingPrice: 0,
        barcode: '',
        imageUrl: '',
      });
      setSelectedImage(null);
      setImageBase64(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setSelectedImage(null);
    setImageBase64(null);
    reset();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        // Remove the data:image/jpeg;base64, prefix
        const base64Data = base64String.split(',')[1];
        setImageBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formData: any) => {
    setSubmitLoading(true);
    const payload = {
      ...formData,
      imageBase64: imageBase64 || null,
      id: editId || null,
    };

    try {
      let response;
      if (editId) {
        response = await axiosInstance.put('/products', payload);
      } else {
        response = await axiosInstance.post('/products', payload);
      }

      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Product saved successfully!', severity: 'success' }));
        fetchProducts();
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
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await axiosInstance.delete(`/products/${id}`);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Product deleted successfully!', severity: 'success' }));
        fetchProducts();
      } else {
        dispatch(showAlert({ message: response.data.message || 'Delete failed', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete product.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  };

  const handleViewStocks = async (product: Product) => {
    setSelectedProduct(product);
    setStockDialogOpen(true);
    setStocksLoading(true);
    try {
      const response = await axiosInstance.get(`/products/${product.id}/stocks`);
      if (response.data.succeeded) {
        setWarehouseStocks(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load warehouse stock details', err);
    } finally {
      setStocksLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 80,
      sortable: false,
      renderCell: (params) => {
        const url = params.value;
        const fullUrl = url
          ? (url.startsWith('http') ? url : `https://localhost:7007${url}`)
          : null;
        return <Avatar src={fullUrl || ''} variant="rounded" sx={{ width: 40, height: 40 }} />;
      },
    },
    { field: 'productCode', headerName: 'Code', width: 120, sortable: true },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'productName', headerName: 'Product Name', width: 220, sortable: true },
    { field: 'categoryName', headerName: 'Category', width: 130 },
    { field: 'brandName', headerName: 'Brand', width: 130 },
    { field: 'totalStock', headerName: 'Current Stock', width: 120, align: 'right', type: 'number' },
    { field: 'costPrice', headerName: 'Cost Price', width: 120, align: 'right', valueFormatter: (params: any) => `$${params.toFixed(2)}` },
    { field: 'sellingPrice', headerName: 'Selling Price', width: 120, align: 'right', valueFormatter: (params: any) => `$${params.toFixed(2)}` },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Warehouse Stocks">
            <IconButton onClick={() => handleViewStocks(params.row)} size="small" color="info">
              <StockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canEdit && (
            <Tooltip title="Edit">
              <IconButton onClick={() => handleOpen(params.row)} size="small" color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDelete(params.row.id)} size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box className="animate-fade-in" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Products
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your master inventory items list.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchProducts} color="inherit">
            <RefreshIcon />
          </IconButton>
          {canAdd && (
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
              Add Product
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 400, width: '100%' }}>
        <DataGrid
          rows={products}
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
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', gap: 2 }} size={{xs: 12, md: 4}} >
                <Avatar
                  src={selectedImage || ''}
                  variant="rounded"
                  sx={{ width: 160, height: 160, border: '1px solid rgba(0,0,0,0.1)' }}
                />
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<UploadIcon />}
                >
                  Upload Image
                  <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Button>
              </Grid>

              <Grid size={{xs: 12, md: 8}} >
                <Grid container spacing={2}>
                  <Grid size={{xs: 6}} >
                    <Controller
                      name="productCode"
                      control={control}
                      rules={{ required: 'Product Code is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} fullWidth label="Product Code" error={!!error} helperText={error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 6}} >
                    <Controller
                      name="sku"
                      control={control}
                      rules={{ required: 'SKU is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} fullWidth label="SKU" error={!!error} helperText={error?.message} />
                      )}
                    />
                  </Grid>

                  <Grid size={{xs: 12}} >
                    <Controller
                      name="productName"
                      control={control}
                      rules={{ required: 'Product Name is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} fullWidth label="Product Name" error={!!error} helperText={error?.message} />
                      )}
                    />
                  </Grid>

                  <Grid size={{xs: 4}} >
                    <Controller
                      name="categoryId"
                      control={control}
                      rules={{ required: 'Category is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} select fullWidth label="Category" error={!!error} helperText={error?.message}>
                          {categories.map((c) => (
                            <MenuItem key={c.id} value={c.id}>{c.categoryName}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 4}} >
                    <Controller
                      name="brandId"
                      control={control}
                      rules={{ required: 'Brand is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} select fullWidth label="Brand" error={!!error} helperText={error?.message}>
                          {brands.map((b) => (
                            <MenuItem key={b.id} value={b.id}>{b.brandName}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 4}} >
                    <Controller
                      name="unitId"
                      control={control}
                      rules={{ required: 'Unit is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} select fullWidth label="Unit" error={!!error} helperText={error?.message}>
                          {units.map((u) => (
                            <MenuItem key={u.id} value={u.id}>{u.unitName}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid size={{xs: 4}} >
                    <Controller
                      name="costPrice"
                      control={control}
                      rules={{ required: 'Cost Price is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Cost Price"
                          type="number"
                          error={!!error}
                          helperText={error?.message}
                          slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 4}} >
                    <Controller
                      name="sellingPrice"
                      control={control}
                      rules={{ required: 'Selling Price is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Selling Price"
                          type="number"
                          error={!!error}
                          helperText={error?.message}
                          slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 4}} >
                    <Controller
                      name="barcode"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Barcode" />
                      )}
                    />
                  </Grid>

                  <Grid size={{xs: 4}} >
                    <Controller
                      name="reorderLevel"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Reorder Level" type="number" />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 4}} >
                    <Controller
                      name="minimumStock"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Minimum Stock" type="number" />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 4}} >
                    <Controller
                      name="maximumStock"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Maximum Stock" type="number" />
                      )}
                    />
                  </Grid>

                  <Grid size={{xs: 12}} >
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Description" multiline rows={3} />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
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

      {/* Stock level display dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Warehouse Stock Levels - {selectedProduct?.productName}
        </DialogTitle>
        <DialogContent>
          {stocksLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {warehouseStocks.length === 0 ? (
                <Grid size={{xs: 12}} >
                  <Typography color="textSecondary" align="center">
                    No active stock levels found for this product.
                  </Typography>
                </Grid>
              ) : (
                warehouseStocks.map((stock) => (
                  <Grid key={stock.id} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', py: 1.5 }} size={{xs: 12}} >
                    <Typography sx={{ fontWeight: 500 }}>{stock.warehouseName}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{stock.currentStock}</Typography>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
