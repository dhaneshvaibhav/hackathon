import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import '../components/Header.css'; // Reusing header styles for now

const Dashboard = () => {
    return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <header className="header">
                <div className="container header-container">
                    <div className="logo">
                        <h1>Student Dashboard</h1>
                    </div>
                    <nav className="nav-menu">
                        <ul>
                            <li><Link href="#my-clubs">My Clubs</Link></li>
                            <li><Link href="#events">Upcoming Events</Link></li>
                            <li><Link href="#discover">Discover</Link></li>
                        </ul>
                    </nav>
                    <div className="header-actions">
                        <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <LogOut size={16} /> Logout
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to your Dashboard</h2>
                <p style={{ color: 'var(--text-muted)' }}>We are currently building this section. Content will appear here soon.</p>
                <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Dashboard Modules Placeholder</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
