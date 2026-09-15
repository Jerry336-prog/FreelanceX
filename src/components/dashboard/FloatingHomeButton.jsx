import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const FloatingHomeButton = () => (
  <Link
    to="/"
    aria-label="Return to public home page"
    title="Back to home"
    className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200"
  >
    <Home className="h-5 w-5" aria-hidden="true" />
  </Link>
);

export default FloatingHomeButton;
