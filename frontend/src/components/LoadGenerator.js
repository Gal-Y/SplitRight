import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Alert
} from '@mui/material';
import {
  Speed as SpeedIcon,
  CloudUpload as CloudUploadIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import apiService from '../services/apiService';

const LoadGenerator = () => {
  const [intensity, setIntensity] = useState(5);
  const [duration, setDuration] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [useLocalStorage, setUseLocalStorage] = useState(
    localStorage.getItem('use_local_storage') === 'true'
  );

  const handleIntensityChange = (event, newValue) => {
    setIntensity(newValue);
  };

  const handleDurationChange = (event, newValue) => {
    setDuration(newValue);
  };

  const handleStorageModeChange = (event) => {
    const newMode = event.target.checked;
    setUseLocalStorage(newMode);
    apiService.setStorageMode(newMode);
  };

  const handleGenerateLoad = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Add a longer timeout for the load test request (30 seconds)
      const response = await apiService.generateLoad(intensity, duration);
      
      // Check if response exists and has the required properties
      if (response && typeof response === 'object') {
        setResult({
          message: response.message || 'Load generated successfully',
          operations: response.operations || 0,
          duration: parseFloat(response.duration || 0)
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Load generation error:', err);
      setError(`Failed to generate load: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Kubernetes Autoscaling Demo
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Generate CPU and memory load on the backend to trigger Kubernetes horizontal pod autoscaling.
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography id="intensity-slider" gutterBottom>
          Load Intensity: {intensity}
        </Typography>
        <Slider
          value={intensity}
          onChange={handleIntensityChange}
          aria-labelledby="intensity-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={10}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography id="duration-slider" gutterBottom>
          Duration (seconds): {duration}
        </Typography>
        <Slider
          value={duration}
          onChange={handleDurationChange}
          aria-labelledby="duration-slider"
          valueLabelDisplay="auto"
          step={5}
          marks
          min={5}
          max={60}
        />
      </Box>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleGenerateLoad}
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Load'}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {result && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="success">
            {result.message}
          </Alert>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Operations: {result.operations}
          </Typography>
          <Typography variant="body2">
            Actual Duration: {result.duration.toFixed(2)} seconds
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LoadGenerator; 