import { API_BASE_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/chat`;

export const sendChatMessage = async (token, message) => {
    try {
        const response = await fetch(`${API_URL}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Failed to process message');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};
