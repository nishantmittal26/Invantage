import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Inventory as ProductIcon,
  WarningAmber as WarningIcon,
  Store as WarehouseIcon,
  Input as StockInIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAppDispatch } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { useTheme } from '@mui/material/styles';

interface DashboardData {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalWarehouses: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  todayStockInQty: number;
  todayStockOutQty: number;
  lowStockAlerts: Array<{
    productId: string;
    productCode: string;
    productName: string;
    currentStock: number;
    reorderLevel: number;
    warehouseName: string;
  }>;
  expiryAlerts: Array<{
    productId: string;
    productCode: string;
    productName: string;
    batchNumber: string;
    expiryDate: string;
    daysRemaining: number;
    warehouseName: string;
  }>;
  monthlyTransactions: Array<{
    month: string;
    stockIn: number;
    stockOut: number;
  }>;
  valuationTrends: Array<{
    date: string;
    totalValue: number;
  }>;
}

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get('/reports/dashboard');
        if (response.data.succeeded) {
          setData(response.data.data);
        } else {
          dispatch(showAlert({ message: response.data.message || 'Failed to load dashboard data', severity: 'error' }));
        }
      } catch (err: any) {
        console.error('Failed to load dashboard data', err);
        dispatch(showAlert({ message: 'Error loading dashboard metrics', severity: 'error' }));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress color="primary" />
        <Typography sx={{ mt: 2, textAlign: 'center' }} color="textSecondary">
          Loading Invantage Summary Metrics...
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h5">
          Failed to load dashboard data. Please check your database connection or try again.
        </Typography>
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: data.totalProducts,
      subtitle: `${data.totalCategories} Categories`,
      icon: <ProductIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Active Warehouses',
      value: data.totalWarehouses,
      subtitle: `${data.totalSuppliers} Active Suppliers`,
      icon: <WarehouseIcon sx={{ fontSize: 36, color: theme.palette.success.main }} />,
      color: theme.palette.success.main,
    },
    {
      title: "Today's Stock In",
      value: data.todayStockInQty,
      subtitle: 'Items received today',
      icon: <StockInIcon sx={{ fontSize: 36, color: theme.palette.info.main }} />,
      color: theme.palette.info.main,
    },
    {
      title: 'Low Stock Warnings',
      value: data.lowStockCount,
      subtitle: `${data.outOfStockCount} Out of Stock`,
      icon: <WarningIcon sx={{ fontSize: 36, color: theme.palette.warning.main }} />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box className="animate-fade-in">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Real-time inventory stats and transactional summaries.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card className="hover-lift" sx={{ borderLeft: `4px solid ${card.color}` }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {card.subtitle}
                  </Typography>
                </Box>
                {card.icon}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Stock In/Out */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Monthly Stock Movement
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyTransactions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="month" tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis tick={{ fill: theme.palette.text.secondary }} />
                    <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }} />
                    <Legend />
                    <Bar dataKey="stockIn" name="Stock In" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="stockOut" name="Stock Out" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Valuation Trend */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Inventory Valuation Trend
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.valuationTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis tick={{ fill: theme.palette.text.secondary }} />
                    <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }} />
                    <Area type="monotone" dataKey="totalValue" name="Value ($)" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Lists */}
      <Grid container spacing={3}>
        {/* Low Stock Alerts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" /> Low Stock Alerts
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {data.lowStockAlerts.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                  All items are in healthy stock levels.
                </Typography>
              ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Current Stock</TableCell>
                        <TableCell align="right">Threshold</TableCell>
                        <TableCell>Warehouse</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.lowStockAlerts.map((row, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.productName}
                            <Typography variant="caption" sx={{ display: 'block' }} color="textSecondary">
                              {row.productCode}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={row.currentStock} size="small" color={row.currentStock === 0 ? 'error' : 'warning'} />
                          </TableCell>
                          <TableCell align="right" color="textSecondary">
                            {row.reorderLevel}
                          </TableCell>
                          <TableCell>{row.warehouseName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Expiry Alerts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="error" /> Expiring Batches (Within 60 Days)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {data.expiryAlerts.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                  No batch expiration alerts.
                </Typography>
              ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Batch No</TableCell>
                        <TableCell>Expiry Date</TableCell>
                        <TableCell align="right">Days Left</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.expiryAlerts.map((row, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.productName}
                            <Typography variant="caption" sx={{ display: 'block' }} color="textSecondary">
                              {row.warehouseName}
                            </Typography>
                          </TableCell>
                          <TableCell>{row.batchNumber}</TableCell>
                          <TableCell>{new Date(row.expiryDate).toLocaleDateString()}</TableCell>
                          <TableCell align="right">
                            <Chip label={`${row.daysRemaining} days`} size="small" color={row.daysRemaining <= 15 ? 'error' : 'warning'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
