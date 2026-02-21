import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit2, Trash2, Save, X, Github, Linkedin, Twitter, Instagram } from 'lucide-react';
import { getUserProfile, updateUserProfile, deleteUserAccount } from '../functions/user';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        social_media: {
            github: '',
            linkedin: '',
            twitter: '',
            instagram: ''
        }
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
                    bio: userData.bio || '',
                    social_media: {
                        github: userData.social_media?.github || '',
                        linkedin: userData.social_media?.linkedin || '',
                        twitter: userData.social_media?.twitter || '',
                        instagram: userData.social_media?.instagram || ''
                    }
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

    const handleSocialChange = (e) => {
        setEditForm({
            ...editForm,
            social_media: {
                ...editForm.social_media,
                [e.target.name]: e.target.value
            }
        });
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <div className="profile-page" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--primary)' }}>Your Profile</h1>

                {error && <div style={{ backgroundColor: '#fee2e2', color: 'red', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

                <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
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

                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Social Media Links</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        <Github size={16} /> GitHub
                                    </label>
                                    <input
                                        type="url"
                                        name="github"
                                        value={editForm.social_media.github}
                                        onChange={handleSocialChange}
                                        placeholder="https://github.com/username"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        <Linkedin size={16} /> LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={editForm.social_media.linkedin}
                                        onChange={handleSocialChange}
                                        placeholder="https://linkedin.com/in/username"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        <Twitter size={16} /> Twitter / X
                                    </label>
                                    <input
                                        type="url"
                                        name="twitter"
                                        value={editForm.social_media.twitter}
                                        onChange={handleSocialChange}
                                        placeholder="https://twitter.com/username"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        <Instagram size={16} /> Instagram
                                    </label>
                                    <input
                                        type="url"
                                        name="instagram"
                                        value={editForm.social_media.instagram}
                                        onChange={handleSocialChange}
                                        placeholder="https://instagram.com/username"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', justifyContent: 'center' }}>
                                    <Save size={18} /> Save Changes
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', justifyContent: 'center' }}>
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
                                        backgroundColor: user?.is_admin ? '#fef3c7' : '#e0e7ff',
                                        color: user?.is_admin ? '#92400e' : '#3730a3',
                                        borderRadius: '20px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>
                                        {user?.is_admin ? 'Club Leader' : 'Student'}
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

                                {/* Social Media Display */}
                                {user?.social_media && (user.social_media.github || user.social_media.linkedin || user.social_media.twitter || user.social_media.instagram) && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Social Links</strong>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            {user.social_media.github && (
                                                <a href={user.social_media.github} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#24292e', padding: '0.5rem 1rem', backgroundColor: '#f6f8fa', borderRadius: '20px', fontSize: '0.9rem', textDecoration: 'none' }}>
                                                    <Github size={16} /> GitHub
                                                </a>
                                            )}
                                            {user.social_media.linkedin && (
                                                <a href={user.social_media.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0077b5', padding: '0.5rem 1rem', backgroundColor: '#e8f4f9', borderRadius: '20px', fontSize: '0.9rem', textDecoration: 'none' }}>
                                                    <Linkedin size={16} /> LinkedIn
                                                </a>
                                            )}
                                            {user.social_media.twitter && (
                                                <a href={user.social_media.twitter} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1da1f2', padding: '0.5rem 1rem', backgroundColor: '#e8f5fe', borderRadius: '20px', fontSize: '0.9rem', textDecoration: 'none' }}>
                                                    <Twitter size={16} /> Twitter
                                                </a>
                                            )}
                                            {user.social_media.instagram && (
                                                <a href={user.social_media.instagram} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e1306c', padding: '0.5rem 1rem', backgroundColor: '#fcebf0', borderRadius: '20px', fontSize: '0.9rem', textDecoration: 'none' }}>
                                                    <Instagram size={16} /> Instagram
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
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
