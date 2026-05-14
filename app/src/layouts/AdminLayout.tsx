import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background" dir="ltr">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 flex flex-col h-screen overflow-hidden transition-[margin-left] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="flex-1 flex flex-col relative w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
