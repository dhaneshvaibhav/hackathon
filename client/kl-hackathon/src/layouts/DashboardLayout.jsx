import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
