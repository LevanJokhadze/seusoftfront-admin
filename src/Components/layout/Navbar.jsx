import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div id="main" style={{ marginLeft: isOpen ? '250px' : '0' }}>
        <button onClick={toggleNavbar}>
          {isOpen ? 'Close' : 'Open'} Navbar
        </button>
      </div>
      <div className="navbar" style={{ width: isOpen ? '250px' : '0' }}>
        <span className="close-btn" onClick={toggleNavbar}>
          &times;
        </span>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/logout">Logout</Link>
      </div>
    </div>
  );
};

export default Navbar;
