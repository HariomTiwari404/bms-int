import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BmsSyncPage from '../pages/bms/BmsSyncPage';
import LumaSyncPage from '../pages/luma/LumaSyncPage';
import DashboardOverview from '../pages/dashboard/DashboardOverview';
import PageNotFound from '../pages/PageNotFound';

const OrganiserRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="bms-sync" replace />} />
      <Route path="bms-sync" element={<BmsSyncPage />} />
      <Route path="luma" element={<Navigate to="luma-sync" replace />} />
      <Route path="luma-sync" element={<LumaSyncPage />} />
      <Route path="dashboard-overview" element={<DashboardOverview />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default OrganiserRoutes;
