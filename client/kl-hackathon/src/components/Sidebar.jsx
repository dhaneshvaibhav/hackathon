import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    Compass,
    Calendar,
    UserPlus,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    // For demonstration, let's determine if a user is logged in based on localStorage
    const token = localStorage.getItem('token');

    return (
        <>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Club Hub</h2>
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        <li>
                            <NavLink to="/dashboard" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Home size={20} />
                                <span>Home</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/clubs" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Compass size={20} />
                                <span>Clubs</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/events" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Calendar size={20} />
                                <span>Events</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/profile" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <UserPlus size={20} />
                                <span>Profile</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <p>&copy; {new Date().getFullYear()} Collegiate Club</p>
                </div>
            </aside>
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
        </>
    );
};

export default Sidebar;
