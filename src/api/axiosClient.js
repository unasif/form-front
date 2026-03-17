import axios from 'axios';

if (!sessionStorage.getItem('tabToken') && localStorage.getItem('token')) {
    sessionStorage.setItem('tabToken', localStorage.getItem('token'));
}

const axiosClient = axios.create({
    baseURL: "/tasks/api/",
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('tabToken') || localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('tabToken');
            sessionStorage.removeItem('tabUser');
            window.location.href = '/tasks/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;