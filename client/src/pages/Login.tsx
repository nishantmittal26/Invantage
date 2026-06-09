import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Container,
  Paper,
} from '@mui/material';
import {
  EmailOutlined as EmailIcon,
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { LoginRequest } from '../types';
import logo from '../assets/invantage-logo.png';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: yupResolver(schema) as any,
  });

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data: LoginRequest) => {
    dispatch(loginStart());
    try {
      const response = await axiosInstance.post('/auth/login', data);
      const resData = response.data;
      if (resData.succeeded && resData.data) {
        dispatch(loginSuccess(resData.data));
        dispatch(showAlert({ message: 'Login successful!', severity: 'success' }));
        navigate(from, { replace: true });
      } else {
        dispatch(loginFailure(resData.message || 'Login failed.'));
        dispatch(showAlert({ message: resData.message || 'Login failed.', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'An error occurred during login.';
      dispatch(loginFailure(errMsg));
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'radial-gradient(circle at top left, #0f172a 0%, #020617 100%)'
          : 'radial-gradient(circle at top left, #f1f5f9 0%, #e2e8f0 100%)',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
          }}
        >
          <Card sx={{ border: 'none', boxShadow: 'none' }}>
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box
                  component="img"
                  src={logo}
                  alt="Invantage Logo"
                  sx={{
                    height: 80,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    mb: 1
                  }}
                />
                {/* <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Invantage
                </Typography> */}
                <Typography variant="body2" color="textSecondary">
                  Enterprise Inventory Management ERP
                </Typography>
              </Box>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    placeholder="admin@invantage.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register('email')}
                    slotProps={{ input: { startAdornment: (<InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>) } }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Admin@123"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    {...register('password')}
                    slotProps={{ input: { startAdornment: (<InputAdornment position="start"><LockIcon color="action" /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) } }}
                  />

                  {error && (
                    <Typography variant="body2" color="error" sx={{ textAlign: 'left' }}>
                      {error}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                  </Button>
                </Box>
              </form>

              <Box sx={{ mt: 4, borderTop: (theme) => `1px solid ${theme.palette.divider}`, pt: 3 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                  Demo Master Admin Credentials:
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  admin@invantage.com / Admin@123
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
