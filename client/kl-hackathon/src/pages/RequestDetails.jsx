import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestDetails, handleClubRequest, getClubRequestRepos } from '../functions/club';
import { ArrowLeft, User, Github, Check, X, Star, GitBranch, Code, Linkedin, ChevronDown, ChevronUp, Users, Building, Calendar } from 'lucide-react';
import './Dashboard.css';

const AccordionItem = ({ title, icon: Icon, children, isOpen, onToggle, color = 'var(--text-main)' }) => {
    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
            <button 
                onClick={onToggle}
                style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    background: isOpen ? '#f8fafc' : 'white',
                    border: 'none',
                    borderBottom: isOpen ? '1px solid #e2e8f0' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: '600', color: color }}>
                    {Icon && <Icon size={24} />}
                    {title}
                </div>
                {isOpen ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
            </button>
            
            {isOpen && (
                <div style={{ padding: '1.5rem', background: 'white' }}>
                    {children}
                </div>
            )}
        </div>
    );
};

const RequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [openSection, setOpenSection] = useState(null); // 'github' or 'linkedin'

    useEffect(() => {
        const fetchRepos = async (token) => {
            setLoadingRepos(true);
            try {
                const data = await getClubRequestRepos(token, id);
                if (data && Array.isArray(data)) {
                    setRepos(data);
                }
            } catch (err) {
                console.error("Failed to fetch repos", err);
            } finally {
                setLoadingRepos(false);
            }
        };

        const fetchRequest = async () => {
            const token = localStorage.getItem('token');
            try {
                const data = await getRequestDetails(token, id);
                setRequest(data);
                
                // Fetch repos if user has github
                if (data.user_details.oauth_accounts.find(acc => acc.provider === 'github')) {
                    fetchRepos(token);
                }
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
    const linkedinAccount = user_details.oauth_accounts.find(acc => acc.provider === 'linkedin');

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
                            <Users size={24} /> Social Profiles
                        </h2>
                        
                        {/* GitHub Section */}
                        {githubAccount ? (
                            <AccordionItem 
                                title="GitHub Profile" 
                                icon={Github} 
                                color="#333"
                                isOpen={openSection === 'github'}
                                onToggle={() => setOpenSection(openSection === 'github' ? null : 'github')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {githubAccount.meta_data?.avatar_url && (
                                        <img 
                                            src={githubAccount.meta_data.avatar_url} 
                                            alt="GitHub Avatar" 
                                            style={{ width: '64px', height: '64px', borderRadius: '50%' }}
                                        />
                                    )}
                                    <div>
                                        <h3 style={{ margin: 0 }}>
                                            <a href={githubAccount.meta_data?.html_url || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                {githubAccount.meta_data?.login || 'GitHub User'}
                                            </a>
                                        </h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>ID: {githubAccount.provider_user_id}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <StatCard label="Public Repos" value={githubAccount.meta_data?.public_repos || 0} />
                                    <StatCard label="Followers" value={githubAccount.meta_data?.followers || 0} />
                                    <StatCard label="Following" value={githubAccount.meta_data?.following || 0} />
                                    <StatCard label="Public Gists" value={githubAccount.meta_data?.public_gists || 0} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <DetailRow label="Name" value={githubAccount.meta_data?.name} />
                                    <DetailRow label="Company" value={githubAccount.meta_data?.company} />
                                    <DetailRow label="Blog" value={githubAccount.meta_data?.blog} isLink={true} />
                                    <DetailRow label="Location" value={githubAccount.meta_data?.location} />
                                    <DetailRow label="Email" value={githubAccount.meta_data?.email} />
                                    <DetailRow label="Twitter" value={githubAccount.meta_data?.twitter_username} />
                                    <DetailRow label="Hireable" value={githubAccount.meta_data?.hireable ? 'Yes' : 'No'} />
                                    <DetailRow label="Type" value={githubAccount.meta_data?.type} />
                                    <DetailRow label="Site Admin" value={githubAccount.meta_data?.site_admin ? 'Yes' : 'No'} />
                                    <DetailRow label="Joined GitHub" value={formatDate(githubAccount.meta_data?.created_at)} />
                                    <DetailRow label="Last Updated" value={formatDate(githubAccount.meta_data?.updated_at)} />
                                </div>

                                {githubAccount.meta_data?.bio && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>GitHub Bio</strong>
                                        <p style={{ margin: 0, background: '#f1f5f9', padding: '0.75rem', borderRadius: '6px', fontSize: '0.95rem' }}>
                                            {githubAccount.meta_data.bio}
                                        </p>
                                    </div>
                                )}

                                <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                                        Repositories
                                    </h3>
                                    
                                    {loadingRepos ? (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <div className="spinner" style={{ width: '30px', height: '30px', margin: '0 auto', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5' }}></div>
                                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading repositories...</p>
                                        </div>
                                    ) : repos.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                            {repos.map(repo => (
                                                <RepoCard key={repo.id} repo={repo} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No public repositories found.</p>
                                    )}
                                </div>
                            </AccordionItem>
                        ) : (
                            <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Github size={20} /> User has not connected their GitHub account.
                            </div>
                        )}

                        {/* LinkedIn Section */}
                        {linkedinAccount ? (
                            <AccordionItem 
                                title="LinkedIn Profile" 
                                icon={Linkedin} 
                                color="#0077b5"
                                isOpen={openSection === 'linkedin'}
                                onToggle={() => setOpenSection(openSection === 'linkedin' ? null : 'linkedin')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {linkedinAccount.meta_data?.picture && (
                                        <img 
                                            src={linkedinAccount.meta_data.picture} 
                                            alt="LinkedIn Avatar" 
                                            style={{ width: '64px', height: '64px', borderRadius: '50%' }}
                                        />
                                    )}
                                    <div>
                                        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>
                                            {linkedinAccount.meta_data?.name || 'LinkedIn User'}
                                        </h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>ID: {linkedinAccount.provider_user_id}</p>
                                        {linkedinAccount.meta_data?.email && (
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{linkedinAccount.meta_data.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <StatCard label="Network Size" value={linkedinAccount.meta_data?.network_size || 0} />
                                    {/* Add more stats if available */}
                                </div>

                                {/* Organizations */}
                                {linkedinAccount.meta_data?.orgs && linkedinAccount.meta_data.orgs.length > 0 && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                            <Building size={18} /> Organizations
                                        </h4>
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {linkedinAccount.meta_data.orgs.map((org, index) => (
                                                <div key={index} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ fontWeight: '600' }}>{org.role || 'Member'}</div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{org.organizationName || 'Unknown Organization'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Events */}
                                {linkedinAccount.meta_data?.events && linkedinAccount.meta_data.events.length > 0 ? (
                                    <div>
                                        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                            <Calendar size={18} /> Events Hosted
                                        </h4>
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {linkedinAccount.meta_data.events.map((event, index) => (
                                                <div key={index} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ fontWeight: '600' }}>{event.role || 'Organizer'}</div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>URN: {event.urn}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                        No events hosted found.
                                    </div>
                                )}
                            </AccordionItem>
                        ) : (
                            <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Linkedin size={20} /> User has not connected their LinkedIn account.
                            </div>
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

const DetailRow = ({ label, value, isLink = false }) => {
    if (!value) return null;
    return (
        <div style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            {isLink ? (
                <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>
                    {value}
                </a>
            ) : (
                <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{value}</span>
            )}
        </div>
    );
};

const RepoCard = ({ repo }) => (
    <div style={{ 
        padding: '1rem', 
        border: '1px solid #e2e8f0', 
        borderRadius: '6px', 
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        height: '100%',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none', fontSize: '1rem', wordBreak: 'break-all' }}>
                {repo.name}
            </a>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Stars">
                    <Star size={14} /> {repo.stargazers_count}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Forks">
                    <GitBranch size={14} /> {repo.forks_count}
                </span>
            </div>
        </div>
        
        {repo.description && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={repo.description}>
                {repo.description}
            </p>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            {repo.language ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Code size={14} /> {repo.language}
                </span>
            ) : <span></span>}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {new Date(repo.updated_at).toLocaleDateString()}
            </span>
        </div>
    </div>
);

export default RequestDetails;
