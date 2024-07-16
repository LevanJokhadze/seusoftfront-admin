import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Settings from '../pages/settings/settings';
import Dashboard
 from '../pages/dashboard/Dashboard';
import '../../styles/main.css';

const Main = () => {

  return (
    <Router>
      <div>
        <Navbar />
        <div id="main">
        <div className="mainContent">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
        </div>
      </div>
    </Router>

  );
};

export default Main;
