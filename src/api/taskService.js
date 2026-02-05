import axiosClient from './axiosClient';

export const fetchTasks = async () => {
  const response = await axiosClient.get('/tasks/');
  return response.data;
};
