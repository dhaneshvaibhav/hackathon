import React from 'react';
import './Dashboard.css';

const Clubs = () => {
    return (
        <div className="dashboard-page">
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    Clubs
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Explore all available clubs here.</p>
                {/* Add club list content here */}
            </main>
        </div>
    );
};

export default Clubs;
