import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <h1>Collegiate Club</h1>
        </div>
        <nav className="nav-menu">
          <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#clubs">Clubs</a></li>
            <li><a href="#events">Events</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="btn btn-outline">Log In</button>
          <button className="btn btn-primary">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
