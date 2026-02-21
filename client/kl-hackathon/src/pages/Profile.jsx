import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit2, Trash2, Save, X } from 'lucide-react';
import { getUserProfile, updateUserProfile, deleteUserAccount } from '../functions/user';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const userData = await getUserProfile(token);
                setUser(userData);
                setEditForm({
                    name: userData.name || '',
                    bio: userData.bio || ''
                });
            } catch (err) {
                setError('Failed to load profile. Please login again.');
                localStorage.removeItem('token');
                setTimeout(() => navigate('/login'), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await updateUserProfile(token, editForm);
            setUser(response.user);
            setIsEditing(false);
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            const token = localStorage.getItem('token');
            try {
                await deleteUserAccount(token);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/');
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <div className="profile-page" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--primary)' }}>Your Profile</h1>

                {error && <div style={{ backgroundColor: '#fee2e2', color: 'red', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

                <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                            <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.75rem', borderRadius: '50%', display: 'flex' }}>
                                <User size={24} />
                            </div>
                            Personal Information
                        </h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdate}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Bio</label>
                                <textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', minHeight: '120px', fontSize: '1rem', resize: 'vertical' }}
                                    placeholder="Tell us a bit about yourself..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Save size={18} /> Save Changes
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <X size={18} /> Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                <div>
                                    <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</strong>
                                    <p style={{ fontSize: '1.125rem', margin: 0, fontWeight: 500 }}>{user?.name}</p>
                                </div>

                                <div>
                                    <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</strong>
                                    <p style={{ fontSize: '1.125rem', margin: 0 }}>{user?.email}</p>
                                </div>

                                <div>
                                    <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</strong>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.35rem 0.85rem',
                                        backgroundColor: user?.role === 'admin' ? '#fef3c7' : '#e0e7ff',
                                        color: user?.role === 'admin' ? '#92400e' : '#3730a3',
                                        borderRadius: '20px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>
                                        {user?.role === 'admin' ? 'Club Leader' : 'Student'}
                                    </span>
                                </div>

                                <div style={{ marginTop: '0.5rem' }}>
                                    <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bio</strong>
                                    <p style={{
                                        fontStyle: user?.bio ? 'normal' : 'italic',
                                        color: user?.bio ? 'inherit' : '#9ca3af',
                                        lineHeight: 1.6,
                                        margin: 0,
                                        backgroundColor: '#f9fafb',
                                        padding: '1rem',
                                        borderRadius: '6px'
                                    }}>
                                        {user?.bio || 'You have not added a bio yet. Click Edit Profile to add one.'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #eee', marginTop: '3rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={handleDelete} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <Trash2 size={18} /> Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Profile;
