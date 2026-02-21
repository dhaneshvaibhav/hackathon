import { API_BASE_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/clubs`;

export const getClubs = async (token = null) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/`, {
            method: 'GET',
            headers: headers,
        });
        if (!response.ok) throw new Error('Failed to fetch clubs');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getClub = async (clubId, token = null) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/${clubId}`, {
            method: 'GET',
            headers: headers,
        });
        if (!response.ok) throw new Error('Failed to fetch club');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getManagedClubs = async (token) => {
    try {
        const response = await fetch(`${API_URL}/managed`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) throw new Error('Failed to fetch managed clubs');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createClub = async (token, clubData) => {
    try {
        const response = await fetch(`${API_URL}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(clubData)
        });
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Failed to create club');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateClub = async (token, clubId, clubData) => {
    try {
        const response = await fetch(`${API_URL}/${clubId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(clubData)
        });
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Failed to update club');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteClub = async (token, clubId) => {
    try {
        const response = await fetch(`${API_URL}/${clubId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Failed to delete club');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const requestJoinClub = async (token, clubId, message, role) => {
    try {
        const response = await fetch(`${API_URL}/${clubId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message, role })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to join club');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getClubRequests = async (token, clubId) => {
    try {
        const response = await fetch(`${API_URL}/${clubId}/requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Failed to fetch requests');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const handleClubRequest = async (token, requestId, status, adminResponse) => {
    try {
        const response = await fetch(`${API_URL}/requests/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, admin_response: adminResponse })
        });
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Failed to update request');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getMyRequests = async (token) => {
    try {
        const response = await fetch(`${API_URL}/my-requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) throw new Error('Failed to fetch my requests');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};
