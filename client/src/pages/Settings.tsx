import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
  Tab,
  Tabs,
  CircularProgress,
  Switch,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch } from '../store';
import { showAlert } from '../store/alertSlice';
import { updateCompanySettingsState } from '../store/settingsSlice';
import axiosInstance from '../api/axios';
import { AuditLog } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} style={{ width: '100%', paddingTop: '20px' }}>
    {value === index && <Box>{children}</Box>}
  </div>
);

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const [tabIndex, setTabIndex] = useState(0);

  // Loadings
  const [companyLoading, setCompanyLoading] = useState(false);
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filterUser, setFilterUser] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  // Form Controls
  const companyForm = useForm({
    defaultValues: {
      companyName: '',
      address: '',
      phone: '',
      email: '',
      gstNumber: '',
      logoUrl: '',
    },
  });

  const smtpForm = useForm({
    defaultValues: {
      smtpHost: '',
      smtpPort: 587,
      smtpEmail: '',
      smtpPassword: '',
      enableSmtp: false,
    },
  });

  const fetchCompanySettings = async () => {
    setCompanyLoading(true);
    try {
      const response = await axiosInstance.get('/settings/company');
      if (response.data.succeeded && response.data.data) {
        const data = response.data.data;
        companyForm.reset(data);
        // Sync with layout settings
        dispatch(updateCompanySettingsState({
          companyName: data.companyName,
          logoUrl: data.logoUrl,
          gstNumber: data.gstNumber,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompanyLoading(false);
    }
  };

  const fetchSmtpSettings = async () => {
    setSmtpLoading(true);
    try {
      const response = await axiosInstance.get('/settings/smtp');
      if (response.data.succeeded && response.data.data) {
        smtpForm.reset(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSmtpLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    const params: any = {};
    if (filterUser) params.user = filterUser;
    if (filterEntity) params.entity = filterEntity;

    try {
      const response = await axiosInstance.get('/settings/auditlogs', { params });
      if (response.data.succeeded) {
        // Map to flat ID for DataGrid
        const formatted = response.data.data.map((item: any, index: number) => ({
          ...item,
          id: item.id || `audit-${index}`,
        }));
        setAuditLogs(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    if (newValue === 0) fetchCompanySettings();
    if (newValue === 1) fetchSmtpSettings();
    if (newValue === 2) fetchAuditLogs();
  };

  const onCompanySubmit = async (formData: any) => {
    setCompanyLoading(true);
    try {
      const response = await axiosInstance.put('/settings/company', formData);
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'Company settings updated successfully!', severity: 'success' }));
        dispatch(updateCompanySettingsState({
          companyName: formData.companyName,
          logoUrl: formData.logoUrl,
          gstNumber: formData.gstNumber,
        }));
      } else {
        dispatch(showAlert({ message: response.data.message || 'Update failed', severity: 'error' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(showAlert({ message: 'Failed to save settings.', severity: 'error' }));
    } finally {
      setCompanyLoading(false);
    }
  };

  const onSmtpSubmit = async (formData: any) => {
    setSmtpLoading(true);
    try {
      const response = await axiosInstance.put('/settings/smtp', {
        ...formData,
        smtpPort: Number(formData.smtpPort),
      });
      if (response.data.succeeded) {
        dispatch(showAlert({ message: 'SMTP configurations saved successfully!', severity: 'success' }));
      } else {
        dispatch(showAlert({ message: response.data.message || 'Update failed', severity: 'error' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(showAlert({ message: 'Failed to save SMTP configurations.', severity: 'error' }));
    } finally {
      setSmtpLoading(false);
    }
  };

  const auditColumns: GridColDef[] = [
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      width: 170,
      valueFormatter: (p: any) => new Date(p).toLocaleString(),
    },
    { field: 'userName', headerName: 'User Account', width: 150 },
    { field: 'action', headerName: 'Action Type', width: 120 },
    { field: 'entityName', headerName: 'Module', width: 140 },
    { field: 'details', headerName: 'Action Details / Remarks', flex: 1 },
  ];

  return (
    <Box className="animate-fade-in" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          System Settings
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Configure company ERP profiles, SMTP parameters, and track audit entries.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label="Company Profile" sx={{ fontWeight: 600 }} />
          <Tab label="SMTP / Mail Configs" sx={{ fontWeight: 600 }} />
          <Tab label="System Audit Logs" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Tab 1: Company Profile */}
      <CustomTabPanel value={tabIndex} index={0}>
        {companyLoading && <CircularProgress />}
        {!companyLoading && (
          <Card sx={{ maxWidth: 800 }}>
            <CardContent>
              <form onSubmit={companyForm.handleSubmit(onCompanySubmit)}>
                <Grid container spacing={3}>
                  <Grid size={{xs: 12, sm: 6}} >
                    <Controller
                      name="companyName"
                      control={companyForm.control}
                      rules={{ required: 'Company name is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} fullWidth label="Company Name" error={!!error} helperText={error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}} >
                    <Controller
                      name="gstNumber"
                      control={companyForm.control}
                      render={({ field }) => <TextField {...field} fullWidth label="Tax / GST Identification Number" />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}} >
                    <Controller
                      name="phone"
                      control={companyForm.control}
                      rules={{ required: 'Phone is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} fullWidth label="Contact Phone" error={!!error} helperText={error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}} >
                    <Controller
                      name="email"
                      control={companyForm.control}
                      rules={{ required: 'Email is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} type="email" fullWidth label="Notification Email Address" error={!!error} helperText={error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 12}} >
                    <Controller
                      name="address"
                      control={companyForm.control}
                      rules={{ required: 'Address is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} fullWidth label="Billing Address" multiline rows={3} error={!!error} helperText={error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 12}} >
                    <Controller
                      name="logoUrl"
                      control={companyForm.control}
                      render={({ field }) => <TextField {...field} fullWidth label="Company Logo Image URL" />}
                    />
                  </Grid>
                  <Grid size={{xs: 12}} >
                    <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />}>
                      Save Profile
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        )}
      </CustomTabPanel>

      {/* Tab 2: SMTP Configuration */}
      <CustomTabPanel value={tabIndex} index={1}>
        {smtpLoading && <CircularProgress />}
        {!smtpLoading && (
          <Card sx={{ maxWidth: 800 }}>
            <CardContent>
              <form onSubmit={smtpForm.handleSubmit(onSmtpSubmit)}>
                <Grid container spacing={3}>
                  <Grid size={{xs: 12}} >
                    <Controller
                      name="enableSmtp"
                      control={smtpForm.control}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={<Switch checked={value} onChange={onChange} />}
                          label="Enable SMTP System Email Notifications (Low stock alerts, expiries)"
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 8}} >
                    <Controller
                      name="smtpHost"
                      control={smtpForm.control}
                      render={({ field }) => <TextField {...field} fullWidth label="SMTP Outgoing Host Server" placeholder="smtp.gmail.com" />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 4}} >
                    <Controller
                      name="smtpPort"
                      control={smtpForm.control}
                      render={({ field }) => <TextField {...field} type="number" fullWidth label="SMTP Port" placeholder="587" />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}} >
                    <Controller
                      name="smtpEmail"
                      control={smtpForm.control}
                      render={({ field }) => <TextField {...field} type="email" fullWidth label="SMTP Account Email" placeholder="alerts@invantage.com" />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}} >
                    <Controller
                      name="smtpPassword"
                      control={smtpForm.control}
                      render={({ field }) => <TextField {...field} type="password" fullWidth label="SMTP Account Password" />}
                    />
                  </Grid>
                  <Grid size={{xs: 12}} >
                    <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />}>
                      Save Mail Configs
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        )}
      </CustomTabPanel>

      {/* Tab 3: System Audit Logs */}
      <CustomTabPanel value={tabIndex} index={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
          {/* Audit Filters */}
          <Card>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{xs: 12, sm: 4}} >
                  <TextField
                    fullWidth
                    label="User Filter"
                    placeholder="Search username"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                  />
                </Grid>
                <Grid size={{xs: 12, sm: 4}} >
                  <TextField
                    fullWidth
                    label="Module / Entity Filter"
                    placeholder="Search Product, Supplier, PO, etc."
                    value={filterEntity}
                    onChange={(e) => setFilterEntity(e.target.value)}
                  />
                </Grid>
                <Grid sx={{ display: 'flex', gap: 1 }} size={{xs: 12, sm: 4}} >
                  <Button variant="contained" fullWidth onClick={fetchAuditLogs} disabled={auditLoading}>
                    Search Logs
                  </Button>
                  <IconButton onClick={fetchAuditLogs} color="inherit">
                    <RefreshIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Audit logs grid */}
          <Box sx={{ minHeight: 400, width: '100%' }}>
            <DataGrid
              rows={auditLogs}
              columns={auditColumns}
              loading={auditLoading}
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
      </CustomTabPanel>
    </Box>
  );
};

export default Settings;
