/**
 * Validates whether an email address belongs to a recognized institution.
 * It rejects common public email providers (Gmail, Yahoo, etc.) and ensures
 * the basic structure of an email is valid.
 * 
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if valid, false otherwise.
 */
export const validateInstitutionalEmail = (email) => {
    const publicDomains = [
        '@gmail.com',
        '@yahoo.com',
        '@hotmail.com',
        '@outlook.com',
        '@icloud.com',
        '@aol.com'
    ];

    const isPublicDomain = publicDomains.some(domain => email.toLowerCase().endsWith(domain));

    if (isPublicDomain) {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
