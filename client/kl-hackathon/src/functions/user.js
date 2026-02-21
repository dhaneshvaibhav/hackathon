// Placeholder API functions for user profile operations

// API base URL - replace this with actual backend URL later
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getUserProfile = async (token) => {
    // Mock API call
    console.log('Fetching user profile...', token);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, this would be a fetch call:
    /*
    const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
    */

    // For now, return mock data from local storage if available, or static fallback
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        return JSON.parse(storedUser);
    }

    return {
        id: '1',
        name: 'John Doe',
        email: 'student@college.edu',
        role: 'student',
        bio: 'I love participating in hackathons and coding clubs.'
    };
};

export const updateUserProfile = async (token, profileData) => {
    console.log('Updating user profile...', profileData);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock updating local storage user to reflect changes
    let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    let updatedUser = { ...currentUser, ...profileData };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return {
        success: true,
        user: updatedUser
    };
};

export const deleteUserAccount = async (token) => {
    console.log('Deleting user account...');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true };
};
