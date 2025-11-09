import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-gray-500">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">
        We could not find that page
      </h1>
      <p className="mt-4 max-w-md text-gray-600">
        The organiser portal only exposes the BookMyShow sync flow and the
        dashboard placeholder right now. Please double-check the URL and try
        again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/o/bms-sync"
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Go to BMS sync
        </Link>
        <Link
          to="/o/dashboard-overview"
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-400"
        >
          Open dashboard
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
