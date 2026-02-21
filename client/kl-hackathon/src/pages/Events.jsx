import React from 'react';
import './Dashboard.css';

const Events = () => {
    return (
        <div className="dashboard-page">
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    Events
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Upcoming events will be listed here.</p>
                {/* Add events list content here */}
            </main>
        </div>
    );
};

export default Events;
