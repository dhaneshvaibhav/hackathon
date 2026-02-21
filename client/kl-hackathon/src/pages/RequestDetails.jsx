import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestDetails, handleClubRequest } from '../functions/club';
import { ArrowLeft, User, Github, Check, X } from 'lucide-react';
import './Dashboard.css';

const RequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchRequest = async () => {
            const token = localStorage.getItem('token');
            try {
                const data = await getRequestDetails(token, id);
                setRequest(data);
            } catch (err) {
                setError('Failed to fetch request details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [id]);

    const onHandleRequest = async (status) => {
        const token = localStorage.getItem('token');
        setProcessing(true);
        try {
            await handleClubRequest(token, id, status, '');
            // Update local state
            setRequest(prev => ({ ...prev, status }));
            alert(`Request ${status} successfully`);
        } catch (err) {
            console.error('Failed to handle request', err);
            alert('Failed to update request');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="spinner"></div>
        </div>
    );

    if (error) return (
        <div className="dashboard-page">
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <button 
                    onClick={() => navigate(-1)}
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
                    borderRadius: '8px'
                }}>
                    {error}
                </div>
            </main>
        </div>
    );

    if (!request) return null;

    const { user_details, club_name, role, message, status } = request;
    const githubAccount = user_details.oauth_accounts.find(acc => acc.provider === 'github');

    return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary"
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="card" style={{ padding: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        Request Details
                    </h1>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>User Information</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '50%' }}>
                                    <User size={32} color="#4f46e5" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user_details.name}</h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{user_details.email}</p>
                                </div>
                            </div>
                            {user_details.bio && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Bio:</strong>
                                    <p style={{ marginTop: '0.5rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                                        {user_details.bio}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Request Information</h2>
                            <p><strong>Club:</strong> {club_name}</p>
                            <p><strong>Role Requested:</strong> {role}</p>
                            <p><strong>Status:</strong> 
                                <span style={{ 
                                    marginLeft: '0.5rem',
                                    fontWeight: 'bold',
                                    color: status === 'accepted' ? 'green' : status === 'rejected' ? 'red' : 'orange'
                                }}>
                                    {status.toUpperCase()}
                                </span>
                            </p>
                            {message && (
                                <div style={{ marginTop: '1rem' }}>
                                    <strong>Message:</strong>
                                    <p style={{ marginTop: '0.5rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px', fontStyle: 'italic' }}>
                                        "{message}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Github size={24} /> GitHub Activity
                        </h2>
                        
                        {githubAccount ? (
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <img 
                                        src={githubAccount.meta_data.avatar_url} 
                                        alt="GitHub Avatar" 
                                        style={{ width: '64px', height: '64px', borderRadius: '50%' }}
                                    />
                                    <div>
                                        <h3 style={{ margin: 0 }}>
                                            <a href={githubAccount.meta_data.html_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                {githubAccount.meta_data.login}
                                            </a>
                                        </h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>ID: {githubAccount.provider_user_id}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                    <StatCard label="Public Repos" value={githubAccount.meta_data?.public_repos || 0} />
                                    <StatCard label="Followers" value={githubAccount.meta_data?.followers || 0} />
                                    <StatCard label="Following" value={githubAccount.meta_data?.following || 0} />
                                    <StatCard label="Public Gists" value={githubAccount.meta_data?.public_gists || 0} />
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                User has not connected their GitHub account.
                            </p>
                        )}
                    </div>

                    {status === 'pending' && (
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => onHandleRequest('accepted')}
                                disabled={processing}
                                style={{
                                    backgroundColor: 'var(--success)',
                                    color: 'white',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    opacity: processing ? 0.7 : 1
                                }}
                            >
                                <Check size={20} /> Accept Request
                            </button>
                            <button 
                                onClick={() => onHandleRequest('rejected')}
                                disabled={processing}
                                style={{
                                    backgroundColor: 'var(--error)',
                                    color: 'white',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    opacity: processing ? 0.7 : 1
                                }}
                            >
                                <X size={20} /> Reject Request
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{value}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
);

export default RequestDetails;
