import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  RotateCcw,
  LogOut,
  Menu,
  Hospital,
  UserCircle,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { mockBorrowedItems } from '@/data/mockData';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badgeCount?: number;
}

// Dev mode: hardcoded staff profile
const STAFF_USER = { id: '2', name: 'Badr DBX', role: 'user' as const, department: 'Service Sécurité Informatique' };

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const { logout } = useAuth();
  const location = useLocation();
  const user = STAFF_USER;

  // Calculate items to return for this user
  const borrowedCount = mockBorrowedItems.filter(b => b.userId === user.id && b.status === 'borrowed').length;

  const navItems: NavItem[] = [
    { label: 'Accueil', path: '/portal', icon: LayoutDashboard },
    { label: 'Catalogue matériel', path: '/portal/catalog', icon: Package },
    { label: 'Mes demandes', path: '/portal/my-requests', icon: ClipboardList },
    { label: 'Mes retours à faire', path: '/portal/my-borrowed', icon: RotateCcw, badgeCount: borrowedCount },
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
                text-muted-foreground hover:text-blue-600 hover:bg-card transition-colors"
            >
              Admin
            </Link>
            <Link 
              to="/portal" 
              className="px-1.5 py-0.5 text-[8px] font-black rounded-sm transition-all uppercase tracking-widest
                bg-card text-emerald-600 shadow-sm border border-border"
            >
              User
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
        <p className="px-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Menu Principal</p>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={`flex items-start justify-between px-4 py-1.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 font-semibold'
                  : 'hover:bg-muted dark:hover:bg-[#252525] hover:text-foreground dark:hover:text-[#F5F5F5] border border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-muted-foreground dark:text-[#A0A0A0] group-hover:text-foreground dark:group-hover:text-[#F5F5F5]'}`} />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badgeCount ? (
                <div className="flex items-center justify-center h-5 px-2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold ring-2 ring-white">
                  {item.badgeCount}
                </div>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* Support & Profile */}
      <div className="p-6 border-t border-border space-y-4">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-muted text-muted-foreground hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium text-left flex-1">Notifications</span>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </button>

        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-border border-white shadow-sm">
            <UserCircle className="w-7 h-7 text-blue-500 text-opacity-80" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground truncate">{user?.name}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-11 border-border text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl transition-all"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Se déconnecter</span>
        </Button>
      </div>
    </div>
  );
}

export function UserSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex w-72 flex-col h-screen fixed top-0 left-0 z-40 bg-card dark:bg-[#121212]">
        <SidebarContent />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-card border border-border shadow-sm hover:bg-muted">
            <Menu className="w-6 h-6 text-muted-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-r border-border">
          <SidebarContent onItemClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
