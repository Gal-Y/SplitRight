import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import LoadGenerator from '../components/LoadGenerator';

const HomePage = () => {
  const [groups, setGroups] = useState([]);
  const [openNewGroupDialog, setOpenNewGroupDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize storage when the app loads
    apiService.initialize();
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await apiService.getGroups();
      setGroups(groupsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      return;
    }

    const members = newGroupMembers
      .split(',')
      .map((member) => member.trim())
      .filter((member) => member !== '');

    try {
      const newGroup = await apiService.createGroup({
        name: newGroupName,
        members,
      });

      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setNewGroupMembers('');
      setOpenNewGroupDialog(false);
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
    }
  };

  const handleResetData = async () => {
    try {
      await apiService.resetAllData();
      fetchGroups();
      setOpenResetDialog(false);
    } catch (err) {
      console.error('Error resetting data:', err);
      setError('Failed to reset data. Please try again.');
    }
  };

  return (
    <Box className="fade-in">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to SplitRight
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          The easiest way to split expenses with friends and family
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewGroupDialog(true)}
          >
            Create New Group
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={() => setOpenResetDialog(true)}
          >
            New Session
          </Button>
        </Box>
      </Box>

      {/* Load Generator for Kubernetes Demo */}
      <LoadGenerator />

      {error && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            borderLeft: '4px solid #d32f2f',
          }}
        >
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Typography>Loading groups...</Typography>
          </Grid>
        ) : groups.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <CardContent>
                <GroupIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">No Groups Yet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create your first expense splitting group to get started
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenNewGroupDialog(true)}
                >
                  Create Group
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ) : (
          groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {group.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 2, display: 'block' }}
                  >
                    Created: {new Date(group.created_at).toLocaleDateString()}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Members:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {group.members.map((member) => (
                      <Chip
                        key={member}
                        label={member}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    component={RouterLink}
                    to={`/groups/${group.id}`}
                    size="small"
                    color="primary"
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* New Group Dialog */}
      <Dialog
        open={openNewGroupDialog}
        onClose={() => setOpenNewGroupDialog(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create New Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for your group and add members (comma-separated).
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Group Name"
            type="text"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="members"
            label="Members (comma-separated)"
            type="text"
            fullWidth
            value={newGroupMembers}
            onChange={(e) => setNewGroupMembers(e.target.value)}
            placeholder="John, Jane, Bob"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewGroupDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateGroup} color="primary" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Data Dialog */}
      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
        aria-labelledby="reset-dialog-title"
      >
        <DialogTitle id="reset-dialog-title">Start New Session?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will clear all your current groups and expenses data. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleResetData} color="error" variant="contained">
            Reset All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage; 