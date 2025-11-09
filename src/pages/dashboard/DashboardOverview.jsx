import React from 'react';
import bmsLogo from '../../assets/bmsLogo.png';

const DashboardOverview = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-10 space-y-6 text-center">
        <div className="flex items-center justify-center gap-4">
          <img src={bmsLogo} alt="BookMyShow" className="h-12 w-auto" />
          <div className="text-left">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              organiser workspace
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">
              Dashboard overview
            </h1>
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed">
          This placeholder dashboard confirms that routing after the BookMyShow
          sync flow works correctly. Hook up your real dashboard widgets here as
          soon as the organiser APIs are ready.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Upcoming events', '3'],
            ['Ongoing events', '1'],
            ['Total attendees', '1,240'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6"
            >
              <p className="text-xs uppercase tracking-widest text-gray-500">
                {label}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Tip: update `src/pages/dashboard/DashboardOverview.jsx` when the final
          data visualisations are available.
        </p>
      </div>
    </div>
  );
};

export default DashboardOverview;
