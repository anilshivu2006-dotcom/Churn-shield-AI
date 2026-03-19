import { ChurnPrediction, Customer, DashboardMetrics } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const uploadDataset = async (file: File): Promise<{ message: string; rows: number; columns: number; accuracy: number }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload dataset');
  }
  
  return await response.json();
};

export const getAllCustomers = async (): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/customers`);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return await response.json();
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
  return await response.json();
};

export const searchCustomers = async (query: string): Promise<Customer[]> => {
  const response = await fetch(`${API_BASE_URL}/customers/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search customers');
  return await response.json();
};

export const predictChurnForCustomer = async (customerId: string): Promise<ChurnPrediction> => {
  const response = await fetch(`${API_BASE_URL}/predict/${encodeURIComponent(customerId)}`);
  if (!response.ok) throw new Error('Failed to predict churn');
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  
  return data;
};

export const retrainModel = async (): Promise<{ message: string; accuracy: number }> => {
  const response = await fetch(`${API_BASE_URL}/retrain`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to retrain model');
  return await response.json();
};