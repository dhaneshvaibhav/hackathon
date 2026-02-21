import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import '../components/Header.css';

const AdminDashboard = () => {
    return (
        <div className="admin-page" style={{ backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
            <header className="header" style={{ borderBottomColor: 'var(--primary-light)' }}>
                <div className="container header-container">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldAlert size={24} color="var(--accent)" />
                        <h1>Admin Panel</h1>
                    </div>
                    <nav className="nav-menu">
                        <ul>
                            <li><Link href="#users">Manage Users</Link></li>
                            <li><Link href="#clubs">Approve Clubs</Link></li>
                            <li><Link href="#settings">Settings</Link></li>
                        </ul>
                    </nav>
                    <div className="header-actions">
                        <Link to="/" className="btn btn-outline">
                            Return to Site
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Overall System Administration</h2>
                <p style={{ color: 'var(--text-muted)' }}>Administrative tools and analytics will be displayed here.</p>
                <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Admin Modules Placeholder</p>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
