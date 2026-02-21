import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="main-wrapper">
                <header className="dashboard-header">
                    <div className="header-left">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="menu-btn">
                            <Menu size={24} />
                        </button>
                        <h2>Club Hub</h2>
                    </div>
                    
                    <div className="header-center">
                        <div className="search-bar">
                            <Search size={18} className="search-icon" />
                            <input type="text" placeholder="Search..." />
                        </div>
                    </div>

                    <div className="header-right">
                        <button className="notification-btn">
                            <Bell size={24} />
                            <span className="notification-badge">3</span>
                        </button>
                    </div>
                </header>
                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
