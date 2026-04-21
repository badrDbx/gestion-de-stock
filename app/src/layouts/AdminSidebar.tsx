import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  Hospital,
  UserCircle,
  Bell,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { mockMaterials, mockBorrowedItems } from '@/data/mockData';
import { NotificationDrawer } from '@/components/NotificationDrawer';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badgeCount?: number;
}

const ADMIN_USER = { name: 'admin', role: 'admin' as const, department: 'Centre Informatique' };

function SidebarContent({ onItemClick, onOpenNotifications }: { onItemClick?: () => void; onOpenNotifications: () => void }) {
  const { logout } = useAuth();
  const location = useLocation();
  const user = ADMIN_USER;

  const lowStockCount = mockMaterials.filter(m => m.quantity <= m.minQuantity).length;
  const overdueBorrowCount = mockBorrowedItems.filter(
    b => b.status === 'borrowed' && new Date(b.expectedReturnDate) < new Date()
  ).length;
  const notificationCount = lowStockCount + overdueBorrowCount;

  const navItems: NavItem[] = [
    { label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
    { label: 'Gestion du Matériel', path: '/admin/materials', icon: Package, badgeCount: lowStockCount },
    { label: 'Gestion des demandes', path: '/admin/requests', icon: ClipboardList },
    { label: 'Gestion des utilisateurs', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex flex-col h-full bg-card dark:bg-[#121212] text-muted-foreground dark:text-[#A0A0A0] border-r border-border dark:border-[#2A2A2A]">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 border-b border-border dark:border-[#2A2A2A] bg-background dark:bg-[#0F0F0F] h-[61px]">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
          <Hospital className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[14px] leading-tight text-foreground tracking-tight">chi smiya</span>
          
          {/* Elite Dev Mode Switcher */}
          <div className="flex items-center gap-1 mt-1 p-0.5 bg-muted rounded-md border border-border/50 w-fit">
            <Link 
              to="/admin" 
              className="px-1.5 py-0.5 text-[8px] font-black rounded-sm transition-all uppercase tracking-widest
                bg-card text-blue-600 shadow-sm border border-border"
            >
              Admin
            </Link>
            <Link 
              to="/portal" 
              className="px-1.5 py-0.5 text-[8px] font-black rounded-sm transition-all uppercase tracking-widest
                text-muted-foreground hover:text-emerald-600 hover:bg-card transition-colors"
            >
              User
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

        {/* Main nav label */}
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-3 mb-2">Navigation</p>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={`flex items-start justify-between px-3 py-1.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400'
                  : 'text-muted-foreground dark:text-[#A0A0A0] hover:bg-muted dark:hover:bg-[#252525] hover:text-foreground dark:hover:text-[#F5F5F5]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-start justify-center transition-all ${
                  isActive ? 'bg-indigo-600/20' : 'bg-transparent group-hover:bg-muted dark:group-hover:bg-[#252525]'
                }`}>
                  <Icon className={`w-4 h-4 mt-1.5 ${isActive ? 'text-indigo-400' : 'text-muted-foreground dark:text-[#A0A0A0] group-hover:text-foreground dark:group-hover:text-[#F5F5F5]'}`} />
                </div>
                <span className={`text-[13px] font-semibold mt-1 ${isActive ? 'text-indigo-400' : ''}`}>{item.label}</span>
              </div>
              {item.badgeCount ? (
                <span className="text-[10px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badgeCount}
                </span>
              ) : null}
              {isActive && (
                <div className="w-1 h-4 bg-blue-500 rounded-full" />
              )}
            </NavLink>
          );
        })}

        {/* Divider */}
        <div className="pt-4 pb-2">
          <div className="h-px bg-muted w-full mb-4" />
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-3 mb-2">Système &amp; Alertes</p>
        </div>

        {/* Notifications button */}
        <button
          onClick={() => { onItemClick?.(); onOpenNotifications(); }}
          className="w-full flex items-start justify-between px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-muted dark:hover:bg-[#252525] hover:text-foreground dark:hover:text-[#F5F5F5] group cursor-pointer text-muted-foreground dark:text-[#A0A0A0]"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent group-hover:bg-muted transition-all relative">
              <Bell className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <span className="text-[13px] font-semibold">Notifications</span>
          </div>
          {notificationCount > 0 && (
            <span className="text-[10px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              isActive ? 'bg-blue-50 text-blue-700' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
          }
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent group-hover:bg-muted transition-all">
            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground" />
          </div>
          <span className="text-[13px] font-semibold">Paramètres</span>
        </NavLink>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-muted transition-colors mb-1">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
              <UserCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-border border-white rounded-full" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[13px] text-foreground truncate">{user?.name}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors text-[13px] font-medium"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex w-72 flex-col h-screen fixed top-0 left-0 z-[60] overflow-y-auto border-r border-border dark:border-[#2A2A2A] shadow-sm bg-card dark:bg-[#121212]">
        <SidebarContent onOpenNotifications={() => setNotificationsOpen(true)} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-card text-foreground border border-border shadow-sm">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-r border-border">
          <SidebarContent onItemClick={() => setOpen(false)} onOpenNotifications={() => { setOpen(false); setNotificationsOpen(true); }} />
        </SheetContent>
      </Sheet>

      <NotificationDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </>
  );
}
