import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { validateInstitutionalEmail } from '../functions/authValidation';
import { loginUser } from '../functions/auth';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!validateInstitutionalEmail(formData.email)) {
            setError('Please use your institutional or college email address (e.g., student@college.edu). Personal emails are not accepted.');
            setLoading(false);
            return;
        }

        try {
            const data = await loginUser(formData.email, formData.password);

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="form-options">
                        <label className="checkbox-container">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            Remember me
                        </label>
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
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
