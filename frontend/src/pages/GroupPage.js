import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Checkbox,
  Tab,
  Tabs,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  Zoom,
  Badge,
  Divider,
  Container,
  alpha,
  useTheme,
  CircularProgress,
  Fade,
  Grow,
  Slide,
  RadioGroup,
  Radio,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Calculate as CalculateIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import apiService from '../services/apiService';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={500}>
          <Box sx={{ pt: 3 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  // New expense state
  const [openNewExpenseDialog, setOpenNewExpenseDialog] = useState(false);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpensePayer, setNewExpensePayer] = useState('');
  const [newExpenseSplitBetween, setNewExpenseSplitBetween] = useState([]);

  // New member state
  const [openNewMemberDialog, setOpenNewMemberDialog] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [confirmDeleteMember, setConfirmDeleteMember] = useState(null);

  // Add new state variables for expense handling options
  const [expenseOption, setExpenseOption] = useState('none');
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  // Define fetchGroupData with useCallback to memoize it
  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true);
      const groupData = await apiService.getGroupById(groupId);
      const expensesData = await apiService.getExpensesByGroupId(groupId);

      if (!groupData) {
        setError('Group not found.');
        setLoading(false);
        return;
      }

      setGroup(groupData);
      setExpenses(expensesData);
      setError(null);

      // Initialize split between with all members
      setNewExpenseSplitBetween(groupData.members);
    } catch (err) {
      console.error('Error fetching group data:', err);
      setError('Failed to load group data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const fetchSettlements = async () => {
    try {
      const settlementsData = await apiService.getSettlements(groupId);
      setSettlements(settlementsData);
    } catch (err) {
      console.error('Error calculating settlements:', err);
      setError('Failed to calculate settlements. Please try again.');
    }
  };

  const handleAddExpense = async () => {
    if (!newExpenseDescription.trim() || !newExpenseAmount || !newExpensePayer || newExpenseSplitBetween.length === 0) {
      return;
    }

    try {
      const newExpense = await apiService.createExpense({
        group_id: groupId,
        description: newExpenseDescription,
        amount: parseFloat(newExpenseAmount),
        payer: newExpensePayer,
        split_between: newExpenseSplitBetween,
      });

      setExpenses([...expenses, newExpense]);
      setNewExpenseDescription('');
      setNewExpenseAmount('');
      setNewExpensePayer('');
      setNewExpenseSplitBetween(group.members);
      setOpenNewExpenseDialog(false);
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await apiService.deleteExpense(groupId, expenseId);
      setExpenses(expenses.filter((expense) => expense.id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      return;
    }

    try {
      // Add the new member to the group
      const updatedGroup = {
        ...group,
        members: [...group.members, newMemberName],
      };
      
      const savedGroup = await apiService.updateGroup(updatedGroup);
      setGroup(savedGroup);

      // Handle expense options
      if (expenseOption === 'all' && expenses.length > 0) {
        // Add member to all existing expenses
        const updatedExpenses = await Promise.all(
          expenses.map(async (expense) => {
            if (!expense.split_between.includes(newMemberName)) {
              const updatedExpense = {
                ...expense,
                split_between: [...expense.split_between, newMemberName]
              };
              // Update the expense with the new member
              return await apiService.createExpense({
                ...updatedExpense,
                group_id: groupId
              });
            }
            return expense;
          })
        );
        setExpenses(updatedExpenses);
      } else if (expenseOption === 'selected' && selectedExpenses.length > 0) {
        // Add member to selected expenses
        const updatedExpenses = await Promise.all(
          expenses.map(async (expense) => {
            if (selectedExpenses.includes(expense.id) && !expense.split_between.includes(newMemberName)) {
              const updatedExpense = {
                ...expense,
                split_between: [...expense.split_between, newMemberName]
              };
              // Update the expense with the new member
              return await apiService.createExpense({
                ...updatedExpense,
                group_id: groupId
              });
            }
            return expense;
          })
        );
        setExpenses(updatedExpenses);
      }

      // Reset state
      setNewMemberName('');
      setExpenseOption('none');
      setSelectedExpenses([]);
      setOpenNewMemberDialog(false);
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member. Please try again.');
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setEditMemberName(member);
  };

  const handleSaveMemberEdit = async () => {
    if (!editMemberName.trim() || editMemberName === editingMember) {
      setEditingMember(null);
      return;
    }

    try {
      // Update the member name
      const updatedGroup = {
        ...group,
        members: group.members.map(m => m === editingMember ? editMemberName : m),
      };
      
      const savedGroup = await apiService.updateGroup(updatedGroup);
      setGroup(savedGroup);
      setEditingMember(null);
    } catch (err) {
      console.error('Error updating member:', err);
      setError('Failed to update member. Please try again.');
    }
  };

  const handleCancelMemberEdit = () => {
    setEditingMember(null);
    setEditMemberName('');
  };

  const handleDeleteMember = async (memberName) => {
    try {
      // Remove the member from the group
      const updatedGroup = {
        ...group,
        members: group.members.filter(m => m !== memberName),
      };
      
      const savedGroup = await apiService.updateGroup(updatedGroup);
      setGroup(savedGroup);
      setConfirmDeleteMember(null);
    } catch (err) {
      console.error('Error deleting member:', err);
      setError('Failed to delete member. Please try again.');
    }
  };

  const handleSplitBetweenChange = (member) => {
    const currentIndex = newExpenseSplitBetween.indexOf(member);
    const newSplitBetween = [...newExpenseSplitBetween];

    if (currentIndex === -1) {
      newSplitBetween.push(member);
    } else {
      newSplitBetween.splice(currentIndex, 1);
    }

    setNewExpenseSplitBetween(newSplitBetween);
  };

  const handleExpenseSelection = (expenseId) => {
    const currentIndex = selectedExpenses.indexOf(expenseId);
    const newSelectedExpenses = [...selectedExpenses];

    if (currentIndex === -1) {
      newSelectedExpenses.push(expenseId);
    } else {
      newSelectedExpenses.splice(currentIndex, 1);
    }

    setSelectedExpenses(newSelectedExpenses);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 2) {
      fetchSettlements();
    }
  };

  // Generate avatar color and initials for members
  const getAvatarColor = (name) => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to count how many expenses a member is part of
  const getExpenseCount = (memberName) => {
    if (!expenses || expenses.length === 0) return 0;
    
    // Count expenses where the member is either the payer or included in split_between
    return expenses.filter(expense => 
      expense.payer === memberName || 
      expense.split_between.includes(memberName)
    ).length;
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading group data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Groups
        </Button>
        <Paper
          sx={{
            p: 2,
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            borderLeft: '4px solid #d32f2f',
          }}
        >
          <Typography color="error">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  if (!group) {
    return (
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Groups
        </Button>
        <Typography>Group not found.</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ 
            mb: 2, 
            borderRadius: '50px',
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          Back to Groups
        </Button>

        <Box 
          sx={{ 
            mb: 4,
            position: 'relative',
            p: 4,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.6)} 100%)`,
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            {group?.name}
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              opacity: 0.9,
              textShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            Created: {new Date(group?.created_at).toLocaleDateString()}
          </Typography>
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: '150px', 
              height: '150px', 
              opacity: 0.1,
              overflow: 'hidden',
            }}
          >
            <GroupIcon sx={{ fontSize: 150, position: 'absolute', top: -30, right: -30 }} />
          </Box>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            mb: 4,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="group tabs"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                transition: 'all 0.3s ease',
                fontSize: '1rem',
                fontWeight: 500,
              },
              '& .Mui-selected': {
                fontWeight: 700,
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              icon={<PersonIcon />}
              label="Members"
              id="tab-0"
              aria-controls="tabpanel-0"
              iconPosition="start"
            />
            <Tab
              icon={<ReceiptIcon />}
              label="Expenses"
              id="tab-1"
              aria-controls="tabpanel-1"
              iconPosition="start"
            />
            <Tab
              icon={<PaymentIcon />}
              label="Settlements"
              id="tab-2"
              aria-controls="tabpanel-2"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Members Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography 
              variant="h5" 
              component="h2"
              sx={{ fontWeight: 600 }}
            >
              Group Members ({group?.members.length})
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenNewMemberDialog(true)}
              sx={{ 
                borderRadius: '50px',
                px: 3,
                py: 1.2,
                boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Add Member
            </Button>
          </Box>

          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              backgroundColor: alpha('#121212', 0.7),
              border: `1px solid ${alpha('#ffffff', 0.05)}`,
            }}
          >
            {group?.members.length > 0 ? (
              <Box>
                {group?.members.map((member, index) => (
                  <Grow
                    in={true}
                    key={member}
                    timeout={300 + (index * 100)}
                    style={{ transformOrigin: '0 0 0' }}
                  >
                    <Box>
                      {index > 0 && <Divider sx={{ opacity: 0.1 }} />}
                      <Box
                        sx={{
                          p: 2.5,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: alpha('#1e1e1e', 0.9),
                            transform: 'translateX(5px)',
                          },
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Background animation element */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '3px',
                            bgcolor: theme.palette.primary.main,
                            opacity: 0,
                            transition: 'all 0.3s ease',
                            '.MuiBox-root:hover &': {
                              opacity: 1,
                              height: '100%',
                            },
                          }}
                        />
                        
                        {editingMember === member ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 1 }}>
                            <Avatar
                              sx={{
                                bgcolor: getAvatarColor(member),
                                width: 48,
                                height: 48,
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                mr: 2,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                              }}
                            >
                              {getInitials(member)}
                            </Avatar>
                            <TextField
                              autoFocus
                              fullWidth
                              variant="outlined"
                              value={editMemberName}
                              onChange={(e) => setEditMemberName(e.target.value)}
                              sx={{ mr: 2 }}
                              InputProps={{
                                sx: { borderRadius: '12px' }
                              }}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                color="error" 
                                onClick={handleCancelMemberEdit}
                                size="small"
                                sx={{
                                  transition: 'all 0.2s ease',
                                  '&:hover': { transform: 'scale(1.1)' },
                                }}
                              >
                                <CancelIcon />
                              </IconButton>
                              <IconButton 
                                color="primary" 
                                onClick={handleSaveMemberEdit}
                                size="small"
                                sx={{
                                  transition: 'all 0.2s ease',
                                  '&:hover': { transform: 'scale(1.1)' },
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <>
                            <Avatar
                              sx={{
                                bgcolor: getAvatarColor(member),
                                width: 48,
                                height: 48,
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                mr: 3,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease',
                                '.MuiBox-root:hover &': {
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              {getInitials(member)}
                            </Avatar>
                            
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 600,
                                  lineHeight: 1.2,
                                  transition: 'all 0.3s ease',
                                  '.MuiBox-root:hover &': {
                                    color: theme.palette.primary.main,
                                  },
                                }}
                              >
                                {member}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <ReceiptIcon fontSize="inherit" />
                                {getExpenseCount(member)} expenses
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Edit Member" arrow>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditMember(member)}
                                  sx={{ 
                                    color: alpha(theme.palette.text.primary, 0.7),
                                    transition: 'all 0.2s ease',
                                    '&:hover': { 
                                      color: theme.palette.primary.main,
                                      transform: 'rotate(15deg)',
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Member" arrow>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => setConfirmDeleteMember(member)}
                                  sx={{ 
                                    transition: 'all 0.2s ease',
                                    '&:hover': { 
                                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                                      transform: 'rotate(15deg)',
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Grow>
                ))}
              </Box>
            ) : (
              <Box>
                <Fade in={true} timeout={800}>
                  <Box sx={{ textAlign: 'center', p: 5 }}>
                    <GroupIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
                    <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                      No Members Yet
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
                      Add members to your group to start tracking shared expenses
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setOpenNewMemberDialog(true)}
                      sx={{ 
                        borderRadius: '50px', 
                        px: 4,
                        py: 1.5,
                        background: `linear-gradient(45deg, #121212 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Add Your First Member
                    </Button>
                  </Box>
                </Fade>
              </Box>
            )}
          </Paper>
        </TabPanel>

        {/* Expenses Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography 
              variant="h5" 
              component="h2"
              sx={{ fontWeight: 600 }}
            >
              Expenses ({expenses.length})
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewExpenseDialog(true)}
              sx={{ 
                borderRadius: '50px',
                px: 3,
                py: 1.2,
                boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Add Expense
            </Button>
          </Box>

          {expenses.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 5,
                borderRadius: '16px',
                background: `linear-gradient(135deg, #121212 0%, #1a1a1a 100%)`,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                border: `1px solid ${alpha('#ffffff', 0.05)}`,
              }}
            >
              <ReceiptIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
              <Typography variant="h5" gutterBottom>No Expenses Yet</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
                Add your first expense to start tracking who owes what
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setOpenNewExpenseDialog(true)}
                sx={{ 
                  borderRadius: '50px', 
                  px: 4,
                  py: 1.5,
                  background: `linear-gradient(45deg, #121212 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Add Your First Expense
              </Button>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                backgroundColor: alpha('#121212', 0.7),
                border: `1px solid ${alpha('#ffffff', 0.05)}`,
              }}
            >
              {expenses.map((expense, index) => (
                <Grow
                  in={true}
                  key={expense.id}
                  timeout={300 + (index * 100)}
                  style={{ transformOrigin: '0 0 0' }}
                >
                  <Box>
                    {index > 0 && <Divider sx={{ opacity: 0.1 }} />}
                    <Box
                      sx={{
                        p: 2.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: alpha('#1e1e1e', 0.9),
                        },
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        {/* Description */}
                        <Grid item xs={12} sm={7} md={5}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                bgcolor: getAvatarColor(expense.payer),
                                width: 40,
                                height: 40,
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                mr: 2,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                              }}
                            >
                              {getInitials(expense.payer)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {expense.description}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                Paid by <span style={{ fontWeight: 600 }}>{expense.payer}</span> • {new Date(expense.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Split between */}
                        <Grid item xs={6} sm={3} md={4}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                            Split between:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {expense.split_between.map((person) => (
                              <Chip
                                key={person}
                                label={person}
                                size="small"
                                avatar={<Avatar sx={{ bgcolor: getAvatarColor(person) }}>{getInitials(person)[0]}</Avatar>}
                                sx={{ 
                                  borderRadius: '50px',
                                  height: '24px',
                                  backgroundColor: alpha('#1e1e1e', 0.9),
                                  border: `1px solid ${alpha('#ffffff', 0.05)}`,
                                  '& .MuiChip-label': {
                                    px: 1,
                                    fontSize: '0.7rem',
                                  },
                                  '& .MuiChip-avatar': {
                                    width: 18,
                                    height: 18,
                                    fontSize: '0.6rem',
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        </Grid>
                        
                        {/* Amount and Delete */}
                        <Grid item xs={12} sm={2} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Box 
                              sx={{ 
                                textAlign: 'right',
                                bgcolor: alpha('#1e1e1e', 0.9),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                p: 1,
                                borderRadius: '8px',
                                mr: 1,
                              }}
                            >
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                Amount
                              </Typography>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: theme.palette.success.main,
                                  lineHeight: 1.2,
                                }}
                              >
                                ${expense.amount.toFixed(2)}
                              </Typography>
                            </Box>
                            <Tooltip title="Delete Expense" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteExpense(expense.id)}
                                sx={{ 
                                  p: 0.5,
                                  '&:hover': { 
                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                    transform: 'rotate(15deg)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grow>
              ))}
            </Paper>
          )}
        </TabPanel>

        {/* Settlements Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography 
              variant="h5" 
              component="h2"
              sx={{ fontWeight: 600 }}
            >
              Settlements
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CalculateIcon />}
              onClick={fetchSettlements}
              sx={{ 
                borderRadius: '50px',
                px: 3,
                py: 1.2,
                boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Calculate Settlements
            </Button>
          </Box>

          {settlements.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 5,
                borderRadius: '16px',
                background: `linear-gradient(135deg, #121212 0%, #1a1a1a 100%)`,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                border: `1px solid ${alpha('#ffffff', 0.05)}`,
              }}
            >
              <PaymentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
              <Typography variant="h5" gutterBottom>No Settlements Yet</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
                Calculate settlements to see who owes what to whom
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<CalculateIcon />}
                onClick={fetchSettlements}
                sx={{ 
                  borderRadius: '50px', 
                  px: 4,
                  py: 1.5,
                  background: `linear-gradient(45deg, #121212 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Calculate Settlements
              </Button>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                backgroundColor: alpha('#121212', 0.7),
                border: `1px solid ${alpha('#ffffff', 0.05)}`,
              }}
            >
              {settlements.map((settlement, index) => (
                <Grow
                  in={true}
                  key={`${settlement.from}-${settlement.to}-${index}`}
                  timeout={300 + (index * 100)}
                  style={{ transformOrigin: '0 0 0' }}
                >
                  <Box>
                    {index > 0 && <Divider sx={{ opacity: 0.1 }} />}
                    <Box
                      sx={{
                        p: 2.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: alpha('#1e1e1e', 0.9),
                        },
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={9}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                bgcolor: getAvatarColor(settlement.from),
                                width: 40,
                                height: 40,
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                mr: 1,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                              }}
                            >
                              {getInitials(settlement.from)}
                            </Avatar>
                            <ArrowBackIcon 
                              sx={{ 
                                transform: 'rotate(180deg)', 
                                mx: 1, 
                                color: theme.palette.primary.main,
                                animation: 'pulse 1.5s infinite ease-in-out',
                                '@keyframes pulse': {
                                  '0%': { opacity: 0.6, transform: 'rotate(180deg) scale(0.9)' },
                                  '50%': { opacity: 1, transform: 'rotate(180deg) scale(1.1)' },
                                  '100%': { opacity: 0.6, transform: 'rotate(180deg) scale(0.9)' },
                                },
                              }} 
                            />
                            <Avatar
                              sx={{
                                bgcolor: getAvatarColor(settlement.to),
                                width: 40,
                                height: 40,
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                mr: 2,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                              }}
                            >
                              {getInitials(settlement.to)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                <span style={{ color: theme.palette.text.primary }}>{settlement.from}</span> owes <span style={{ color: theme.palette.text.primary }}>{settlement.to}</span>
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Box 
                            sx={{ 
                              textAlign: 'right',
                              bgcolor: alpha('#1e1e1e', 0.9),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              p: 1,
                              borderRadius: '8px',
                              display: 'inline-block',
                              minWidth: '100px',
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Amount
                            </Typography>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700,
                                color: theme.palette.primary.main,
                                lineHeight: 1.2,
                              }}
                            >
                              ${settlement.amount.toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grow>
              ))}
            </Paper>
          )}
        </TabPanel>

        {/* New Expense Dialog */}
        <Dialog
          open={openNewExpenseDialog}
          onClose={() => setOpenNewExpenseDialog(false)}
          aria-labelledby="form-dialog-title"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }
          }}
        >
          <DialogTitle id="form-dialog-title" sx={{ pb: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Add New Expense
            </Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 3 }}>
              Enter the expense details below to track who paid and how it's split.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              value={newExpenseDescription}
              onChange={(e) => setNewExpenseDescription(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { borderRadius: '12px' }
              }}
            />
            <TextField
              margin="dense"
              id="amount"
              label="Amount"
              type="number"
              fullWidth
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                sx: { borderRadius: '12px' }
              }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="payer-label">Paid by</InputLabel>
              <Select
                labelId="payer-label"
                id="payer"
                value={newExpensePayer}
                label="Paid by"
                onChange={(e) => setNewExpensePayer(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                {group?.members.map((member) => (
                  <MenuItem key={member} value={member}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          fontSize: '0.8rem', 
                          bgcolor: getAvatarColor(member),
                          mr: 1
                        }}
                      >
                        {getInitials(member)[0]}
                      </Avatar>
                      {member}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              Split between:
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                borderRadius: '12px', 
                bgcolor: alpha(theme.palette.background.default, 0.7),
                mb: 2
              }}
            >
              <FormGroup>
                {group?.members.map((member) => (
                  <FormControlLabel
                    key={member}
                    control={
                      <Checkbox
                        checked={newExpenseSplitBetween.indexOf(member) !== -1}
                        onChange={() => handleSplitBetweenChange(member)}
                        name={member}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.8rem', 
                            bgcolor: getAvatarColor(member),
                            mr: 1
                          }}
                        >
                          {getInitials(member)[0]}
                        </Avatar>
                        {member}
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setOpenNewExpenseDialog(false)}
              sx={{ borderRadius: '50px' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddExpense} 
              variant="contained" 
              color="primary"
              disabled={!newExpenseDescription.trim() || !newExpenseAmount || !newExpensePayer || newExpenseSplitBetween.length === 0}
              sx={{ borderRadius: '50px', px: 3 }}
            >
              Add Expense
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Member Dialog */}
        <Dialog
          open={openNewMemberDialog}
          onClose={() => setOpenNewMemberDialog(false)}
          aria-labelledby="form-dialog-title"
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }
          }}
        >
          <DialogTitle id="form-dialog-title" sx={{ pb: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Add New Member
            </Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 3 }}>
              Enter the name of the new member to add to this group.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Member Name"
              type="text"
              fullWidth
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: '12px' }
              }}
            />
            
            {expenses.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Expense Options
                </Typography>
                
                <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                  <RadioGroup
                    value={expenseOption}
                    onChange={(e) => {
                      setExpenseOption(e.target.value);
                      if (e.target.value !== 'selected') {
                        setSelectedExpenses([]);
                      }
                    }}
                  >
                    <FormControlLabel 
                      value="none" 
                      control={<Radio />} 
                      label={
                        <Typography variant="body1">
                          Add member without including in any expenses
                        </Typography>
                      } 
                    />
                    <FormControlLabel 
                      value="all" 
                      control={<Radio />} 
                      label={
                        <Typography variant="body1">
                          Add member to all existing expenses ({expenses.length})
                        </Typography>
                      } 
                    />
                    <FormControlLabel 
                      value="selected" 
                      control={<Radio />} 
                      label={
                        <Typography variant="body1">
                          Add member to selected expenses
                        </Typography>
                      } 
                    />
                  </RadioGroup>
                </FormControl>
                
                {expenseOption === 'selected' && (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      bgcolor: alpha(theme.palette.background.default, 0.7),
                      mb: 2,
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}
                  >
                    <FormGroup>
                      {expenses.map((expense) => (
                        <FormControlLabel
                          key={expense.id}
                          control={
                            <Checkbox
                              checked={selectedExpenses.includes(expense.id)}
                              onChange={() => handleExpenseSelection(expense.id)}
                              name={`expense-${expense.id}`}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Typography variant="body2" sx={{ mr: 2 }}>
                                {expense.description}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ${expense.amount.toFixed(2)}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </Paper>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => {
                setOpenNewMemberDialog(false);
                setExpenseOption('none');
                setSelectedExpenses([]);
                setNewMemberName('');
              }}
              sx={{ borderRadius: '50px' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember} 
              variant="contained" 
              color="primary"
              disabled={!newMemberName.trim() || (expenseOption === 'selected' && selectedExpenses.length === 0)}
              sx={{ borderRadius: '50px', px: 3 }}
            >
              Add Member
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GroupPage;