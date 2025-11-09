import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import OrganiserRoutes from './routes/OrganiserRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/o/bms-sync" replace />} />
        <Route path="/o/*" element={<OrganiserRoutes />} />
        <Route path="*" element={<Navigate to="/o/bms-sync" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
