import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Container,
  Paper,
  Link,
} from '@mui/material';
import {
  EmailOutlined as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { ForgotPasswordRequest } from '../types';
import logo from '../assets/invantage-logo.png';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
});

const ForgotPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordRequest>({
    resolver: yupResolver(schema) as any,
  });

  const onSubmit = async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/forgot-password', data);
      const resData = response.data;
      if (resData.succeeded) {
        setIsSubmitted(true);
        dispatch(showAlert({ message: resData.message || 'Password reset link sent!', severity: 'success' }));
      } else {
        dispatch(showAlert({ message: resData.message || 'Failed to send reset link.', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    } finally {
      setIsLoading(false);
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
                <Typography variant="body2" color="textSecondary">
                  Enterprise Inventory Management ERP
                </Typography>
              </Box>

              {!isSubmitted ? (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    Forgot Password?
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    Enter your email address below and we'll send you a link to reset your password.
                  </Typography>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        placeholder="yourname@company.com"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        {...register('email')}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon color="action" />
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
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                      </Button>
                    </Box>
                  </form>
                </>
              ) : (
                <Box sx={{ py: 2 }}>
                  <CheckIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    Check Your Email
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    We have sent a password reset link to your email address if it is registered with us.
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

export default ForgotPassword;
