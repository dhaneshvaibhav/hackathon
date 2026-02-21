import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const AdminDashboard = () => {
    return (
        <div className="admin-page" style={{ backgroundColor: '#f0f4f8', minHeight: '100vh' }}>


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
