import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/LockOutlined';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <LockIcon sx={{ fontSize: 80, color: 'error.main' }} />
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 500 }}>
          You do not have the required permissions to view this resource. Please contact your administrator if you believe this is an error.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;
