import { useState, useEffect } from 'react';
import { Header } from '@/layouts/Header';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { MaterialRequest, RequestStatus } from '@/types';
import { ClipboardList, Clock, CheckCircle2, XCircle, Search, Filter, RotateCcw, AlertCircle, Calendar, Activity, Inbox, Package, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/material-requests');
      const data = Array.isArray(response.data) ? response.data : [];
      const mapped = data.map((item: any) => ({
        ...item,
        materialName: item.materialName || 'Inconnu',
      }));
      setRequests(mapped);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await api.delete(`/material-requests/${requestId}`);
      toast.success('Demande annulée avec succès');
      fetchRequests();
    } catch (error) {
      console.error('Error canceling request:', error);
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const myRequests = requests.filter(r => String(r.userId) === String(user?.id));

  const filteredRequests = myRequests.filter(req => {
    const matchesSearch = (req.materialName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const requestDate = new Date(req.createdAt || req.requestDate || 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'day') {
        matchesDate = requestDate >= today;
      } else if (dateFilter === 'week') {
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), diff);
        matchesDate = requestDate >= startOfWeek;
      } else if (dateFilter === 'month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        matchesDate = requestDate >= startOfMonth;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const sortByCreationDate = (a: MaterialRequest, b: MaterialRequest) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;
    return Number(b.id) - Number(a.id);
  };

  const sortByUpdateDate = (a: MaterialRequest, b: MaterialRequest) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;
    return Number(b.id) - Number(a.id);
  };

  const ongoingRequests = [...filteredRequests]
    .filter(r => ['pending', 'approved', 'borrowed'].includes(r.status))
    .sort(sortByCreationDate);

  const historiqueRequests = [...filteredRequests]
    .filter(r => ['delivered', 'returned', 'rejected'].includes(r.status))
    .sort(sortByUpdateDate);

  const stats = {
    ongoing: myRequests.filter(r => ['pending', 'approved', 'borrowed'].includes(r.status)).length,
    historique: myRequests.filter(r => ['delivered', 'returned', 'rejected'].includes(r.status)).length,
  };

  const getOverdueInfo = (request: MaterialRequest) => {
    if (request.status !== 'borrowed' || !request.expectedReturnDate) return null;
    
    const today = new Date();
    const expected = new Date(request.expectedReturnDate);
    const diffTime = expected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { isOverdue: true, days: Math.abs(diffDays) };
    }
    return { isOverdue: false, days: diffDays };
  };

  const RequestList = ({ data }: { data: MaterialRequest[] }) => {
    const getSteps = (request: MaterialRequest) => {
      if (request.status === 'rejected') return 'rejected';
      
      const steps = [
        { key: 'pending', label: 'Demandé' },
        { key: 'approved', label: 'Approuvé' },
        { key: request.type === 'returnable' ? 'borrowed' : 'delivered', label: request.type === 'returnable' ? 'Emprunté' : 'Livré' },
      ];

      if (request.status === 'returned' || request.type === 'returnable') {
        steps.push({ key: 'returned', label: 'Retourné' });
      }

      const statusOrder = ['pending', 'approved', 'delivered', 'borrowed', 'returned'];
      const currentIndex = statusOrder.indexOf(request.status);

      return steps.map((step) => {
        const stepIndex = statusOrder.indexOf(step.key);
        return {
          ...step,
          state: stepIndex <= currentIndex ? 'completed' : stepIndex === currentIndex + 1 ? 'next' : 'future',
        };
      });
    };

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Inbox className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Aucune demande trouvée</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-8">
            Parcourez le catalogue pour faire une nouvelle demande.
          </p>
          <Link to="/portal/catalog">
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold px-8">Ouvrir le catalogue</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {data.map(request => {
            const steps = getSteps(request);
            const overdue = getOverdueInfo(request);
            
            return (
              <motion.div
                key={request.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  layout: { duration: 0.3 }
                }}
              >
                <Card 
                  className="group relative overflow-hidden border-border/40 hover:border-indigo-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 bg-white dark:bg-card/40 backdrop-blur-sm rounded-[24px]"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1.5fr_1fr] gap-6 p-6 lg:items-center">
                      
                      {/* Material Section */}
                      <div className="flex gap-5 items-center min-w-0">
                        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/10 flex items-center justify-center shrink-0 shadow-sm relative group-hover:scale-105 transition-transform duration-500">
                          <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400 relative z-10" />
                          <div className="absolute -top-1.5 -right-1.5 px-2 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg shadow-lg border border-indigo-400/20">
                            x{request.quantity}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <h4 className="font-black text-base sm:text-lg text-foreground tracking-tight leading-tight truncate">
                            {request.materialName}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-[9px] uppercase tracking-[0.1em] font-black px-2 py-0.5 rounded-md ${
                              request.type === 'consumable' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10' : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/10'
                            }`}>
                              {request.type === 'consumable' ? 'Consommable' : 'Retournable'}
                            </Badge>
                            <span className="text-[10px] font-black text-muted-foreground/30 tracking-widest uppercase">
                              #{String(request.id).slice(-4).toUpperCase()}
                            </span>
                          </div>
                          
                          {request.type === 'returnable' && request.status === 'borrowed' && (
                            <div className="mt-4 space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  Délai de retour (24h)
                                </span>
                                {(() => {
                                  const start = new Date(request.updatedAt || request.requestDate).getTime();
                                  const now = new Date().getTime();
                                  const total = 24 * 60 * 60 * 1000;
                                  const elapsed = now - start;
                                  const remaining = Math.max(0, total - elapsed);
                                  const hours = Math.floor(remaining / (1000 * 60 * 60));
                                  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                                  
                                  return (
                                    <span className={`text-[10px] font-black ${remaining < 3600000 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`}>
                                      {hours}h {minutes}m restants
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/20">
                                {(() => {
                                  const start = new Date(request.updatedAt || request.requestDate).getTime();
                                  const now = new Date().getTime();
                                  const total = 24 * 60 * 60 * 1000;
                                  const elapsed = now - start;
                                  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
                                  
                                  return (
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percent}%` }}
                                      className={`h-full transition-all duration-1000 ${
                                        percent > 90 ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                                        percent > 70 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                                        'bg-gradient-to-r from-indigo-500 to-blue-600'
                                      } relative`}
                                    >
                                      {percent > 80 && (
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                      )}
                                    </motion.div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timeline Section */}
                      <div className="min-w-0">
                        {steps === 'rejected' ? (
                          <div className="flex items-center gap-4 bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                              <XCircle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-red-500 uppercase tracking-wide">Demande Rejetée</p>
                              <p className="text-xs text-red-500/60 font-medium">L'accès à ce matériel a été refusé.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full max-w-sm mx-auto relative pt-4 pb-2">
                            <div className="absolute top-[31px] left-[15%] right-[15%] h-[3px] bg-muted/40 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 ease-out" 
                                style={{ width: `${(steps.filter(s => s.state === 'completed').length / (steps.length - 1)) * 100}%` }} 
                              />
                            </div>

                            {steps.map((step) => (
                              <div key={step.key} className="flex flex-col items-center gap-3 relative z-10 w-12">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-500 shadow-md ${
                                  step.state === 'completed' ? 'bg-indigo-600 border-indigo-600 text-white scale-110' :
                                  step.state === 'next' ? 'bg-white dark:bg-[#1A1A1A] border-indigo-500 border-dashed text-indigo-500 ring-4 ring-indigo-500/10 animate-pulse' :
                                  'bg-white dark:bg-[#1A1A1A] border-border/50 text-muted-foreground/30'
                                }`}>
                                  {step.state === 'completed' ? <Check className="w-4 h-4 stroke-[3]" /> : 
                                  step.key === 'pending' ? <Clock className="w-4 h-4" /> :
                                  step.key === 'returned' ? <RotateCcw className="w-4 h-4" /> :
                                  <Activity className="w-4 h-4" />}
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-[0.15em] text-center whitespace-nowrap ${
                                  step.state === 'completed' ? 'text-foreground' :
                                  step.state === 'next' ? 'text-indigo-500' :
                                  'text-muted-foreground/40'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Meta Section */}
                      <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-4 lg:border-l border-border/30 lg:pl-8">
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            {request.requestDate ? new Date(request.requestDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                          </div>
                          
                          {overdue && (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                              overdue.isOverdue ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                              <AlertCircle className="w-3 h-3" />
                              <span className="text-[10px] font-black uppercase tracking-tighter">
                                {overdue.isOverdue ? `Retard ${overdue.days}j` : `Dû dans ${overdue.days}j`}
                              </span>
                            </div>
                          )}

                          {request.status === 'returned' && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="text-[10px] font-black uppercase tracking-tighter">Retourné</span>
                            </div>
                          )}
                        </div>

                        {request.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            onClick={() => handleCancelRequest(request.id)}
                            className="h-8 rounded-lg border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                          >
                            Annuler
                          </Button>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/50">
      <Header 
        title="Mes demandes & Emprunts" 
        actions={
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted border-border focus:bg-card transition-colors"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-auto min-w-[144px] h-9 bg-muted border-border px-3 overflow-hidden">
                <div className="flex items-center gap-2 truncate">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Date" className="truncate" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="day">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <Tabs defaultValue="ongoing" className="w-full space-y-6">
          <TabsList className="w-full grid grid-cols-2 bg-white/50 dark:bg-card/40 backdrop-blur-md p-1.5 rounded-2xl shadow-xl shadow-indigo-500/5 border border-border/40 h-16">
            <TabsTrigger 
              value="ongoing"
              className="group flex items-center justify-center gap-3 rounded-xl px-4 text-sm font-black transition-all duration-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-600/40 hover:bg-muted/50 dark:hover:bg-white/5 min-w-0 overflow-hidden"
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <Activity className={`w-4 h-4 shrink-0 ${stats.ongoing > 0 ? 'animate-pulse' : ''}`} />
                <span className="truncate">Demandes en cours</span>
              </div>
              <div className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-lg text-[11px] font-black bg-muted/50 dark:bg-white/5 text-muted-foreground group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white transition-colors shrink-0">
                {stats.ongoing}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="historique"
              className="group flex items-center justify-center gap-3 rounded-xl px-4 text-sm font-black transition-all duration-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-600/40 hover:bg-muted/50 dark:hover:bg-white/5 min-w-0 overflow-hidden"
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span className="truncate">Historique</span>
              </div>
              <div className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-lg text-[11px] font-black bg-muted/50 dark:bg-white/5 text-muted-foreground group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white transition-colors shrink-0">
                {stats.historique}
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="mt-0 outline-none">
            <RequestList data={ongoingRequests} />
          </TabsContent>
          <TabsContent value="historique" className="mt-0 outline-none">
            <RequestList data={historiqueRequests} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

