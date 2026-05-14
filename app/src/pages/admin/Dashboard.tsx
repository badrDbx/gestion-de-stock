import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/layouts/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Users,
  ClipboardList,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Activity,
  CalendarClock,
  TimerReset,
  UserCheck,
  BarChart3,
  BellRing,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import api from '@/lib/api';
import type { Material, MaterialRequest, User } from '@/types';


export function Dashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertFilter, setAlertFilter] = useState<'all' | 'stock' | 'requests'>('all');

  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [isSollicitationsModalOpen, setIsSollicitationsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [matRes, reqRes, userRes] = await Promise.all([
        api.get('/materials'),
        api.get('/material-requests'),
        api.get('/users'),
      ]);
      const dataMat = Array.isArray(matRes.data) ? matRes.data : [];
      const dataReq = Array.isArray(reqRes.data) ? reqRes.data : [];
      const dataUser = Array.isArray(userRes.data) ? userRes.data : [];
      
      setMaterials(dataMat);
      setRequests(dataReq);
      setUsers(dataUser);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      // Small delay to ensure smooth transition
      setTimeout(() => setLoading(false), 300);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-background">
        <Header title="Tableau de bord Admin" />
        <div className="flex-1 p-6 space-y-8 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 rounded-[24px] bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-[24px] bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="h-[400px] rounded-[32px] bg-slate-900/10 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const stats = useMemo(() => {
    const totalItemsCount = materials.length;
    const consumablesCount = materials.filter(m => m.type === 'consumable').length;
    const returnablesCount = materials.filter(m => m.type === 'returnable').length;
    const totalUsersCount = users.length;
    const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

    return [
      { title: 'Total matériel', value: totalItemsCount, icon: Package, subLabel: 'types d\'articles', link: '/admin/materials', color: 'blue' },
      { title: 'Consommables', value: consumablesCount, icon: ClipboardList, subLabel: 'articles', link: '/admin/materials?type=consumable', color: 'amber' },
      { title: 'Récupérables', value: returnablesCount, icon: RotateCcw, subLabel: 'articles', link: '/admin/materials?type=returnable', color: 'indigo' },
      { title: 'Demandes en attente', value: pendingRequestsCount, icon: Clock, subLabel: 'demandes à traiter', link: '/admin/requests?status=pending', color: 'rose' },
      { title: 'Utilisateurs enregistrés', value: totalUsersCount, icon: Users, subLabel: 'agents enregistrés', link: '/admin/users', color: 'emerald' },
    ];
  }, [materials, requests, users]);

  const priorityAlerts = useMemo(() => [...materials]
    .filter(m => m.quantity <= m.minQuantity)
    .sort((a, b) => (a.quantity / (a.minQuantity || 1)) - (b.quantity / (b.minQuantity || 1)))
    .slice(0, 4), [materials]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <Header 
        title="Tableau de bord Admin" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1 p-6 space-y-8 overflow-auto scrollbar-hide"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {stats.map((stat, i) => (
            <Link key={i} to={stat.link} className="group outline-none">
              <Card className="relative overflow-hidden border border-border/50 bg-card shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] transition-all duration-500 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:border-blue-400/30 hover:-translate-y-1.5 rounded-[24px]">
                <CardContent className="p-5 relative z-10 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:rotate-3 ${
                      stat.color === 'blue' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)]' :
                      stat.color === 'amber' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white group-hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)]' :
                      stat.color === 'indigo' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_4px_20px_rgba(79,70,229,0.4)]' :
                      stat.color === 'rose' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white group-hover:shadow-[0_4px_20px_rgba(225,29,72,0.4)]' :
                      stat.color === 'emerald' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)]' :
                      'bg-muted border border-border text-muted-foreground'
                    }`}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-muted border border-border group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-3xl font-black tracking-tight text-foreground group-hover:text-blue-600 transition-colors duration-300">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{stat.title}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/80">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      stat.color === 'blue' ? 'bg-blue-400' :
                      stat.color === 'amber' ? 'bg-amber-400' :
                      stat.color === 'indigo' ? 'bg-indigo-400' :
                      stat.color === 'rose' ? 'bg-rose-400' :
                      'bg-emerald-400'
                    }`} />
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-muted-foreground transition-colors uppercase tracking-wider">{stat.subLabel}</span>
                  </div>
                </CardContent>
                
                <div className={`absolute -right-8 -bottom-8 w-32 h-32 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none ${
                    stat.color === 'blue' ? 'bg-blue-600' :
                    stat.color === 'emerald' ? 'bg-emerald-600' :
                    stat.color === 'rose' ? 'bg-rose-600' :
                    stat.color === 'amber' ? 'bg-amber-600' :
                    'bg-indigo-600'
                }`} />
              </Card>
            </Link>
          ))}
        </div>

        {/* 🚀 Unified Command Center - HUB D'ALERTES */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[20px] bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <BellRing className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Centre d'Alertes</h2>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Surveillance du stock et des demandes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-2xl border border-border/50 backdrop-blur-sm">
              {[
                { id: 'all', label: 'Tout', icon: Activity },
                { id: 'stock', label: 'Stock', icon: Package },
                { id: 'requests', label: 'Demandes', icon: ClipboardList }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAlertFilter(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    alertFilter === tab.id 
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-md ring-1 ring-border' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {(() => {
                const stockAlerts = materials
                  .filter(m => m.quantity <= m.minQuantity)
                  .map(m => ({
                    id: `stock-${m.id}`,
                    type: 'stock',
                    priority: m.quantity === 0 ? 'critical' : 'warning',
                    title: m.quantity === 0 ? 'Critique' : 'Bas',
                    message: `${m.name} : ${m.quantity} ${m.unit}${m.quantity > 1 ? 's' : ''} restant${m.quantity > 1 ? 's' : ''}`,
                    material: m,
                    date: new Date().toISOString()
                  }));

                const requestAlerts = requests
                  .filter(r => ['pending', 'approved', 'borrowed'].includes(r.status))
                  .map(r => ({
                    id: `req-${r.id}`,
                    type: 'request',
                    priority: r.status === 'pending' ? 'info' : 'low',
                    title: r.status === 'pending' ? 'Nouvelle Demande' : r.status === 'approved' ? 'Prêt Approuvé' : 'Matériel Emprunté',
                    message: `${r.userName} : ${r.materialName} (${r.quantity}x)`,
                    request: r,
                    date: r.updatedAt || r.createdAt || r.requestDate
                  }));

                const overdueAlerts = requests
                  .filter(r => r.status === 'borrowed' && r.expectedReturnDate && new Date(r.expectedReturnDate) < new Date())
                  .map(r => ({
                    id: `overdue-${r.id}`,
                    type: 'overdue',
                    priority: 'critical',
                    title: 'Retard de Retour',
                    message: `${r.userName} n'a pas rendu ${r.materialName}`,
                    request: r,
                    date: r.expectedReturnDate
                  }));

                const allAlerts = [...stockAlerts, ...requestAlerts, ...overdueAlerts]
                  .sort((a, b) => {
                    const priorityScore = { critical: 4, warning: 3, info: 2, low: 1 };
                    return priorityScore[b.priority as keyof typeof priorityScore] - priorityScore[a.priority as keyof typeof priorityScore];
                  })
                  .filter(a => alertFilter === 'all' || (alertFilter === 'stock' && (a.type === 'stock')) || (alertFilter === 'requests' && (a.type === 'request' || a.type === 'overdue')));

                // Éviter les doublons : si une requête est à la fois "en cours" et "en retard", on ne garde que le retard
                const uniqueAlerts = allAlerts.filter((alert, index, self) => {
                  const numericId = alert.id.split('-')[1];
                  // Si c'est une requête normale, on vérifie s'il n'y a pas une alerte "overdue" pour le même ID
                  if (alert.type === 'request') {
                    const hasOverdue = self.some(a => a.type === 'overdue' && a.id.split('-')[1] === numericId);
                    if (hasOverdue) return false;
                  }
                  // Garder uniquement la première occurrence pour éviter tout autre doublon
                  return self.findIndex(a => a.id === alert.id) === index;
                });

                if (uniqueAlerts.length === 0) {
                  return (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-muted/20 rounded-[32px] border-2 border-dashed border-border/50">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h3 className="text-lg font-black text-foreground">Tout est sous contrôle</h3>
                      <p className="text-sm text-muted-foreground font-medium italic">Aucune alerte active pour le moment</p>
                    </div>
                  );
                }

                return uniqueAlerts.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                  >
                    <Card className={`relative overflow-hidden border-border/50 bg-card hover:border-indigo-500/30 transition-all duration-500 rounded-[28px] hover:shadow-2xl hover:shadow-indigo-500/10 ${
                      alert.priority === 'critical' ? 'ring-1 ring-rose-500/20' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                            alert.priority === 'critical' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                            alert.priority === 'warning' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                            alert.priority === 'info' ? 'bg-indigo-600 text-white shadow-indigo-600/20' :
                            'bg-slate-400 text-white shadow-slate-400/20'
                          }`}>
                            {alert.type === 'stock' ? <Package className="w-7 h-7" /> : 
                             alert.type === 'overdue' ? <TimerReset className="w-7 h-7" /> :
                             <Activity className="w-7 h-7" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                alert.priority === 'critical' ? 'text-rose-500' :
                                alert.priority === 'warning' ? 'text-amber-600' :
                                alert.priority === 'info' ? 'text-indigo-600' :
                                'text-slate-500'
                              }`}>
                                {alert.title}
                              </span>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase">{new Date(alert.date as string).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                            </div>
                            <h4 className="text-sm font-black text-foreground mb-3 leading-tight tracking-tight">
                              {alert.message}
                            </h4>
                            
                            <div className="flex items-center gap-2">
                              {alert.type === 'request' && (
                                <Link to="/admin/requests?status=pending" className="flex-1">
                                  <Button size="sm" className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-[10px] font-black uppercase tracking-widest shadow-md">
                                    Examiner
                                  </Button>
                                </Link>
                              )}
                              {alert.type === 'overdue' && (
                                <Link to="/admin/requests" className="flex-1">
                                  <Button size="sm" className="w-full h-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-[10px] font-black uppercase tracking-widest shadow-md">
                                    Relancer
                                  </Button>
                                </Link>
                              )}
                              {alert.type === 'stock' && (
                                <Link to={`/admin/materials?search=${(alert as any).material.name}`} className="flex-1">
                                  <Button size="sm" className="w-full h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-md">
                                    Commander
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ));
              })()}
            </AnimatePresence>
          </div>
        </div>

        {/* Detailed Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          {/* Stock Distribution */}
          {(() => {
            const distributionByCategory = materials.reduce((acc, item) => {
              const cat = item.category || 'Autres';
              acc[cat] = (acc[cat] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const allCategories = Object.entries(distributionByCategory)
              .sort((a, b) => b[1] - a[1]);
            
            const displayCategories = allCategories.slice(0, 7);
            const maxQuantity = Math.max(...allCategories.map(c => c[1]), 1);

            const categoryColors: Record<string, string> = {
              'Informatique': 'bg-blue-500',
              'Réseau & Câblage': 'bg-sky-400',
              'Bureautique': 'bg-emerald-500',
              'Impression': 'bg-indigo-500',
              'Consommables Divers': 'bg-rose-500',
              'Accessoires': 'bg-amber-500',
              'Logiciel': 'bg-violet-500',
              'Maintenance': 'bg-teal-500',
            };

            const CategoryItem = ({ category, count, idx }: { category: string, count: number, idx: number }) => {
              const percentage = Math.round((count / maxQuantity) * 100);
              const defaultColors = ['bg-blue-500', 'bg-sky-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500'];
              const bgColor = categoryColors[category] || defaultColors[idx % defaultColors.length];
              
              return (
                <div key={idx} className="flex items-center justify-between py-2 group/item">
                  <div className="w-[160px] shrink-0 text-[13px] font-bold text-muted-foreground group-hover/item:text-foreground transition-colors truncate pr-4">
                    {category}
                  </div>
                  <div className="flex-1 relative h-[6px] bg-slate-100 dark:bg-[#1a1a1a] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`absolute left-0 top-0 h-full rounded-full ${bgColor} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                    />
                  </div>
                  <div className="w-[50px] shrink-0 text-right text-[13px] font-black text-foreground ml-4">
                    {count}
                  </div>
                </div>
              );
            };

            return (
              <Card 
                onClick={() => setIsDistributionModalOpen(true)}
                className="border border-border/50 bg-card shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[32px] flex flex-col overflow-hidden cursor-pointer group/card hover:border-emerald-200"
              >
                <CardHeader className="px-7 py-5 border-b border-border/50 flex flex-row items-center justify-between bg-emerald-50/10">
                  <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    Répartition Stock
                  </CardTitle>
                  <ArrowUpRight className="w-4 h-4 text-emerald-500 group-hover/card:translate-x-1 group-hover/card:-translate-y-1 transition-all" />
                </CardHeader>
                <CardContent className="p-7 flex-1 flex flex-col justify-center space-y-1">
                  {displayCategories.map(([category, count], idx) => (
                    <CategoryItem key={idx} category={category} count={count} idx={idx} />
                  ))}
                </CardContent>
              </Card>
            );
          })()}

          {/* Trending Items */}
          <Card 
            onClick={() => setIsSollicitationsModalOpen(true)}
            className="border border-border/50 bg-card shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[32px] flex flex-col overflow-hidden cursor-pointer group/card hover:border-blue-200"
          >
            <CardHeader className="px-7 py-5 border-b border-border/50 flex flex-row items-center justify-between bg-blue-50/10">
              <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Top Sollicitations
              </CardTitle>
              <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover/card:translate-x-1 group-hover/card:-translate-y-1 transition-all" />
            </CardHeader>
            <CardContent className="p-7 flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-1 gap-4">
                {materials.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="group/trending flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50/50 transition-all border border-transparent hover:border-blue-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xs font-black text-blue-600 border border-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground group-hover:text-blue-700 transition-colors">{item.name}</p>
                        <p className="text-[11px] font-bold text-muted-foreground mt-0.5 uppercase tracking-tighter">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{item.quantity}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.unit}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Distribution Modal */}
      <Sheet open={isDistributionModalOpen} onOpenChange={setIsDistributionModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[500px] p-0 flex flex-col border-l border-border bg-background/95 backdrop-blur-xl shadow-2xl">
          <SheetHeader className="px-8 pt-8 pb-4 border-b border-border/50 bg-emerald-50/20">
            <SheetTitle className="text-2xl font-black text-foreground flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                <BarChart3 className="w-6 h-6" />
              </div>
              Analyse par catégorie
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8 space-y-2 scrollbar-hide">
            {materials.reduce((acc: any[], item) => {
                const cat = item.category || 'Autres';
                const existing = acc.find(c => c.name === cat);
                if (existing) existing.count++;
                else acc.push({ name: cat, count: 1 });
                return acc;
              }, []).sort((a, b) => b.count - a.count).map((cat, idx) => (
              <div key={idx} className="group p-4 rounded-2xl hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-black text-foreground">{cat.name}</span>
                  <Badge className="bg-emerald-500 text-white border-none">{cat.count} articles</Badge>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(cat.count / materials.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sollicitations Modal */}
      <Sheet open={isSollicitationsModalOpen} onOpenChange={setIsSollicitationsModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[500px] p-0 flex flex-col border-l border-border bg-background/95 backdrop-blur-xl shadow-2xl">
          <SheetHeader className="px-8 pt-8 pb-4 border-b border-border/50 bg-blue-50/20">
            <SheetTitle className="text-2xl font-black text-foreground flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                <TrendingUp className="w-6 h-6" />
              </div>
              Top Sollicitations
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8 space-y-3 scrollbar-hide">
            {materials.map((item, idx) => (
              <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all">
                <div className="flex items-center gap-5">
                  <span className="text-xs font-black text-slate-300 group-hover:text-blue-500 transition-colors w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                  <div>
                    <p className="text-sm font-black text-foreground">{item.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                   <Badge variant="outline" className={item.quantity < (item.minQuantity || 5) ? 'border-rose-200 text-rose-500 bg-rose-50' : 'border-blue-200 text-blue-600 bg-blue-50'}>
                     {item.quantity} {item.unit}s
                   </Badge>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
