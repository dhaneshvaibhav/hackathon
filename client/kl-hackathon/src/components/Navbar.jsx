import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LayoutDashboard, Home } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const token = localStorage.getItem('token');

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo">
                    Club Hub
                </Link>

                <div className="menu-icon" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </div>

                <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </NavLink>
                    </li>
                    
                    {token ? (
                        <li className="nav-item">
                            <NavLink 
                                to="/dashboard" 
                                className="nav-links btn-link"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </NavLink>
                        </li>
                    ) : (
                        <>
                            <li className="nav-item">
                                <NavLink 
                                    to="/login" 
                                    className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    to="/signup" 
                                    className="nav-links-btn"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
