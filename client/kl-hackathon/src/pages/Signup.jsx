import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { validateInstitutionalEmail } from '../functions/authValidation';
import { signupUser } from '../functions/auth';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
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
            await signupUser(formData);

            // Redirect to login or dashboard
            navigate('/login');
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
                    <UserPlus size={40} className="auth-icon" />
                    <h2>Create an Account</h2>
                    <p>Join the Club Hub today and discover your community.</p>
                </div>

                {error && <div className="auth-error" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '4px', textAlign: 'center' }}>{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">College Email Address</label>
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
                        <input type="password" id="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
                    <Link to="/" className="back-link">Return to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
