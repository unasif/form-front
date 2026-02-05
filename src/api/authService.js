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
    const response = await axiosClient.get('/auth/users'); 
    return response.data;
};

export const updateClient = async (id, userData) => {
    const response = await axiosClient.put(`/auth/users/${id}`, userData);
    return response.data;
};

export const deleteClient = async (id) => {
    const response = await axiosClient.delete(`/auth/users/${id}`);
    return response.data;
};