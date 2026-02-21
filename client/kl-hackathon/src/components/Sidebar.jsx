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
                    <h2>{mode === 'ai' ? 'AI Chat' : 'Club Hub'}</h2>
                    {onToggleAI && (
                        <button 
                            onClick={onToggleAI}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent)',
                                transition: 'all 0.2s'
                            }}
                            title={mode === 'ai' ? "Switch to Standard View" : "Switch to AI Chat"}
                        >
                            {mode === 'ai' ? <Layout size={20} /> : <MessageSquare size={20} />}
                        </button>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {mode === 'ai' ? (
                        <ul className="nav-list">
                             <li>
                                <button 
                                    onClick={() => {
                                        onClose();
                                        if (onNewChat) onNewChat();
                                    }} 
                                    className="nav-link" 
                                    style={{ 
                                        background: 'transparent', 
                                        border: 'none', 
                                        width: '100%', 
                                        textAlign: 'left', 
                                        cursor: 'pointer',
                                        fontSize: 'inherit',
                                        fontFamily: 'inherit',
                                        color: '#646cff'
                                    }}
                                >
                                    <PlusCircle size={20} />
                                    <span>New Chat</span>
                                </button>
                            </li>
                            {/* Mock History */}
                            <li>
                                <div className="nav-section-title" style={{padding: '10px 15px', fontSize: '0.8em', color: '#888'}}>Today</div>
                            </li>
                            <li>
                                <button className="nav-link" style={{background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#ccc'}}>
                                    <MessageSquare size={18} />
                                    <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Create Tech Club</span>
                                </button>
                            </li>
                             <li>
                                <button className="nav-link" style={{background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#ccc'}}>
                                    <MessageSquare size={18} />
                                    <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Upcoming Events</span>
                                </button>
                            </li>
                        </ul>
                    ) : (
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
                    )}
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
