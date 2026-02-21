const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${BASE_URL}/events`;

export const getEvents = async () => {
    try {
        const response = await fetch(`${API_URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getEvent = async (eventId) => {
    try {
        const response = await fetch(`${API_URL}/${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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

export const deleteEvent = async (token, eventId) => {
    try {
        const response = await fetch(`${API_URL}/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Failed to delete event');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};
