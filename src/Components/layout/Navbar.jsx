import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/navbar.css';
import Cookies from "js-cookie";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const HandleLogout = () => {
    Cookies.remove('token');
    window.location.href = "http://localhost:3000/";
  }

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
        <Link to="/contacts">Contacts</Link>
        <Link to="/profile">Profile</Link>
        <Link onClick={HandleLogout}>Logout</Link>
      </div>
    </div>
  );
};

export default Navbar;
