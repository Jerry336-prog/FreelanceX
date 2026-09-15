import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from '../components/dashboard/ClientSidebar';
import TopHeader from '../components/dashboard/TopHeader';
import FloatingHomeButton from '../components/dashboard/FloatingHomeButton';
import CompleteProfileModal from '../components/dashboard/CompleteProfileModal';

const ClientLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-dvh overflow-hidden bg-slate-50 font-sans text-slate-900 flex">
      <ClientSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex-shrink-0">
          <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />
        </div>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <FloatingHomeButton />
      <CompleteProfileModal role="client" />
    </div>
  );
};

export default ClientLayout;
