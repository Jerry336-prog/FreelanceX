import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">404 Error</p>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
          Page not found
        </h1>
        <p className="text-lg text-slate-500 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="mr-2 w-4 h-4" />
            Go to homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-5 py-3 border border-slate-300 text-sm font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
