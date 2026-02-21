import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

const handleResponse = async (response, errorMessage) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || errorMessage);
    }
    return data;
};

export const connectGithub = async (token) => {
    try {
        const response = await fetch(`${API_URL}/oauth/github/connect`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return handleResponse(response, 'Failed to initiate GitHub connection');
    } catch (error) {
        throw error;
    }
};

export const handleGithubCallback = async (token, code) => {
    try {
        const response = await fetch(`${API_URL}/oauth/github/callback`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        return handleResponse(response, 'Failed to connect GitHub account');
    } catch (error) {
        throw error;
    }
};

export const disconnectGithub = async (token) => {
    try {
        const response = await fetch(`${API_URL}/oauth/github/disconnect`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return handleResponse(response, 'Failed to disconnect GitHub account');
    } catch (error) {
        throw error;
    }
};

export const connectLinkedin = async (token) => {
    try {
        const response = await fetch(`${API_URL}/oauth/linkedin/connect`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return handleResponse(response, 'Failed to initiate LinkedIn connection');
    } catch (error) {
        throw error;
    }
};

export const handleLinkedinCallback = async (token, code) => {
    try {
        const response = await fetch(`${API_URL}/oauth/linkedin/callback`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        return handleResponse(response, 'Failed to connect LinkedIn account');
    } catch (error) {
        throw error;
    }
};

export const disconnectLinkedin = async (token) => {
    try {
        const response = await fetch(`${API_URL}/oauth/linkedin/disconnect`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return handleResponse(response, 'Failed to disconnect LinkedIn account');
    } catch (error) {
        throw error;
    }
};
