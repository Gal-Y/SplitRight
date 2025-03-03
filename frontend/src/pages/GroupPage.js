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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Calculate as CalculateIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
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

  // New expense state
  const [openNewExpenseDialog, setOpenNewExpenseDialog] = useState(false);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpensePayer, setNewExpensePayer] = useState('');
  const [newExpenseSplitBetween, setNewExpenseSplitBetween] = useState([]);

  // New member state
  const [openNewMemberDialog, setOpenNewMemberDialog] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

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
      setNewMemberName('');
      setOpenNewMemberDialog(false);
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member. Please try again.');
    }
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 2) {
      fetchSettlements();
    }
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
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Groups
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {group.name}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Created: {new Date(group.created_at).toLocaleDateString()}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="group tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<PersonIcon />}
            label="Members"
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            icon={<ReceiptIcon />}
            label="Expenses"
            id="tab-1"
            aria-controls="tabpanel-1"
          />
          <Tab
            icon={<PaymentIcon />}
            label="Settlements"
            id="tab-2"
            aria-controls="tabpanel-2"
          />
        </Tabs>
      </Box>

      {/* Members Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewMemberDialog(true)}
          >
            Add Member
          </Button>
        </Box>

        <Grid container spacing={2}>
          {group.members.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member}>
              <Card>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{member}</Typography>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteMember(member)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Expenses Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewExpenseDialog(true)}
          >
            Add Expense
          </Button>
        </Box>

        {expenses.length === 0 ? (
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <CardContent>
              <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6">No Expenses Yet</Typography>
              <Typography variant="body2" color="text.secondary">
                Add your first expense to start tracking
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <List>
            {expenses.map((expense) => (
              <Paper key={expense.id} sx={{ mb: 2 }}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="h6">{expense.description}</Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(expense.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', my: 1 }}>
                          ${expense.amount.toFixed(2)} paid by {expense.payer}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            Split between:
                          </Typography>
                          {expense.split_between.map((person) => (
                            <Chip
                              key={person}
                              label={person}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Settlements Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CalculateIcon />}
            onClick={fetchSettlements}
          >
            Recalculate
          </Button>
        </Box>

        {settlements.length === 0 ? (
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <CardContent>
              <PaymentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6">No Settlements Needed</Typography>
              <Typography variant="body2" color="text.secondary">
                Everyone is settled up! Or you need to add some expenses first.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <List>
            {settlements.map((settlement, index) => (
              <Paper key={index} sx={{ mb: 2 }}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        {settlement.from} pays {settlement.to}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        ${settlement.amount.toFixed(2)}
                      </Typography>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </TabPanel>

      {/* New Expense Dialog */}
      <Dialog
        open={openNewExpenseDialog}
        onClose={() => setOpenNewExpenseDialog(false)}
        aria-labelledby="form-dialog-title"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">Add New Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the expense details below.
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
            >
              {group.members.map((member) => (
                <MenuItem key={member} value={member}>
                  {member}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="subtitle2" gutterBottom>
            Split between:
          </Typography>
          <FormGroup>
            {group.members.map((member) => (
              <FormControlLabel
                key={member}
                control={
                  <Checkbox
                    checked={newExpenseSplitBetween.indexOf(member) !== -1}
                    onChange={() => handleSplitBetweenChange(member)}
                    name={member}
                  />
                }
                label={member}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewExpenseDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddExpense} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Member Dialog */}
      <Dialog
        open={openNewMemberDialog}
        onClose={() => setOpenNewMemberDialog(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add New Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the name of the new member.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewMemberDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddMember} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupPage;