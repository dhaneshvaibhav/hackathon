import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, X, Check, User } from 'lucide-react';
import { getManagedClubs, getClubRequests, handleClubRequest, getMyRequests } from '../functions/club';
import { getUserProfile } from '../functions/user';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pass searchQuery to children via Outlet context
    
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const userData = await getUserProfile(token);
                setUser(userData);
                setLoading(true);

                if (userData.is_admin) {
                    const clubs = await getManagedClubs(token);
                    const allRequests = [];

                    for (const club of clubs) {
                        try {
                            const requests = await getClubRequests(token, club.id);
                            const pendingRequests = requests.filter(r => r.status === 'pending').map(r => ({
                                ...r,
                                type: 'admin_request',
                                club_name: club.name,
                                club_id: club.id
                            }));
                            allRequests.push(...pendingRequests);
                        } catch (err) {
                            console.error(`Failed to fetch requests for club ${club.id}`, err);
                        }
                    }
                    setNotifications(allRequests);
                } else {
                    // Fetch notifications for normal users (e.g., request status updates)
                    const myRequests = await getMyRequests(token);
                    // Filter for requests that have been accepted or rejected recently or just show all status updates
                    // For now, let's show all processed requests as notifications or just pending ones if desired.
                    // Assuming we want to notify users when their request status changes.
                    // Since backend doesn't have a specific "unread" flag, we can show all non-pending requests as "notifications" 
                    // or perhaps just show the latest status. 
                    // Let's filter for requests that are NOT pending (meaning they've been handled)
                    const processedRequests = myRequests.filter(r => r.status !== 'pending').map(r => ({
                        ...r,
                        type: 'user_update',
                        // club_name should be in the response if backend provides it, otherwise we might need to fetch club details
                        // The get_my_requests controller returns request objects. 
                        // Let's assume the request object has club_id. We might need to fetch club name if not provided.
                        // Ideally backend 'to_dict' includes club_name or club relationship.
                    }));
                    
                    // If the backend request object doesn't have club_name, we might display "Club ID: ..." or fetch it.
                    // Let's assume for now the user wants to see the status of their requests.
                    setNotifications(processedRequests);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const onHandleRequest = async (requestId, clubId, status, adminResponse) => {
        const token = localStorage.getItem('token');
        try {
            await handleClubRequest(token, requestId, status, adminResponse);
            // Remove from local state
            setNotifications(prev => prev.filter(n => n.id !== requestId));
        } catch (err) {
            console.error('Failed to handle request', err);
            alert('Failed to update request');
        }
    };

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
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="header-right" style={{ position: 'relative' }}>
                        <button 
                            className="notification-btn" 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNotifications(!showNotifications);
                            }}
                        >
                            <Bell size={24} />
                            {notifications.length > 0 && (
                                <span className="notification-badge">{notifications.length}</span>
                            )}
                        </button>
                        
                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <span>Notifications</span>
                                    <button 
                                        onClick={() => setShowNotifications(false)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                
                                {loading ? (
                                    <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
                                ) : notifications.length === 0 ? (
                                    <div className="empty-notifications">
                                        No new notifications
                                    </div>
                                ) : (
                                    <ul className="notification-list">
                                {notifications.map(notification => (
                                    <li key={notification.id} className="notification-item">
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <div style={{ background: '#e0e7ff', padding: '0.5rem', borderRadius: '50%', height: 'fit-content' }}>
                                                <User size={16} color="#4f46e5" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                {user?.is_admin ? (
                                                    <>
                                                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: '500' }}>
                                                            {notification.user_name}
                                                        </p>
                                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            Requests to join <strong>{notification.club_name}</strong>
                                                        </p>
                                                        {notification.message && (
                                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontStyle: 'italic', background: '#f9f9f9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                                                "{notification.message}"
                                                            </p>
                                                        )}
                                                        <div className="notification-actions">
                                                            <button 
                                                                className="btn-accept"
                                                                onClick={() => {
                                                                    const msg = prompt("Message for user (optional):", "Welcome!");
                                                                    if (msg !== null) onHandleRequest(notification.id, notification.club_id, 'accepted', msg);
                                                                }}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button 
                                                                className="btn-reject"
                                                                onClick={() => {
                                                                    const msg = prompt("Reason for rejection:", "Sorry, not accepting new members.");
                                                                    if (msg !== null) onHandleRequest(notification.id, notification.club_id, 'rejected', msg);
                                                                }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: '500' }}>
                                                            Request Update
                                                        </p>
                                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            Your request to join Club ID: <strong>{notification.club_id}</strong> has been 
                                                            <span style={{ 
                                                                color: notification.status === 'accepted' ? 'green' : 'red',
                                                                fontWeight: 'bold',
                                                                marginLeft: '4px'
                                                            }}>
                                                                {notification.status.toUpperCase()}
                                                            </span>
                                                        </p>
                                                        {notification.admin_response && (
                                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontStyle: 'italic', background: '#f9f9f9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                                                Admin: "{notification.admin_response}"
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                                )}
                            </div>
                        )}
                    </div>
                </header>
                <main className="dashboard-content">
                    <Outlet context={{ searchQuery }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
