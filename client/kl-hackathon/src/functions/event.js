import { API_BASE_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/events`;

export const getEvents = async (token = null) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_URL}`, {
            method: 'GET',
            headers: headers,
        });
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getEvent = async (eventId, token = null) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_URL}/${eventId}`, {
            method: 'GET',
            headers: headers,
        });
        if (!response.ok) throw new Error('Failed to fetch event');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createEvent = async (token, eventData) => {
    try {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Failed to create event');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateEvent = async (token, eventId, eventData) => {
    try {
        const response = await fetch(`${API_URL}/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Failed to update event');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createAnnouncement = async (token, eventId, announcementData) => {
    try {
        const response = await fetch(`${BASE_URL}/announcements/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                event_id: eventId,
                ...announcementData
            })
        });
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Failed to create announcement');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};
