import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-content">
                <h1 className="hero-title">Experience Campus Life, <br /><span className="highlight">Amplified.</span></h1>
                <p className="hero-subtitle">
                    Discover, join, and manage college clubs all in one beautifully designed platform.
                    Whether it's tech, culture, or sports, find your community today.
                </p>
                <div className="hero-cta">
                    <button className="btn btn-primary btn-large">Explore Clubs</button>
                    <button className="btn btn-outline btn-large">Learn More</button>
                </div>
            </div>
            <div className="hero-background"></div>
        </section>
    );
};

export default Hero;
