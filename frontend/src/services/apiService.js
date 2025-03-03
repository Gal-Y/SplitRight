import axios from 'axios';
import localStorageService from './localStorageService';

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
const USE_LOCAL_STORAGE = process.env.REACT_APP_USE_LOCAL_STORAGE === 'true' || false;

// Helper to determine if we should use localStorage or API
const shouldUseLocalStorage = () => {
  return USE_LOCAL_STORAGE || localStorage.getItem('use_local_storage') === 'true';
};

// Set storage mode
export const setStorageMode = (useLocalStorage) => {
  localStorage.setItem('use_local_storage', useLocalStorage ? 'true' : 'false');
};

// Initialize
export const initialize = () => {
  if (shouldUseLocalStorage()) {
    localStorageService.initializeStorageIfNeeded();
  }
};

// Groups API
export const getGroups = async () => {
  if (shouldUseLocalStorage()) {
    return localStorageService.getGroups();
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/groups`);
    return response.data;
  } catch (error) {
    console.error('Error fetching groups from API:', error);
    // Fallback to localStorage if API fails
    setStorageMode(true);
    return localStorageService.getGroups();
  }
};

export const getGroupById = async (groupId) => {
  if (shouldUseLocalStorage()) {
    return localStorageService.getGroupById(groupId);
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group from API:', error);
    // Fallback to localStorage if API fails
    setStorageMode(true);
    return localStorageService.getGroupById(groupId);
  }
};

export const createGroup = async (groupData) => {
  if (shouldUseLocalStorage()) {
    return localStorageService.saveGroup(groupData);
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/groups`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating group via API:', error);
    // Fallback to localStorage if API fails
    setStorageMode(true);
    return localStorageService.saveGroup(groupData);
  }
};

export const updateGroup = async (groupData) => {
  if (shouldUseLocalStorage()) {
    return localStorageService.saveGroup(groupData);
  }
  
  try {
    const response = await axios.put(`${API_BASE_URL}/groups/${groupData.id}`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error updating group via API:', error);
    // Fallback to localStorage if API fails
    setStorageMode(true);
    return localStorageService.saveGroup(groupData);
  }
};

export const deleteGroup = async (groupId) => {
  if (shouldUseLocalStorage()) {
    return localStorageService.deleteGroup(groupId);
  }
  
  try {
    await axios.delete(`${API_BASE_URL}/groups/${groupId}`);
    return true;
  } catch (error) {
    console.error('Error deleting group via API:', error);
    // Fallback to localStorage if API fails
    setStorageMode(true);
    localStorageService.deleteGroup(groupId);
    return true;
  }
};

// Expenses API
export const getExpensesByGroupId = async (groupId) => {
  if (shouldUseLocalStorage()) {
    return localStorageService.getExpensesByGroupId(groupId);
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/expenses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses from API:', error);
    // Fallback to localStorage if API fails
    setStorageMode(true);
    return localStorageService.getExpensesByGroupId(groupId);
  }
};

export const createExpense = async (expenseData) => {
  if (shouldUseLocalStorage()) {
    return localStorageService.saveExpense(expenseData);
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/${expenseData.group_id}/expenses`, expenseData);
    return response.data;
  } catch (error) {
    console.error('Error creating expense via API:', error);
    // Fallback to localStorage if API fails
    setStorageMode(true);
    return localStorageService.saveExpense(expenseData);
  }
};

export const deleteExpense = async (groupId, expenseId) => {
  if (shouldUseLocalStorage()) {
    return localStorageService.deleteExpense(expenseId);
  }
  
  try {
    await axios.delete(`${API_BASE_URL}/groups/${groupId}/expenses/${expenseId}`);
    return true;
  } catch (error) {
    console.error('Error deleting expense via API:', error);
    // Fallback to localStorage if API fails
    setStorageMode(true);
    localStorageService.deleteExpense(expenseId);
    return true;
  }
};

// Settlements API
export const getSettlements = async (groupId) => {
  if (shouldUseLocalStorage()) {
    return localStorageService.calculateSettlements(groupId);
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/settlements`);
    return response.data;
  } catch (error) {
    console.error('Error fetching settlements from API:', error);
    // Fallback to localStorage if API fails
    setStorageMode(true);
    return localStorageService.calculateSettlements(groupId);
  }
};

// Load Generator for Kubernetes autoscaling demo
export const generateLoad = async (intensity = 1, duration = 10) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/load-test`, {
      intensity, // 1-10 scale for load intensity
      duration   // seconds to run the load test
    });
    return response.data;
  } catch (error) {
    console.error('Error generating load:', error);
    return { success: false, error: error.message };
  }
};

// Reset all data
export const resetAllData = async () => {
  if (shouldUseLocalStorage()) {
    return localStorageService.resetAllData();
  }
  
  try {
    await axios.post(`${API_BASE_URL}/reset`);
    return true;
  } catch (error) {
    console.error('Error resetting data via API:', error);
    // Fallback to localStorage reset
    localStorageService.resetAllData();
    return true;
  }
};

export default {
  initialize,
  setStorageMode,
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getExpensesByGroupId,
  createExpense,
  deleteExpense,
  getSettlements,
  generateLoad,
  resetAllData
}; 