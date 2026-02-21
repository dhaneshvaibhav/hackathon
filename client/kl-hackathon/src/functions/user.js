// API base URL - replace this with actual backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get current user profile
 * @param {string} token - JWT access token
 * @returns {Promise<Object>} User data
 */
export const getUserProfile = async (token) => {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle specific errors
            if (response.status === 401) {
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(data.error || 'Failed to fetch profile');
        }

        // Backend returns user object directly or wrapped?
        // Controller returns: jsonify(user.to_dict())
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user profile
 * @param {string} token - JWT access token
 * @param {Object} profileData - Data to update (name, bio, etc.)
 * @returns {Promise<Object>} Response object containing updated user
 */
export const updateUserProfile = async (token, profileData) => {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update profile');
        }

        // Backend returns: { message: '...', user: {...} }
        // Frontend expects: { user: {...} } (based on Profile.jsx usage: setUser(response.user))
        
        // Update local storage to keep it in sync
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const currentUser = JSON.parse(storedUser);
            const updatedUser = { ...currentUser, ...data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        return data; // Returns { message, user }
    } catch (error) {
        throw error;
    }
};

/**
 * Delete user account
 * @param {string} token - JWT access token
 * @returns {Promise<Object>} Success message
 */
export const deleteUserAccount = async (token) => {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete account');
        }

        return data;
    } catch (error) {
        throw error;
    }
};
