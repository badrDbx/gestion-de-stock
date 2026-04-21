import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertTriangle,
  Package,
  CalendarClock,
  CheckCheck,
  Bell,
  BellOff,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import { mockMaterials, mockBorrowedItems } from '@/data/mockData';

// ── Notification Types ──────────────────────────────────────────────

export type NotificationType = 'stock_critical' | 'stock_low' | 'overdue' | 'due_soon' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  meta?: {
    itemName?: string;
    userName?: string;
    daysOverdue?: number;
    daysLeft?: number;
    quantity?: number;
    minQuantity?: number;
  };
}

// ── Generate notifications from real data ───────────────────────────

function generateNotifications(): AppNotification[] {
  const notifications: AppNotification[] = [];
  const now = new Date();

  mockMaterials.forEach((item) => {
    if (item.quantity <= item.minQuantity) {
      const isCritical = item.quantity === 0;
      notifications.push({
        id: `stock-${item.id}`,
        type: isCritical ? 'stock_critical' : 'stock_low',
        title: isCritical ? 'Rupture de stock' : 'Stock bas',
        message: isCritical
          ? `${item.name} est en rupture totale de stock.`
          : `${item.name} — ${item.quantity} ${item.unit}${item.quantity > 1 ? 's' : ''} restant${item.quantity > 1 ? 's' : ''} (seuil: ${item.minQuantity}).`,
        timestamp: new Date(now.getTime() - Math.random() * 3600000 * 4),
        read: false,
        meta: { itemName: item.name, quantity: item.quantity, minQuantity: item.minQuantity },
      });
    }
  });

  mockBorrowedItems
    .filter((b) => b.status === 'borrowed')
    .forEach((item) => {
      const expected = new Date(item.expectedReturnDate);
      const diffMs = expected.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        notifications.push({
          id: `overdue-${item.id}`,
          type: 'overdue',
          title: 'Retour en retard',
          message: `${item.materialName} emprunté par ${item.userName} — ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''} de retard.`,
          timestamp: expected,
          read: false,
          meta: { itemName: item.materialName, userName: item.userName, daysOverdue: Math.abs(diffDays) },
        });
      } else if (diffDays <= 3) {
        notifications.push({
          id: `due-soon-${item.id}`,
          type: 'due_soon',
          title: 'Retour imminent',
          message: `${item.materialName} emprunté par ${item.userName} — ${diffDays === 0 ? "retour aujourd'hui" : `${diffDays} jour${diffDays > 1 ? 's' : ''} restant${diffDays > 1 ? 's' : ''}`}.`,
          timestamp: new Date(now.getTime() - Math.random() * 3600000 * 2),
          read: false,
          meta: { itemName: item.materialName, userName: item.userName, daysLeft: diffDays },
        });
      }
    });

  return notifications.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}

// ── Time formatting ─────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ── Visual config per type ──────────────────────────────────────────

const typeConfig: Record<
  NotificationType,
  {
    icon: typeof AlertTriangle;
    iconClass: string;
    dotClass: string;
    bgClass: string;
    borderClass: string;
    label: string;
    labelColor: string;
  }
> = {
  stock_critical: {
    icon: AlertTriangle,
    iconClass: 'text-red-500',
    dotClass: 'bg-red-500',
    bgClass: 'bg-red-50',
    borderClass: 'border-l-red-500',
    label: 'CRITIQUE',
    labelColor: 'text-red-600',
  },
  stock_low: {
    icon: Package,
    iconClass: 'text-amber-500',
    dotClass: 'bg-amber-400',
    bgClass: 'bg-amber-50',
    borderClass: 'border-l-amber-400',
    label: 'STOCK BAS',
    labelColor: 'text-amber-600',
  },
  overdue: {
    icon: CalendarClock,
    iconClass: 'text-red-600',
    dotClass: 'bg-red-500',
    bgClass: 'bg-red-50',
    borderClass: 'border-l-red-500',
    label: 'EN RETARD',
    labelColor: 'text-red-600',
  },
  due_soon: {
    icon: Clock,
    iconClass: 'text-violet-500',
    dotClass: 'bg-violet-400',
    bgClass: 'bg-violet-50',
    borderClass: 'border-l-violet-400',
    label: 'IMMINENT',
    labelColor: 'text-violet-600',
  },
  info: {
    icon: Bell,
    iconClass: 'text-blue-500',
    dotClass: 'bg-blue-400',
    bgClass: 'bg-blue-50',
    borderClass: 'border-l-blue-400',
    label: 'INFO',
    labelColor: 'text-blue-600',
  },
};

// ── Filter tabs ─────────────────────────────────────────────────────

type FilterTab = 'all' | 'stock' | 'returns';

// ── Component ───────────────────────────────────────────────────────

interface NotificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>(generateNotifications);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filtered = useMemo(() => {
    if (activeTab === 'stock') return notifications.filter((n) => n.type === 'stock_critical' || n.type === 'stock_low');
    if (activeTab === 'returns') return notifications.filter((n) => n.type === 'overdue' || n.type === 'due_soon');
    return notifications;
  }, [notifications, activeTab]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Tout', count: notifications.length },
    { key: 'stock', label: 'Stock', count: notifications.filter((n) => n.type === 'stock_critical' || n.type === 'stock_low').length },
    { key: 'returns', label: 'Retours', count: notifications.filter((n) => n.type === 'overdue' || n.type === 'due_soon').length },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[380px] sm:max-w-[380px] p-0 border-r border-border bg-card flex flex-col gap-0 shadow-2xl lg:left-[288px]"
        style={{ animationDuration: '350ms' } as React.CSSProperties}
      >
        {/* ─── Header ─── */}
        <SheetHeader className="px-5 pt-5 pb-4 bg-card space-y-0">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Bell className="w-5 h-5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />
                )}
              </div>
              <SheetTitle className="text-[15px] font-bold text-foreground tracking-tight">
                Notifications
              </SheetTitle>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-blue-600 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout lire
              </button>
            )}
          </div>

          {/* Segmented tabs */}
          <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`text-[9px] font-black px-1 py-0.5 rounded min-w-[15px] text-center leading-none ${
                      activeTab === tab.key ? 'bg-muted text-muted-foreground' : 'bg-slate-200/70 text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-muted mt-4 -mx-5" />
        </SheetHeader>

        {/* ─── Notification List ─── */}
        <div className="flex-1 h-0 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground pb-16">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <BellOff className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Aucune notification</p>
              <p className="text-xs mt-1 text-muted-foreground">Tout est sous contrôle</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((notification) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;

                return (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`group relative flex gap-3.5 px-5 py-4 cursor-pointer transition-colors duration-150 ${
                      notification.read
                        ? 'bg-card hover:bg-muted/60'
                        : 'bg-blue-50/20 hover:bg-blue-50/40'
                    }`}
                  >
                    {/* Unread left strip */}
                    {!notification.read && (
                      <div className="absolute left-0 top-5 bottom-5 w-[3px] bg-blue-500 rounded-r-full" />
                    )}

                    {/* Dismiss button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismissNotification(notification.id); }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center hover:bg-slate-200"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>

                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${notification.read ? 'bg-muted' : config.bgClass}`}>
                      <Icon className={`w-4 h-4 ${notification.read ? 'text-muted-foreground' : config.iconClass}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-5">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${notification.read ? 'text-muted-foreground' : config.labelColor}`}>
                          {config.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgo(notification.timestamp)}
                        </span>
                      </div>

                      <p className={`text-[13px] leading-snug ${notification.read ? 'font-medium text-muted-foreground' : 'font-semibold text-foreground'}`}>
                        {notification.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>

                      {!notification.read && (notification.type === 'stock_critical' || notification.type === 'stock_low' || notification.type === 'overdue' || notification.type === 'due_soon') && (
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                            notification.type === 'stock_critical' || notification.type === 'stock_low'
                              ? 'text-amber-600 hover:text-amber-800'
                              : 'text-violet-600 hover:text-violet-800'
                          }`}
                        >
                          {notification.type === 'stock_critical' || notification.type === 'stock_low' ? 'Voir le matériel' : 'Voir la demande'}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
