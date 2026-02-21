import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

import Clubs from './pages/Clubs';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import ClubDetails from './pages/ClubDetails';

import './App.css';

const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/clubs" element={<Clubs />} />
                    <Route path="/clubs/:id" element={<ClubDetails />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
