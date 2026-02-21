import { API_BASE_URL } from '../config';

export const getAnnouncements = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/announcements/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch announcements');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching announcements:', error);
        throw error;
    }
};

export const getEventAnnouncements = async (eventId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/announcements/event/${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch announcements');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching event announcements:', error);
        throw error;
    }
};
