import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const connectGithub = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/oauth/github/connect`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to initiate GitHub connection');
    }
};

export const handleGithubCallback = async (token, code) => {
    try {
        const response = await axios.post(`${API_URL}/oauth/github/callback`, 
            { code },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to connect GitHub account');
    }
};

export const disconnectGithub = async (token) => {
    try {
        const response = await axios.delete(`${API_URL}/oauth/github/disconnect`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to disconnect GitHub account');
    }
};
