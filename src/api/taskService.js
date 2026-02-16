import axiosClient from './axiosClient';

export const fetchTasks = async () => {
  const response = await axiosClient.get('/tasks/');
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