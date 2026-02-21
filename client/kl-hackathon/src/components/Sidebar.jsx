import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    Info,
    Compass,
    Calendar,
    LogIn,
    LogOut,
    UserPlus,
    Menu,
    X,
    LayoutDashboard,
    Shield
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    // For demonstration, let's determine if a user is logged in based on localStorage
    const token = localStorage.getItem('token');
    // Using string 'null' parse fallback if user doesn't exist to prevent crash
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const isAdmin = user?.is_admin;

    return (
        <>
            <button className="mobile-toggle" onClick={toggleSidebar}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Club Hub</h2>
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        <li>
                            <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Home size={20} />
                                <span>Home</span>
                            </NavLink>
                        </li>

                        {token ? (
                            <>
                                <li>
                                    <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <LayoutDashboard size={20} />
                                        <span>Dashboard</span>
                                    </NavLink>
                                </li>
                                {isAdmin && (
                                    <li>
                                        <NavLink to="/admin" onClick={() => setIsOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                            <Shield size={20} />
                                            <span>Admin</span>
                                        </NavLink>
                                    </li>
                                )}
                                <li>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('user');
                                            setIsOpen(false);
                                            window.location.href = '/';
                                        }}
                                        className="nav-link"
                                        style={{ width: '100%', textAlign: 'left', background: 'none' }}
                                    >
                                        <LogOut size={20} />
                                        <span>Log Out</span>
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <NavLink to="/login" onClick={() => setIsOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <LogIn size={20} />
                                        <span>Log In</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/signup" onClick={() => setIsOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <UserPlus size={20} />
                                        <span>Sign Up</span>
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <p>&copy; {new Date().getFullYear()} Collegiate Club</p>
                </div>
            </aside>
            {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
};

export default Sidebar;
