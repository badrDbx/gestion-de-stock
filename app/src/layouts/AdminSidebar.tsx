import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { Material, BorrowedItem } from '@/types';
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  Hospital,
  UserCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { motion } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badgeCount?: number;
}

function SidebarContent({ onItemClick, onOpenNotifications, isCollapsed, setIsCollapsed }: { onItemClick?: () => void; onOpenNotifications: () => void; isCollapsed?: boolean; setIsCollapsed?: (val: boolean) => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [counts, setCounts] = useState({ lowStock: 0, overdue: 0, messages: 0, pendingRequests: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [matRes, borrowRes, msgRes, reqRes] = await Promise.all([
          api.get('/materials'),
          api.get('/borrowed-items'),
          api.get('/messages/total-unread', { params: { user_id: user?.id } }),
          api.get('/material-requests')
        ]);
        
        const matData = Array.isArray(matRes.data) ? matRes.data : [];
        const borrowData = Array.isArray(borrowRes.data) ? borrowRes.data : [];
        const reqData = Array.isArray(reqRes.data) ? reqRes.data : [];
        const msgCount = msgRes.data.count || 0;
        
        const lowStock = matData.filter((m: Material) => m.quantity <= (m.minQuantity || 0)).length;
        const overdue = borrowData.filter(
          (b: BorrowedItem) => b.status === 'borrowed' && b.expectedReturnDate && new Date(b.expectedReturnDate) < new Date()
        ).length;
        const pendingRequests = reqData.filter((r: any) => r.status === 'pending').length;
        
        setCounts({ lowStock, overdue, messages: msgCount, pendingRequests });
      } catch (error) {
        console.error('Error fetching sidebar counts:', error);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    
    window.addEventListener('messages-read', fetchCounts);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('messages-read', fetchCounts);
    };
  }, [user]);

  const navItems: NavItem[] = [
    { label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
    { label: 'Gestion Matériel', path: '/admin/materials', icon: Package, badgeCount: counts.lowStock },
    { label: 'Gestion Demandes', path: '/admin/requests', icon: ClipboardList, badgeCount: counts.pendingRequests },
    { label: 'Gestion Utilisateurs', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex flex-col h-full bg-sidebar/80 backdrop-blur-xl text-sidebar-foreground border-r border-border/40 relative overflow-hidden transition-all duration-500">
      {/* Background Decor - Subtle gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px] -ml-24 -mb-24 pointer-events-none" />
      
      {/* Header / Logo */}
      <div className="flex items-center justify-between px-7 h-[72px] shrink-0 relative z-10">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-0 ${isCollapsed ? 'mx-auto' : ''} cursor-pointer group`}
        >
          <img 
            src="/logo.png" 
            alt="Logo" 
            className={`${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'} object-contain drop-shadow-xl transition-all duration-500 group-hover:rotate-12`} 
          />
          {!isCollapsed && (
            <div className="flex flex-col -ml-1 translate-y-1.5 relative pr-2">
              <span className="text-[20px] font-black italic bg-clip-text text-transparent bg-gradient-to-r from-[#4b69a7] to-[#2a3f6d] leading-none">
                Stock
              </span>
            </div>
          )}
        </motion.div>
        {!isCollapsed && setIsCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)} 
            className="w-8 h-8 flex items-center justify-center rounded-[12px] hover:bg-muted/80 text-muted-foreground/40 hover:text-foreground transition-all duration-300 group/btn"
          >
            <ChevronLeft className="w-5 h-5 group-hover/btn:-translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto relative z-10 scrollbar-hide">
        {!isCollapsed && (
          <p className="px-4 mb-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Administration</p>
        )}

        {isCollapsed && setIsCollapsed && (
          <div className="flex justify-center mb-8">
            <button 
              onClick={() => setIsCollapsed(false)} 
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all duration-500 shadow-sm hover:scale-110 active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                className={`flex items-center ${isCollapsed ? 'justify-center h-14' : 'justify-between px-4 py-3'} rounded-2xl transition-all duration-500 group relative ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all duration-500 relative z-10 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.6)] rotate-3' 
                      : 'bg-muted/80 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:scale-110 group-hover:-rotate-3'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    {item.badgeCount ? (
                      <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-sidebar shadow-lg animate-pulse`} />
                    ) : null}
                  </div>
                  {!isCollapsed && (
                    <span className={`text-[14px] tracking-tight transition-colors duration-300 ${isActive ? 'font-black' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  )}
                </div>



                <div 
                  className={`absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-2xl -z-10 transition-opacity duration-300 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
                />
              </NavLink>
            );
          })}
        </div>

        {/* System Section */}
        <div className="pt-10 pb-2">
          {!isCollapsed && (
            <p className="px-4 mb-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Communication</p>
          )}
          
          <button
            onClick={() => { onItemClick?.(); onOpenNotifications(); }}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center h-14' : 'justify-between px-4 py-3'} rounded-2xl transition-all duration-500 group relative text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/5 hover:text-foreground`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-[14px] bg-muted/80 dark:bg-white/5 flex items-center justify-center transition-all duration-500 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:scale-110 shadow-sm relative">
                <MessageSquare className="w-5 h-5" />
                {counts.messages > 0 && (
                  <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-sidebar shadow-lg animate-pulse`} />
                )}
              </div>
            {!isCollapsed && <span className="text-[14px] font-medium tracking-tight">Messages</span>}
          </div>
        </button>
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div className="p-5 relative z-10">
        <div className={`bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[28px] p-3 border border-border/40 shadow-xl shadow-black/5 transition-all duration-500 ${isCollapsed ? 'flex flex-col items-center gap-4 p-2' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} w-full mb-4`}>
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border border-white/20 shadow-lg shadow-blue-500/20 group/avatar">
                <UserCircle className="w-7 h-7 text-white transition-transform duration-500 group-hover/avatar:scale-110" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-md" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-black text-[14px] text-foreground tracking-tight truncate uppercase leading-none mb-1">{user?.name}</span>
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate">{user?.role}</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full ${isCollapsed ? 'h-11 w-11 px-0' : 'h-11 px-4 justify-start gap-3'} rounded-2xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 border border-transparent hover:border-red-500/20 group/logout`}
          >
            <LogOut className={`w-4 h-4 shrink-0 transition-transform ${isCollapsed ? '' : 'group-hover/logout:-translate-x-1'}`} />
            {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Déconnexion</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed?: boolean; setIsCollapsed?: (val: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <aside className={`hidden lg:flex flex-col h-screen fixed top-0 left-0 z-40 overflow-y-auto border-r border-border shadow-sm bg-sidebar transition-[width] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <SidebarContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} onOpenNotifications={() => setNotificationsOpen(true)} />
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

      <NotificationDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} sidebarOffset={isCollapsed ? 80 : 288} />
    </>
  );
}
