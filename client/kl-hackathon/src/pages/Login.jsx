import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { validateInstitutionalEmail } from '../functions/authValidation';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!validateInstitutionalEmail(email)) {
            setError('Please use your institutional or college email address (e.g., student@college.edu). Personal emails are not accepted.');
            return;
        }

        // Just mock routing for now based on email prefix, actual auth needed later
        if (email.startsWith('admin')) {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <LogIn size={40} className="auth-icon" />
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to access your account.</p>
                </div>

                {error && <div className="auth-error" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '4px', textAlign: 'center' }}>{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="student@college.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="••••••••" required />
                    </div>

                    <div className="form-options">
                        <label className="checkbox-container">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            Remember me
                        </label>
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn">Sign In</button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/signup" className="auth-link">Create one</Link></p>
                    <Link to="/" className="back-link">Return to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
