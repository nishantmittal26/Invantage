import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { Category, Warehouse } from '../types';

type ReportType = 'stock' | 'movement' | 'valuation' | 'supplier-purchases';

const Reports: React.FC = () => {
  const dispatch = useAppDispatch();

  const [reportType, setReportType] = useState<ReportType>('stock');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Masters for filters
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Filter values
  const [categoryId, setCategoryId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchDropdowns = async () => {
    try {
      const [catRes, whRes] = await Promise.all([
        axiosInstance.get('/masters/categories'),
        axiosInstance.get('/masters/warehouses'),
      ]);
      if (catRes.data.succeeded) setCategories(catRes.data.data);
      if (whRes.data.succeeded) setWarehouses(whRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    let url = `/reports/${reportType}`;
    const params: any = {};

    if (reportType === 'stock') {
      if (categoryId) params.categoryId = categoryId;
      if (warehouseId) params.warehouseId = warehouseId;
    } else if (reportType === 'movement') {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    }

    try {
      const response = await axiosInstance.get(url, { params });
      if (response.data.succeeded) {
        // Add fake ID if not present (required by DataGrid)
        const formatted = response.data.data.map((item: any, idx: number) => ({
          ...item,
          id: item.productId || item.supplierId || item.id || `row-${idx}`,
        }));
        setData(formatted);
      } else {
        dispatch(showAlert({ message: response.data.message || 'Report retrieval failed', severity: 'error' }));
      }
    } catch (err) {
      console.error('Failed to retrieve report data', err);
      dispatch(showAlert({ message: 'Error fetching report details', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [reportType, categoryId, warehouseId, startDate, endDate]);

  const handleExport = () => {
    // Generate CSV mockup
    if (data.length === 0) {
      dispatch(showAlert({ message: 'No data to export.', severity: 'warning' }));
      return;
    }

    const headers = Object.keys(data[0]).filter(k => k !== 'id');
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    dispatch(showAlert({ message: 'CSV file download initiated successfully!', severity: 'success' }));
  };

  // Define dynamic columns based on Report Type
  const getColumns = (): GridColDef[] => {
    switch (reportType) {
      case 'stock':
        return [
          { field: 'productCode', headerName: 'Code', width: 120 },
          { field: 'productName', headerName: 'Product Name', width: 200 },
          { field: 'categoryName', headerName: 'Category', width: 130 },
          { field: 'brandName', headerName: 'Brand', width: 130 },
          { field: 'warehouseName', headerName: 'Warehouse', width: 160 },
          { field: 'currentStock', headerName: 'Current Stock', type: 'number', width: 120 },
          { field: 'costPrice', headerName: 'Cost Rate', type: 'number', width: 120, valueFormatter: (p: any) => `$${p.toFixed(2)}` },
          { field: 'totalCostValue', headerName: 'Cost Value', type: 'number', width: 130, valueFormatter: (p: any) => `$${p.toFixed(2)}` },
          { field: 'sellingPrice', headerName: 'Retail Rate', type: 'number', width: 120, valueFormatter: (p: any) => `$${p.toFixed(2)}` },
          { field: 'totalSellingValue', headerName: 'Retail Value', type: 'number', width: 130, valueFormatter: (p: any) => `$${p.toFixed(2)}` },
        ];
      case 'movement':
        return [
          { field: 'productCode', headerName: 'Code', width: 120 },
          { field: 'productName', headerName: 'Product Name', width: 220 },
          { field: 'warehouseName', headerName: 'Warehouse', width: 180 },
          { field: 'openingStock', headerName: 'Opening Stock', type: 'number', width: 130 },
          {
            field: 'stockInQuantity',
            headerName: 'Stock In (+)',
            type: 'number',
            width: 130,
            renderCell: (p) => <Typography sx={{ color: 'success.main', fontWeight: 600 }}>{p.value}</Typography>
          },
          {
            field: 'stockOutQuantity',
            headerName: 'Stock Out (-)',
            type: 'number',
            width: 130,
            renderCell: (p) => <Typography sx={{ color: 'warning.main', fontWeight: 600 }}>{p.value}</Typography>
          },
          {
            field: 'adjustmentQuantity',
            headerName: 'Adjusted',
            type: 'number',
            width: 130,
            renderCell: (p) => {
              const val = p.value as number;
              const color = val >= 0 ? 'success.main' : 'error.main';
              const sign = val > 0 ? '+' : '';
              return <Typography sx={{ color, fontWeight: 500 }}>{sign}{val}</Typography>;
            }
          },
          { field: 'closingStock', headerName: 'Closing Stock', type: 'number', width: 130, renderCell: (p) => <strong>{p.value}</strong> },
        ];
      case 'valuation':
        return [
          { field: 'productCode', headerName: 'Code', width: 120 },
          { field: 'productName', headerName: 'Product Name', width: 220 },
          { field: 'categoryName', headerName: 'Category', width: 140 },
          { field: 'warehouseName', headerName: 'Warehouse', width: 180 },
          { field: 'currentStock', headerName: 'Qty On Hand', type: 'number', width: 130 },
          { field: 'costPrice', headerName: 'Cost Rate', type: 'number', width: 130, valueFormatter: (p: any) => `$${p.toFixed(2)}` },
          { field: 'totalCostValue', headerName: 'Asset Value (Cost)', type: 'number', width: 160, renderCell: (p) => <strong>{p.value !== undefined ? `$${Number(p.value).toFixed(2)}` : ''}</strong> },
        ];
      case 'supplier-purchases':
        return [
          { field: 'supplierName', headerName: 'Supplier Name', width: 240, sortable: true },
          { field: 'totalOrdersCount', headerName: 'PO Quantity', type: 'number', width: 160, sortable: true },
          { field: 'totalItemsPurchased', headerName: 'Units Ordered', type: 'number', width: 180, sortable: true },
          { field: 'totalPurchaseAmount', headerName: 'Total Purchased', type: 'number', width: 180, sortable: true, renderCell: (p) => <strong>{p.value !== undefined ? `$${Number(p.value).toFixed(2)}` : ''}</strong> },
        ];
      default:
        return [];
    }
  };

  return (
    <Box className="animate-fade-in" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Reports Center
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Analyze stock balances, valuation details, and transactional movements.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="primary" startIcon={<ExportIcon />} onClick={handleExport} disabled={loading || data.length === 0}>
            Export CSV
          </Button>
          <IconButton onClick={fetchReportData} color="inherit">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Filter Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{xs: 12, sm: 3}} >
              <TextField
                select
                fullWidth
                label="Report Type"
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value as ReportType);
                  setData([]);
                }}
              >
                <MenuItem value="stock">Current Stock Report</MenuItem>
                <MenuItem value="movement">Stock Movement Report</MenuItem>
                <MenuItem value="valuation">Inventory Valuation</MenuItem>
                <MenuItem value="supplier-purchases">Supplier Purchase Activity</MenuItem>
              </TextField>
            </Grid>

            {/* Render filters dynamically based on report type */}
            {reportType === 'stock' && (
              <>
                <Grid size={{xs: 12, sm: 3.5}} >
                  <TextField
                    select
                    fullWidth
                    label="Category (Filter)"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <MenuItem value="">-- All Categories --</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.categoryName}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{xs: 12, sm: 3.5}} >
                  <TextField
                    select
                    fullWidth
                    label="Warehouse (Filter)"
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                  >
                    <MenuItem value="">-- All Warehouses --</MenuItem>
                    {warehouses.map((w) => (
                      <MenuItem key={w.id} value={w.id}>{w.warehouseName}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}

            {reportType === 'movement' && (
              <>
                <Grid size={{xs: 12, sm: 3.5}} >
                  <TextField
                    type="date"
                    fullWidth
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{xs: 12, sm: 3.5}} >
                  <TextField
                    type="date"
                    fullWidth
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
              </>
            )}

            {(reportType === 'valuation' || reportType === 'supplier-purchases') && (
              <Grid size={{xs: 12, sm: 7}} >
                <Typography color="textSecondary" variant="body2">
                  * Dynamic report metrics calculated automatically across all master modules.
                </Typography>
              </Grid>
            )}

            <Grid size={{xs: 12, sm: 2}} >
              <Button variant="contained" fullWidth onClick={fetchReportData} disabled={loading}>
                Generate
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Grid Results */}
      <Box sx={{ flexGrow: 1, minHeight: 400, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={getColumns()}
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
    </Box>
  );
};

export default Reports;
