import React, { useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
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
  Link,
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  ErrorOutlined as ErrorIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { ResetPasswordRequest } from '../types';
import logo from '../assets/invantage-logo.png';

const schema = yup.object().shape({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const { register, handleSubmit, formState: { errors } } = useForm<Omit<ResetPasswordRequest, 'token' | 'email'>>({
    resolver: yupResolver(schema) as any,
  });

  const onSubmit = async (data: Omit<ResetPasswordRequest, 'token' | 'email'>) => {
    if (!token || !email) {
      dispatch(showAlert({ message: 'Invalid or missing reset token or email.', severity: 'error' }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        token,
        email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      const resData = response.data;
      if (resData.succeeded) {
        setIsSubmitted(true);
        dispatch(showAlert({ message: 'Password reset successful! You can now log in.', severity: 'success' }));
      } else {
        dispatch(showAlert({ message: resData.message || 'Failed to reset password.', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const hasParams = !!token && !!email;

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
                <Typography variant="body2" color="textSecondary">
                  Enterprise Inventory Management ERP
                </Typography>
              </Box>

              {!hasParams ? (
                <Box sx={{ py: 2 }}>
                  <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    Invalid Link
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    The password reset link is invalid, incomplete, or has expired. Please request a new one.
                  </Typography>
                </Box>
              ) : !isSubmitted ? (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    Reset Password
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    Please enter your new password below for <strong>{email}</strong>.
                  </Typography>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        {...register('password')}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }
                        }}
                      />

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
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                      </Button>
                    </Box>
                  </form>
                </>
              ) : (
                <Box sx={{ py: 2 }}>
                  <CheckIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    Password Reset!
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    Your password has been successfully reset. You can now use your new credentials to sign in.
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 4, pt: 3, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'primary.main',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  <ArrowBackIcon fontSize="small" /> Back to Sign In
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
