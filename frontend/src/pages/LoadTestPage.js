import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LoadGenerator from '../components/LoadGenerator';

const LoadTestPage = () => {
  const navigate = useNavigate();

  return (
    <Box className="fade-in">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Home
      </Button>

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kubernetes Autoscaling Demo
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Generate load on the backend to test Kubernetes horizontal pod autoscaling
        </Typography>
      </Box>

      <LoadGenerator />
    </Box>
  );
};

export default LoadTestPage; 