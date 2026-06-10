import React, { useState } from 'react';
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
  Grid,
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  VpnKeyOutlined as KeyIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../store';
import { showAlert } from '../store/alertSlice';
import axiosInstance from '../api/axios';
import { ChangePasswordRequest } from '../types';

const schema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const ChangePassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordRequest>({
    resolver: yupResolver(schema) as any,
  });

  const onSubmit = async (data: ChangePasswordRequest) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      const resData = response.data;
      if (resData.succeeded) {
        dispatch(showAlert({ message: 'Password changed successfully!', severity: 'success' }));
        reset();
      } else {
        dispatch(showAlert({ message: resData.message || 'Failed to change password.', severity: 'error' }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="animate-fade-in" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Change Password
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Update your account security password regularly to prevent unauthorized access.
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 600, borderRadius: '16px', boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)', border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword?.message}
                  {...register('currentPassword')}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  {...register('newPassword')}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
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
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isLoading}
                  startIcon={isLoading ? null : <SaveIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: '10px',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none',
                    }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChangePassword;
