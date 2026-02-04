import axiosClient from './axiosClient';

export const loginUser = async (credentials) => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await axiosClient.post('/auth/create-user', userData);
    return response.data;
};

export const getAllClients = async () => {
    const response = await axiosClient.get('/users'); 
    return response.data;
};

export const deleteClient = async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
};