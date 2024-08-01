import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Contacts from '../pages/contacts/Contacts';
import Dashboard
 from '../pages/dashboard/Dashboard';
import '../../styles/main.css';
import Login from '../Auth/Login';
import Cookies from 'js-cookie';

const main = ()=> {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoutes>
            <div>
              <Navbar />
              <div id="main">
                <div className="mainContent">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </div>
            </div>
          </ProtectedRoutes>
        }
      />
    </Routes>
  );
}

// This is a wrapper component to protect routes
function ProtectedRoutes({ children }) {
  const authToken = Cookies.get('token');

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default main;