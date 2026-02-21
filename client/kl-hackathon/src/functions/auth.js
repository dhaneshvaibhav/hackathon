import { API_BASE_URL as BASE_URL } from '../config';

const API_BASE_URL = `${BASE_URL}/auth`;

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Response data
 */
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Signup user
 * @param {Object} userData - User registration data (camelCase)
 * @returns {Promise<Object>} Response data
 */
export const signupUser = async (userData) => {
    // Map frontend camelCase to backend snake_case
    const payload = {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userData.role,
        password: userData.password
    };

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};
