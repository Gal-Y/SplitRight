import { v4 as uuidv4 } from 'uuid';

// Keys for localStorage
const KEYS = {
  GROUPS: 'splitright_groups',
  EXPENSES: 'splitright_expenses',
  LAST_ACTIVITY: 'splitright_last_activity',
};

// Number of days before data is considered stale (optional)
const STALE_DAYS = 30;

// Initialize storage if needed
const initializeStorageIfNeeded = () => {
  // Check if we have existing data
  const groups = localStorage.getItem(KEYS.GROUPS);
  const lastActivity = localStorage.getItem(KEYS.LAST_ACTIVITY);
  
  // If no data or data is stale, initialize fresh
  if (!groups || isDataStale(lastActivity)) {
    resetAllData();
  } else {
    // Update last activity timestamp
    updateLastActivity();
  }
};

// Check if data is stale based on last activity
const isDataStale = (lastActivityStr) => {
  if (!lastActivityStr) return true;
  
  const lastActivity = new Date(lastActivityStr);
  const now = new Date();
  const diffTime = Math.abs(now - lastActivity);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > STALE_DAYS;
};

// Update the last activity timestamp
const updateLastActivity = () => {
  localStorage.setItem(KEYS.LAST_ACTIVITY, new Date().toISOString());
};

// Reset all data (for new session)
const resetAllData = () => {
  localStorage.setItem(KEYS.GROUPS, JSON.stringify([]));
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify([]));
  updateLastActivity();
};

// Group operations
const getGroups = () => {
  updateLastActivity();
  const groups = localStorage.getItem(KEYS.GROUPS);
  return groups ? JSON.parse(groups) : [];
};

const getGroupById = (groupId) => {
  const groups = getGroups();
  return groups.find(group => group.id === groupId);
};

const saveGroup = (groupData) => {
  const groups = getGroups();
  const newGroup = {
    ...groupData,
    id: groupData.id || uuidv4(),
    created_at: groupData.created_at || new Date().toISOString()
  };
  
  const existingIndex = groups.findIndex(g => g.id === newGroup.id);
  
  if (existingIndex >= 0) {
    groups[existingIndex] = newGroup;
  } else {
    groups.push(newGroup);
  }
  
  localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
  updateLastActivity();
  return newGroup;
};

const deleteGroup = (groupId) => {
  let groups = getGroups();
  groups = groups.filter(group => group.id !== groupId);
  localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
  
  // Also delete related expenses
  let expenses = getExpenses();
  expenses = expenses.filter(expense => expense.group_id !== groupId);
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  
  updateLastActivity();
};

// Expense operations
const getExpenses = () => {
  updateLastActivity();
  const expenses = localStorage.getItem(KEYS.EXPENSES);
  return expenses ? JSON.parse(expenses) : [];
};

const getExpensesByGroupId = (groupId) => {
  const expenses = getExpenses();
  return expenses.filter(expense => expense.group_id === groupId);
};

const saveExpense = (expenseData) => {
  const expenses = getExpenses();
  const newExpense = {
    ...expenseData,
    id: expenseData.id || uuidv4(),
    date: expenseData.date || new Date().toISOString()
  };
  
  const existingIndex = expenses.findIndex(e => e.id === newExpense.id);
  
  if (existingIndex >= 0) {
    expenses[existingIndex] = newExpense;
  } else {
    expenses.push(newExpense);
  }
  
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  updateLastActivity();
  return newExpense;
};

const deleteExpense = (expenseId) => {
  let expenses = getExpenses();
  expenses = expenses.filter(expense => expense.id !== expenseId);
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  updateLastActivity();
};

// Calculate settlements for a group
const calculateSettlements = (groupId) => {
  const expenses = getExpensesByGroupId(groupId);
  const group = getGroupById(groupId);
  
  if (!group || expenses.length === 0) {
    return [];
  }
  
  // Create a balance sheet for each member
  const balances = {};
  group.members.forEach(member => {
    balances[member] = 0;
  });
  
  // Calculate what each person paid and owes
  expenses.forEach(expense => {
    const payer = expense.payer;
    const amount = expense.amount;
    const splitBetween = expense.split_between;
    const splitAmount = amount / splitBetween.length;
    
    // Add the full amount to the payer
    balances[payer] += amount;
    
    // Subtract each person's share
    splitBetween.forEach(member => {
      balances[member] -= splitAmount;
    });
  });
  
  // Generate settlements
  const settlements = [];
  const debtors = Object.entries(balances)
    .filter(([name, balance]) => balance < 0)
    .sort(([, a], [, b]) => a - b);
  
  const creditors = Object.entries(balances)
    .filter(([name, balance]) => balance > 0)
    .sort(([, a], [, b]) => b - a);
  
  let i = 0, j = 0;
  
  while (i < debtors.length && j < creditors.length) {
    const [debtor, debtAmount] = debtors[i];
    const [creditor, creditAmount] = creditors[j];
    
    const amount = Math.min(Math.abs(debtAmount), creditAmount);
    
    if (amount > 0.01) { // Ignore very small amounts
      settlements.push({
        from: debtor,
        to: creditor,
        amount: parseFloat(amount.toFixed(2))
      });
    }
    
    debtors[i] = [debtor, debtAmount + amount];
    creditors[j] = [creditor, creditAmount - amount];
    
    if (Math.abs(debtors[i][1]) < 0.01) i++;
    if (creditors[j][1] < 0.01) j++;
  }
  
  return settlements;
};

export default {
  initializeStorageIfNeeded,
  resetAllData,
  getGroups,
  getGroupById,
  saveGroup,
  deleteGroup,
  getExpenses,
  getExpensesByGroupId,
  saveExpense,
  deleteExpense,
  calculateSettlements
}; 