import { useState, useEffect } from 'react';
import { Header } from '@/layouts/Header';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Material, MaterialRequest } from '@/types';
import { Package, ClipboardList, RotateCcw, ArrowUpRight, Clock, CheckCircle2, Calendar, AlertCircle, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [matRes, reqRes] = await Promise.all([
        api.get('/materials'),
        api.get('/material-requests'),
      ]);
      const dataMat = Array.isArray(matRes.data) ? matRes.data : [];
      const dataReq = Array.isArray(reqRes.data) ? reqRes.data : [];
      
      setMaterials(dataMat);
      setRequests(dataReq);
    } catch (error) {
      console.error('Error fetching user dashboard data:', error);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-background">
        <Header title={`Bienvenue...`} />
        <div className="flex-1 p-6 space-y-6 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-[24px] bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 rounded-[24px] bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-64 rounded-[24px] bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const myRequests = requests.filter(r => String(r.userId) === String(user?.id));
  const myPending = myRequests.filter(r => r.status === 'pending').length;
  const myBorrowed = myRequests.filter(r => r.status === 'borrowed');
  const totalCatalog = materials.length;

  const stats = [
    {
      title: 'Catalogue',
      value: totalCatalog,
      subLabel: 'articles disponibles',
      icon: Package,
      link: '/portal/catalog',
      color: 'blue',
    },
    {
      title: 'En attente',
      value: myPending,
      subLabel: 'demandes en cours',
      icon: Clock,
      link: '/portal/my-requests',
      color: 'amber',
    },
    {
      title: 'Emprunts actifs',
      value: myBorrowed.length,
      subLabel: 'à retourner',
      icon: RotateCcw,
      link: '/portal/my-requests',
      color: 'violet',
    },
    {
      title: 'Total demandes',
      value: myRequests.length,
      subLabel: 'toutes demandes',
      icon: ClipboardList,
      link: '/portal/my-requests',
      color: 'emerald',
    },
  ];

  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: 'En attente', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    approved: { label: 'Approuvé', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    delivered: { label: 'Livré', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    returned: { label: 'Retourné', className: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-[#252525] dark:text-[#A0A0A0] dark:border-[#2A2A2A]' },
    rejected: { label: 'Refusé', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    borrowed: { label: 'Emprunté', className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <Header title={`Bienvenue, ${user?.name || 'Utilisateur'}`} />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 p-6 space-y-6 overflow-auto"
      >
        {/* Stats Grid — Admin-style cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Link key={i} to={stat.link} className="group outline-none">
              <Card className="relative overflow-hidden border border-border/50 bg-card shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] transition-all duration-500 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:border-blue-400/30 hover:-translate-y-1.5 rounded-[24px]">
                <CardContent className="p-5 relative z-10 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:rotate-3 ${
                      stat.color === 'blue' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)]' :
                      stat.color === 'amber' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white group-hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)]' :
                      stat.color === 'violet' ? 'bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)]' :
                      'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
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
                      stat.color === 'violet' ? 'bg-violet-400' :
                      'bg-emerald-400'
                    }`} />
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-muted-foreground transition-colors uppercase tracking-wider">{stat.subLabel}</span>
                  </div>
                </CardContent>
                
                {/* Decorative background glow */}
                <div className={`absolute -right-8 -bottom-8 w-32 h-32 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none ${
                    stat.color === 'blue' ? 'bg-blue-600' :
                    stat.color === 'amber' ? 'bg-amber-600' :
                    stat.color === 'violet' ? 'bg-violet-600' :
                    'bg-emerald-600'
                }`} />
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Borrowed Items - Priority */}
          <Card className="border border-border/50 bg-card shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] flex flex-col overflow-hidden !py-0 !gap-0">
            <div className="px-5 py-3 border-b border-border shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500 text-white flex items-center justify-center shadow-sm shadow-violet-200">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="text-[13px] font-bold text-foreground">Matériels empruntés</h3>
              </div>
              <Link to="/portal/my-requests" className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium hover:text-violet-500 transition-colors">
                Tout voir →
              </Link>
            </div>
            <CardContent className="!px-5 !pt-3 pb-4 flex-1 flex flex-col justify-start">
              {myBorrowed.length === 0 ? (
                <div className="py-8 text-center">
                  <RotateCcw className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">Aucun emprunt en cours</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myBorrowed.map(item => (
                    <div key={item.id} className="group/item flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                      <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 dark:bg-violet-900/20 dark:border-violet-900/30 flex items-center justify-center group-hover/item:bg-violet-100 transition-colors">
                      <RotateCcw className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                    </div>
                        <div>
                          <p className="text-[13px] font-medium text-foreground group-hover/item:text-violet-700 transition-colors">{item.materialName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-500" />
                              <span className="text-[11px] text-amber-600 font-medium">Échéance : {item.expectedReturnDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 px-2 py-1 rounded-md border border-violet-200/50 dark:border-violet-800/50">En possession</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-border/50 bg-card shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] flex flex-col overflow-hidden !py-0 !gap-0">
            <div className="px-5 py-3 border-b border-border shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-[13px] font-bold text-foreground">Activité récente</h3>
              </div>
              <Link to="/portal/my-requests" className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium hover:text-blue-500 transition-colors">
                Tout voir →
              </Link>
            </div>
            <CardContent className="!px-5 !pt-3 pb-4 flex-1 flex flex-col justify-start">
              {myRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">Aucune activité récente</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {myRequests.slice(0, 5).map((req, idx) => {
                    const status = statusMap[req.status] || statusMap.pending;
                    return (
                      <div key={req.id} className="group/item py-2.5 flex items-center justify-between border-b border-border/50 last:border-border hover:bg-muted/50 px-3 -mx-3 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-5 text-xs font-medium text-slate-300 group-hover/item:text-blue-500 transition-colors">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-foreground group-hover/item:text-blue-600 transition-colors">{req.materialName}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {req.requestDate} · {req.quantity} article(s)
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

