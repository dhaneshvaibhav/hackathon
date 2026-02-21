import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './Dashboard.css';
import { getClubs } from '../functions/club';

const Clubs = () => {
    const { searchQuery } = useOutletContext() || { searchQuery: '' };
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const data = await getClubs();
                setClubs(data);
            } catch (err) {
                setError('Failed to fetch clubs');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClubs();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading clubs...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;

    const filteredClubs = clubs.filter(club => 
        !searchQuery || 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-page">
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    {searchQuery ? `Clubs matching "${searchQuery}"` : 'Clubs'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Explore all available clubs here.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                    {filteredClubs.map(club => (
                        <div key={club.id} className="card" style={{ padding: '1.5rem' }}>
                            {club.logo_url && (
                                <img 
                                    src={club.logo_url} 
                                    alt={club.name} 
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                                />
                            )}
                            <h3 style={{ marginBottom: '0.5rem' }}>{club.name}</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{club.description}</p>
                            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                {club.category}
                            </span>
                        </div>
                    ))}
                    {filteredClubs.length === 0 && (
                        <p>No clubs found.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Clubs;
