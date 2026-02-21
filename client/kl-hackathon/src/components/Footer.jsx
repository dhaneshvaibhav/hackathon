import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="container footer-container">
                <div className="footer-brand">
                    <h2>Collegiate Club</h2>
                    <p>Unifying campus life, one club at a time.</p>
                </div>
                <div className="footer-links">
                    <div className="link-group">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#clubs">Clubs</a></li>
                            <li><a href="#events">Events</a></li>
                        </ul>
                    </div>
                    <div className="link-group">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#faq">FAQ</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#guidelines">Guidelines</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-bottom container">
                <p>&copy; {new Date().getFullYear()} Collegiate Club. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
