import React from 'react';
import { Compass, CalendarDays, Users } from 'lucide-react';
import './MainSection.css';

const MainSection = () => {
    return (
        <main className="main-section section" id="about">
            <div className="container">
                <div className="section-header">
                    <h2>Why Join the Club Hub?</h2>
                    <p>Everything you need to enrich your college experience.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="icon"><Compass size={48} strokeWidth={1.5} /></div>
                        <h3>Discover Passions</h3>
                        <p>Easily find and explore technical, cultural, sports, and literary clubs happening on campus.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon"><CalendarDays size={48} strokeWidth={1.5} /></div>
                        <h3>Manage Events</h3>
                        <p>Keep track of all upcoming club activities and RSVP directly from your personalized dashboard.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon"><Users size={48} strokeWidth={1.5} /></div>
                        <h3>Connect & Grow</h3>
                        <p>Meet likeminded peers, build a strong network, and enhance your college journey together.</p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default MainSection;
