import axios from 'axios';

const API_BASE_URL = 'http://localhost:7181/api/Users'; 

export const validateUser = async (username: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/validate`, { username, password });
  return response.data;
};

export const registerUser = async (userData: Record<string, string | number>) => {
  const response = await axios.post(`${API_BASE_URL}/register`, userData);
  return response.data;
};
