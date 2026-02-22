import axiosClient from './axiosClient';

export const fetchTasks = async () => {
  const response = await axiosClient.get('/tasks/');
  return response.data;
};

export const createTaskApi = async (formData, config = {}) => {
    const response = await axiosClient.post('/tasks/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        ...config
    });
    return response.data;
};

export const createGuestTaskApi = async (formData, config = {}) => {
    const response = await axiosClient.post('/tasks/guest', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        ...config
    });
    return response.data;
};

export const updateTaskApi = async (taskId, formData) => {
    const response = await axiosClient.put(`/tasks/${taskId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};