import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './navbar.css';
import Cookies from 'js-cookie';
import dashboardIcon from "../../assets/navbar/dashboard.png";
import contactsIcon from "../../assets/navbar/contacts.png";
import logoutIcon from "../../assets/navbar/logout.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const HandleLogout = () => {
    Cookies.remove('token');
    window.location.href = 'http://localhost:3000/';
  };

  return (
    <div>
      <div id="main" style={{ marginLeft: isOpen ? '250px' : '0' }}>
        <button className="burger-menu" onClick={toggleNavbar} style={{ display: isOpen ? 'none' : 'block' }}>
          {isOpen ? '' : '☰'}
        </button>
      </div>
      <div className={`navbar ${isOpen ? 'open' : 'closed'}`} style={{ width: isOpen ? '250px' : '0' }}>
        <span className="close-btn" onClick={toggleNavbar}>
          &times;
        </span>
        <div className="itemNav">
        <img src={dashboardIcon} className='navIcons' alt='img'/>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => (isActive ? 'active-link' : '')} 
          onClick={toggleNavbar}
        >
          Dashboard
        </NavLink>
        </div>
        <div className="itemNav">
        <img src={contactsIcon} className='navIcons' alt='img'/>
        <NavLink 
          to="/info" 
          className={({ isActive }) => (isActive ? 'active-link' : '')} 
          onClick={toggleNavbar}
        >
          Information
        </NavLink>
        </div>
        {/* <div className="itemNav">
        <img src={contactsIcon} className='navIcons' alt='img'/>
        <NavLink 
          to="/footer" 
          className={({ isActive }) => (isActive ? 'active-link' : '')} 
          onClick={toggleNavbar}
        >
          Footer
        </NavLink>
        </div> */}
        <div className="itemNav">
        <img src={logoutIcon} className='navIcons' alt='img'/>
        <NavLink 
          to="/" 
          onClick={HandleLogout}
        >
          Logout
        </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
