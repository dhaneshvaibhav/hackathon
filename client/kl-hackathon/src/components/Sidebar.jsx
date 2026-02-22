import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    Compass,
    Calendar,
    UserPlus,
    LayoutDashboard,
    Shield,
    MessageSquare,
    PlusCircle,
    Layout
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, user, onBecomeCreator, mode = 'standard', onNewChat, onToggleAI }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (user) {
            setIsAdmin(user.is_admin);
        } else {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const parsedUser = JSON.parse(userStr);
                    setIsAdmin(parsedUser.is_admin);
                } catch (e) {
                    console.error("Failed to parse user from local storage", e);
                }
            }
        }
    }, [user]);

    const dashboardLink = isAdmin ? '/admin' : '/dashboard';

    return (
        <>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Club Hub</h2>
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        <li>
                            <NavLink to={dashboardLink} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                {isAdmin ? <LayoutDashboard size={20} /> : <Home size={20} />}
                                <span>{isAdmin ? 'Admin Dashboard' : 'Home'}</span>
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
                            <NavLink to="/chat" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <MessageSquare size={20} />
                                <span>AI Assistant</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/profile" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <UserPlus size={20} />
                                <span>Profile</span>
                            </NavLink>
                        </li>
                        {!isAdmin && onBecomeCreator && (
                            <li>
                                <button 
                                    onClick={() => {
                                        onClose();
                                        onBecomeCreator();
                                    }} 
                                    className="nav-link" 
                                    style={{ 
                                        background: 'transparent', 
                                        border: 'none', 
                                        width: '100%', 
                                        textAlign: 'left', 
                                        cursor: 'pointer',
                                        fontSize: 'inherit',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <Shield size={20} />
                                    <span>Become Creator</span>
                                </button>
                            </li>
                        )}
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
