import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleGithubCallback, handleLinkedinCallback } from '../functions/oauth';
import { Loader } from 'lucide-react';

// Use a module-level variable to track processed codes
// This persists across React Strict Mode's double-invocation/remounting
let processedCode = null;

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    
    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const token = localStorage.getItem('token');
            
            // Prevent processing the same code twice (Strict Mode fix)
            if (code && processedCode === code) {
                console.log('Already processing/processed this code, skipping...');
                return;
            }
            
            if (code) {
                processedCode = code;
            }

            if (!code) {
                setError('No authorization code received');
                setTimeout(() => navigate('/profile'), 3000);
                return;
            }

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                if (state === 'linkedin') {
                    await handleLinkedinCallback(token, code);
                    navigate('/profile', { state: { message: 'LinkedIn connected successfully!' } });
                } else {
                    // Default to GitHub for backward compatibility or explicit state
                    await handleGithubCallback(token, code);
                    navigate('/profile', { state: { message: 'GitHub connected successfully!' } });
                }
            } catch (err) {
                setError(err.message);
                setTimeout(() => navigate('/profile'), 3000);
            }
        };

        processCallback();
    }, [searchParams, navigate]);

    const getProviderName = () => {
        const state = searchParams.get('state');
        if (state === 'linkedin') return 'LinkedIn';
        return 'GitHub';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                {error ? (
                    <div className="text-red-500 mb-4">
                        <h2 className="text-xl font-bold mb-2">Connection Failed</h2>
                        <p>{error}</p>
                        <p className="text-sm text-gray-500 mt-4">Redirecting back to profile...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800">Connecting to {getProviderName()}...</h2>
                        <p className="text-gray-500 mt-2">Please wait while we complete the connection.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
