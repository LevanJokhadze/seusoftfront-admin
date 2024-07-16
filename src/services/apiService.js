import axios from 'axios';

const API_BASE_URL = 'https://api.example.com';

export const getData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const addItem = async (item) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/data`, item);
    return response.data;
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
};

export const updateItem = async (id, item) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/data/${id}`, item);
    return response.data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/data/${id}`);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};
