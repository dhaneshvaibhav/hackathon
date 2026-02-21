import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, X, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import { getClub, updateClub } from '../functions/club';
import { getUserProfile } from '../functions/user';
import { uploadMedia } from '../functions/upload';
import './Dashboard.css';

const EditClub = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        logo_url: '',
        roles: []
    });
    
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const [clubData, userData] = await Promise.all([
                    getClub(id, token),
                    getUserProfile(token)
                ]);

                if (clubData.owner_id !== userData.id) {
                    setError('You do not have permission to edit this club');
                    setLoading(false);
                    return;
                }

                setFormData({
                    name: clubData.name || '',
                    description: clubData.description || '',
                    category: clubData.category || '',
                    logo_url: clubData.logo_url || '',
                    roles: clubData.roles || []
                });
            } catch (err) {
                setError('Failed to fetch club details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');

        const token = localStorage.getItem('token');
        try {
            const result = await uploadMedia(token, file);
            setFormData(prev => ({
                ...prev,
                logo_url: result.url
            }));
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Failed to upload image: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleAddRole = () => {
        if (!newRole.trim()) return;
        if (formData.roles.includes(newRole.trim())) {
            alert('Role already exists');
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            roles: [...prev.roles, newRole.trim()]
        }));
        setNewRole('');
    };

    const handleRemoveRole = (roleToRemove) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.filter(role => role !== roleToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMessage('');

        const token = localStorage.getItem('token');
        try {
            await updateClub(token, id, formData);
            setSuccessMessage('Club updated successfully!');
            setTimeout(() => {
                navigate(`/clubs/${id}`);
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to update club');
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="spinner"></div>
        </div>
    );

    if (error && !formData.name) return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <button 
                    onClick={() => navigate(`/clubs/${id}`)}
                    className="btn-secondary"
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    color: '#991b1b',
                    backgroundColor: '#fee2e2',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {error}
                </div>
            </main>
        </div>
    );

    return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button 
                        onClick={() => navigate(`/clubs/${id}`)}
                        className="btn-ghost"
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            color: 'var(--text-muted)',
                            marginBottom: '1rem',
                            padding: '0.5rem 0',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Club
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Edit Club</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Update your club's profile and manage settings.</p>
                </div>

                <div className="card" style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                        {error && (
                            <div style={{ 
                                backgroundColor: '#fee2e2', 
                                color: '#991b1b', 
                                padding: '1rem', 
                                borderRadius: '8px', 
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div style={{ 
                                backgroundColor: '#dcfce7', 
                                color: '#166534', 
                                padding: '1rem', 
                                borderRadius: '8px', 
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}>
                                <Save size={18} />
                                {successMessage}
                            </div>
                        )}

                        {/* Logo Upload Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: 'var(--text-main)' }}>Club Logo</label>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    width: '120px', 
                                    height: '120px', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden', 
                                    backgroundColor: '#f1f5f9',
                                    border: '2px dashed #cbd5e1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {formData.logo_url ? (
                                        <img 
                                            src={formData.logo_url} 
                                            alt="Club Logo" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <ImageIcon size={32} color="#94a3b8" />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                            disabled={uploading}
                                        />
                                        <label 
                                            htmlFor="logo-upload"
                                            className="btn-secondary"
                                            style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '0.5rem', 
                                                cursor: uploading ? 'not-allowed' : 'pointer',
                                                opacity: uploading ? 0.7 : 1
                                            }}
                                        >
                                            {uploading ? <Loader size={16} className="spin" /> : <Upload size={16} />}
                                            {uploading ? 'Uploading...' : 'Upload New Logo'}
                                        </label>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                        Recommended size: 400x400px. Supported formats: JPG, PNG.
                                        <br />
                                        Max file size: 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>Club Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                    style={{ width: '100%' }}
                                    placeholder="e.g. Coding Club"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="input-field"
                                    style={{ width: '100%' }}
                                    placeholder="e.g. Technology"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field"
                                rows="6"
                                style={{ width: '100%', resize: 'vertical', minHeight: '120px' }}
                                placeholder="Describe your club's mission and activities..."
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>Club Roles</label>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Define roles that members can apply for (e.g., Vice President, Event Coordinator).
                            </p>
                            
                            <div style={{ 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '8px', 
                                padding: '1rem',
                                backgroundColor: '#f8fafc'
                            }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        placeholder="Add a new role..."
                                        className="input-field"
                                        style={{ flex: 1 }}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddRole}
                                        className="btn-primary"
                                        style={{ padding: '0 1rem' }}
                                        disabled={!newRole.trim()}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {formData.roles.length === 0 && (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No custom roles added yet.</p>
                                    )}
                                    {formData.roles.map((role, index) => (
                                        <div key={index} style={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #e2e8f0',
                                            padding: '0.5rem 0.75rem', 
                                            borderRadius: '6px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-main)',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}>
                                            {role}
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveRole(role)}
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    cursor: 'pointer', 
                                                    padding: '2px', 
                                                    display: 'flex', 
                                                    color: '#94a3b8',
                                                    borderRadius: '50%'
                                                }}
                                                className="hover-bg-gray"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            gap: '1rem', 
                            borderTop: '1px solid var(--border-color)', 
                            paddingTop: '1.5rem',
                            marginTop: '2rem'
                        }}>
                            <button 
                                type="button" 
                                onClick={() => navigate(`/clubs/${id}`)}
                                className="btn-secondary"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={saving || uploading}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '140px', justifyContent: 'center' }}
                            >
                                {saving ? (
                                    <>
                                        <Loader size={18} className="spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditClub;
