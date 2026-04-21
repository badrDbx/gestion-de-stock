import { AdminSidebar } from './AdminSidebar';
import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background" dir="ltr">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-72">
        <div className="flex-1 flex flex-col relative w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
