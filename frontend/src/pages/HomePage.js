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
  Container,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  AccountBalance as AccountBalanceIcon,
  Payments as PaymentsIcon,
  ReceiptLong as ReceiptLongIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import apiService from '../services/apiService';

const HomePage = () => {
  const [groups, setGroups] = useState([]);
  const [openNewGroupDialog, setOpenNewGroupDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

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

  // Generate random pastel color for group avatars
  const getGroupColor = (name) => {
    const colors = [
      '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9',
      '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9',
      '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Box className="fade-in">
      {/* Hero Section */}
      <Box 
        sx={{
          position: 'relative',
          height: '40vh',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          mb: 6,
          overflow: 'hidden',
          background: `linear-gradient(135deg, #121212 0%, #1e1e1e 50%, ${theme.palette.primary.dark} 100%)`,
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
          color: 'white',
          p: 4,
        }}
      >
        {/* Animated background elements */}
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              zIndex: 0,
              '@keyframes float': {
                '0%': { transform: 'translate(0, 0)' },
                '50%': { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)` },
                '100%': { transform: 'translate(0, 0)' },
              },
            }}
          />
        ))}
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            <span style={{ color: theme.palette.secondary.light }}>Split</span>Right
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              fontWeight: 300,
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '0 1px 5px rgba(0,0,0,0.3)',
              color: alpha('#ffffff', 0.9),
            }}
          >
            Split expenses effortlessly with friends, roommates, and travel buddies
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewGroupDialog(true)}
              sx={{ 
                borderRadius: '50px', 
                px: 4, 
                py: 1.5,
                boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Create New Group
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={() => setOpenResetDialog(true)}
              sx={{ 
                borderRadius: '50px', 
                px: 3, 
                py: 1.5,
                borderColor: alpha('#ffffff', 0.5),
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              New Session
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<SpeedIcon />}
              component={RouterLink}
              to="/load-test"
              sx={{ 
                borderRadius: '50px', 
                px: 3, 
                py: 1.5,
                borderColor: alpha('#ffffff', 0.5),
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              K8s Load Test
            </Button>
          </Box>
        </Box>
        
        <IconButton 
          sx={{ 
            position: 'absolute', 
            bottom: 20, 
            color: alpha('#ffffff', 0.8),
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
              '40%': { transform: 'translateY(-20px)' },
              '60%': { transform: 'translateY(-10px)' },
            },
          }}
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight * 0.4,
              behavior: 'smooth',
            });
          }}
        >
          <ArrowDownwardIcon />
        </IconButton>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Why Choose SplitRight?
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            align="center" 
            sx={{ mb: 5, maxWidth: '700px', mx: 'auto' }}
          >
            The smartest way to manage shared expenses and keep track of who owes what
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: alpha('#1e1e1e', 0.7),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                    backgroundColor: alpha('#1e1e1e', 0.9),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.8), 
                      width: 56, 
                      height: 56,
                      mr: 2,
                    }}
                  >
                    <GroupIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" component="h3">
                    Group Management
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Create groups for different occasions - roommates, trips, events, or projects. Add members easily and keep everything organized.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: alpha('#1e1e1e', 0.7),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                    backgroundColor: alpha('#1e1e1e', 0.9),
                    borderColor: alpha(theme.palette.secondary.main, 0.2),
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.secondary.main, 0.8), 
                      width: 56, 
                      height: 56,
                      mr: 2,
                    }}
                  >
                    <ReceiptLongIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" component="h3">
                    Expense Tracking
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Record expenses with details on who paid and how to split the cost. Keep a clear history of all transactions within your group.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: alpha('#1e1e1e', 0.7),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                    backgroundColor: alpha('#1e1e1e', 0.9),
                    borderColor: alpha(theme.palette.info.main, 0.2),
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.info.main, 0.8), 
                      width: 56, 
                      height: 56,
                      mr: 2,
                    }}
                  >
                    <PaymentsIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" component="h3">
                    Smart Settlements
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Our intelligent algorithm calculates the optimal way to settle debts, minimizing the number of transactions needed between group members.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Error Display */}
        {error && (
          <Paper
            sx={{
              p: 2,
              mb: 4,
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              borderLeft: '4px solid #d32f2f',
              borderRadius: 2,
            }}
          >
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {/* Groups Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ mb: 4, fontWeight: 600 }}
          >
            Your Groups
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography>Loading your groups...</Typography>
            </Box>
          ) : groups.length === 0 ? (
            <Card 
              sx={{ 
                textAlign: 'center', 
                p: 5, 
                borderRadius: 4,
                background: `linear-gradient(135deg, #121212 0%, #1a1a1a 100%)`,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                border: `1px solid ${alpha('#ffffff', 0.05)}`,
              }}
            >
              <CardContent>
                <GroupIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
                <Typography variant="h5" gutterBottom>No Groups Yet</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
                  Create your first expense splitting group to start tracking shared expenses with friends, roommates, or travel buddies
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenNewGroupDialog(true)}
                  sx={{ 
                    borderRadius: '50px', 
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Create Your First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {groups.map((group) => (
                <Grid item xs={12} sm={6} md={4} key={group.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      backgroundColor: alpha('#121212', 0.7),
                      border: `1px solid ${alpha('#ffffff', 0.05)}`,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.2)',
                        borderColor: alpha('#ffffff', 0.1),
                      },
                      position: 'relative',
                    }}
                  >
                    <Box 
                      sx={{ 
                        height: '80px', 
                        background: `linear-gradient(135deg, ${getGroupColor(group.name)} 0%, ${alpha(getGroupColor(group.name), 0.7)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        px: 3,
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: alpha('#000', 0.1), 
                          color: '#000', 
                          fontWeight: 'bold',
                          width: 50,
                          height: 50,
                          fontSize: '1.2rem',
                        }}
                      >
                        {getInitials(group.name)}
                      </Avatar>
                      <Box sx={{ ml: 2 }}>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          sx={{ 
                            color: 'rgba(0,0,0,0.8)',
                            fontWeight: 600,
                            textShadow: '0 1px 2px rgba(255,255,255,0.1)',
                          }}
                        >
                          {group.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'rgba(0,0,0,0.6)',
                            display: 'block',
                          }}
                        >
                          Created: {new Date(group.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Members:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                        {group.members.map((member) => (
                          <Chip
                            key={member}
                            label={member}
                            size="small"
                            sx={{ 
                              mb: 1,
                              borderRadius: '50px',
                              fontWeight: 500,
                              backgroundColor: alpha('#ffffff', 0.08),
                              '&:hover': {
                                backgroundColor: alpha('#ffffff', 0.12),
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        component={RouterLink}
                        to={`/groups/${group.id}`}
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ 
                          borderRadius: '50px',
                          py: 1,
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* New Group Dialog */}
      <Dialog
        open={openNewGroupDialog}
        onClose={() => setOpenNewGroupDialog(false)}
        aria-labelledby="form-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            backgroundColor: '#121212',
            backgroundImage: 'none',
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="form-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Create New Group
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
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
            sx={{ mb: 3 }}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
          <TextField
            margin="dense"
            id="members"
            label="Members (comma-separated)"
            type="text"
            fullWidth
            value={newGroupMembers}
            onChange={(e) => setNewGroupMembers(e.target.value)}
            placeholder="John, Jane, Alex, Sarah"
            helperText="Enter the names of people in your group, separated by commas"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenNewGroupDialog(false)} 
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateGroup} 
            variant="contained" 
            color="primary"
            disabled={!newGroupName.trim()}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Data Dialog */}
      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
        aria-labelledby="reset-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            backgroundColor: '#121212',
            backgroundImage: 'none',
          }
        }}
      >
        <DialogTitle id="reset-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Reset All Data
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset all data? This will delete all groups and expenses. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenResetDialog(false)} 
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResetData} 
            variant="contained" 
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Reset All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage; 