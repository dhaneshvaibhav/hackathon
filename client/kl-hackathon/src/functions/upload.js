import { API_BASE_URL } from '../config';

// API base URL
const API_URL = API_BASE_URL;

/**
 * Upload a file to the server (which uploads to Cloudinary)
 * @param {string} token - JWT access token
 * @param {File} file - The file object to upload
 * @returns {Promise<Object>} Response containing the file URL
 */
export const uploadMedia = async (token, file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Note: Do NOT set Content-Type header for FormData, 
                // let the browser set it with the correct boundary
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }

        return data; // Expected to return { url: '...', ... }
    } catch (error) {
        throw error;
    }
};
