import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
