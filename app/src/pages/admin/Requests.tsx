import { useState, useEffect } from 'react';
import { Header } from '@/layouts/Header';
import api from '@/lib/api';
import type { MaterialRequest, Material, RequestStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  CheckCircle,
  XCircle,
  Package,
  RotateCcw,
  Calendar,
  Clock,
  Activity,
  ClipboardList,
  Filter,
  Inbox,
  BellRing,
  Check,
  X,
  Trash2,
  Edit,
  Save,
  ChevronRight,
  Minus,
  Plus,
  MoreHorizontal,
  ShieldAlert
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function Requests() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, matRes] = await Promise.all([
        api.get('/material-requests'),
        api.get('/materials')
      ]);
      
      const reqData = Array.isArray(reqRes.data) ? reqRes.data : [];
      const matData = Array.isArray(matRes.data) ? matRes.data : [];
      
      const mappedRequests = reqData.map((req: any) => ({
        ...req,
        userName: req.userName || 'Inconnu',
        materialName: req.materialName || 'Inconnu',
      }));
      
      setRequests(mappedRequests);
      setMaterials(matData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const RequestsSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border/50 animate-pulse" />
        ))}
      </div>
    </div>
  );

  const [confirmingAction, setConfirmingAction] = useState<{ id: string, type: RequestStatus, materialName: string, userName: string } | null>(null);
  
  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    // 1. Capture current state for rollback if needed
    const previousRequests = [...requests];
    
    // 2. Optimistically update local state
    setRequests(prev => prev.map(req => {
      if (String(req.id) === String(requestId)) {
        const updateData: any = { ...req, status: newStatus };
        if (newStatus === 'delivered') updateData.deliveryDate = new Date().toISOString().split('T')[0];
        if (newStatus === 'returned') updateData.returnDate = new Date().toISOString().split('T')[0];
        updateData.updatedAt = new Date().toISOString();
        return updateData;
      }
      return req;
    }));

    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'delivered') updateData.deliveryDate = new Date().toISOString().split('T')[0];
      if (newStatus === 'returned') updateData.returnDate = new Date().toISOString().split('T')[0];
      
      const response = await api.put(`/material-requests/${requestId}`, updateData);
      
      // 3. Update with real server data
      setRequests(prev => prev.map(req => 
        String(req.id) === String(requestId) ? response.data : req
      ));
      
      toast.success(`Statut mis à jour : ${newStatus}`);
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Erreur lors de la mise à jour');
      setRequests(previousRequests);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      (request.materialName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.userName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const requestDate = new Date(request.createdAt || request.requestDate || 0);
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

  const stats = {
    total: requests.length,
    ongoing: requests.filter(r => ['pending', 'approved', 'borrowed'].includes(r.status)).length,
    historique: requests.filter(r => ['delivered', 'returned', 'rejected'].includes(r.status)).length,
    pendingOnly: requests.filter(r => r.status === 'pending').length,
  };

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

  const ongoingRequests = filteredRequests
    .filter(r => ['pending', 'approved', 'borrowed'].includes(r.status))
    .sort(sortByCreationDate);
    
  const historiqueRequests = filteredRequests
    .filter(r => ['delivered', 'returned', 'rejected'].includes(r.status))
    .sort(sortByUpdateDate);

  const getStatusBadge = (status: RequestStatus) => {
    const variants: Record<RequestStatus, { className: string; label: string }> = {
      pending: { className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'En attente' },
      approved: { className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Approuvé' },
      delivered: { className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Livré' },
      returned: { className: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-[#252525] dark:text-[#A0A0A0] dark:border-[#2A2A2A]', label: 'Retourné' },
      rejected: { className: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejeté' },
      borrowed: { className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', label: 'Emprunté' },
    };
    const item = variants[status] || variants.pending;
    return <div className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${item.className}`}>{item.label}</div>;
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card className="group overflow-hidden border border-border/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 bg-white dark:bg-[#1A1A1A] backdrop-blur-xl">
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2 group-hover:text-indigo-500 transition-colors">{title}</p>
            <h3 className="text-3xl font-black text-foreground tracking-tighter transition-all duration-300 group-hover:translate-x-1">{value}</h3>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}>
            <Icon className="w-7 h-7" />
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <Inbox className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{message}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        Aucune demande trouvée pour cette catégorie ou ce filtre.
      </p>
    </div>
  );

  const getOverdueInfo = (request: any) => {
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

  const RequestTable = ({ data }: { data: any[] }) => {
    const getSteps = (request: any) => {
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

    if (data === undefined || data.length === 0) {
       return <EmptyState message={searchQuery || dateFilter !== 'all' ? "Aucun résultat pour vos filtres" : "Aucune demande à afficher"} />;
    }

    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {data.map(request => {
              const steps = getSteps(request);
              const userName = request.userName || 'Inconnu';
              const initials = userName.split(' ').map((n: string) => n[0] || '').join('').toUpperCase() || '?';
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
                  <Card className="group relative overflow-hidden border-border/40 hover:border-indigo-500/30 transition-all duration-700 bg-white/50 dark:bg-card/40 backdrop-blur-sm rounded-[28px] premium-shadow-hover">
                    <CardContent className="p-0 relative group/card">
                      <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1fr_2.5fr_auto] gap-6 p-6 lg:items-center relative z-10">
                        <div className="flex gap-5 items-center min-w-0">
                          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/10 flex items-center justify-center shrink-0 shadow-sm relative group-hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 bg-indigo-500/5 rounded-[20px] animate-pulse" />
                            <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400 relative z-10" />
                            <div className="absolute -top-1.5 -right-1.5 px-2 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg shadow-lg border border-indigo-400/20">
                              x{request.quantity}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <h4 className="font-black text-base sm:text-lg text-foreground tracking-tight leading-tight truncate">
                              {request.materialName || 'Inconnu'}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={`text-[9px] uppercase tracking-[0.1em] font-black px-2 py-0.5 rounded-md ${
                                request.type === 'consumable' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10' : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/10'
                              }`}>
                                {request.type === 'consumable' ? 'Consommable' : 'Retournable'}
                              </Badge>
                              <span className="text-[10px] font-black text-muted-foreground/30 tracking-widest uppercase">
                                #{String(request.id || '0000').slice(-4).toUpperCase()}
                              </span>
                            </div>
                            
                            {request.type === 'returnable' && request.status === 'borrowed' && (
                              <div className="mt-4 space-y-2">
                                <div className="flex justify-between items-center px-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-indigo-500" />
                                    Délai 24h
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

                        <div className="flex items-center gap-3 lg:border-l border-border/30 lg:pl-6">
                          <div className="relative">
                            <Avatar className="w-10 h-10 border-2 border-white dark:border-indigo-500/20 shadow-md">
                              <AvatarFallback className="text-[10px] font-black bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#1A1A1A] dark:to-[#121212] text-muted-foreground">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#121212] rounded-full shadow-sm" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest leading-none mb-1">Demandeur</p>
                            <p className="text-sm font-bold text-foreground/80 truncate leading-none">{userName}</p>
                          </div>
                        </div>

                        <div className="min-w-0 lg:px-6">
                          {steps === 'rejected' ? (
                            <div className="flex items-center gap-4 bg-red-500/5 border border-red-500/10 rounded-2xl p-4 group-hover:bg-red-500/10 transition-colors">
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
                              <div className="absolute top-[31px] left-[15%] right-[15%] h-[3px] bg-muted/40 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 ease-out" style={{ width: `${(steps.filter((s: any) => s.state === 'completed').length / (steps.length - 1)) * 100}%` }} />
                              </div>

                              {steps.map((step: any, idx: number) => (
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

                        <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-4 lg:border-l border-border/30 lg:pl-8">
                          <TooltipProvider delayDuration={200}>
                            <div className="flex flex-col items-start lg:items-end gap-3">
                              {request.status === 'pending' && (
                                <div className="flex items-center gap-2 bg-muted/30 dark:bg-white/5 rounded-[18px] p-1.5 border border-border/30">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        className="flex items-center justify-center h-10 px-5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-[0.1em] shadow-lg shadow-indigo-600/20 active:scale-95"
                                        onClick={() => handleStatusChange(request.id, 'approved')}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approuver
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-indigo-600 text-white border-none font-bold py-2 px-4 rounded-xl shadow-xl">
                                      <p>Valider la demande et autoriser la sortie du matériel</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-500/20"
                                        onClick={() => setConfirmingAction({ 
                                          id: request.id, 
                                          type: 'rejected', 
                                          materialName: request.materialName,
                                          userName: request.userName 
                                        })}
                                      >
                                        <XCircle className="w-5 h-5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-red-600 text-white border-none font-bold py-2 px-4 rounded-xl shadow-xl">
                                      <p>Refuser cette demande et annuler le processus</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              )}

                              {(request.status === 'approved' || (['delivered', 'borrowed'].includes(request.status) && request.type === 'returnable')) && (
                                <div className="flex items-center gap-2 bg-muted/30 dark:bg-white/5 rounded-[18px] p-1.5 border border-border/30">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        className="flex items-center gap-2 h-10 px-6 text-[10px] font-black uppercase tracking-[0.15em] bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                        onClick={() => {
                                          if (request.status === 'approved') {
                                            handleStatusChange(request.id, request.type === 'returnable' ? 'borrowed' : 'delivered');
                                          } else {
                                            setConfirmingAction({ 
                                              id: request.id, 
                                              type: 'returned', 
                                              materialName: request.materialName,
                                              userName: request.userName 
                                            });
                                          }
                                        }}
                                      >
                                        {request.status === 'approved' ? (
                                          <>
                                            <Package className="w-4 h-4" />
                                            <span>{request.type === 'returnable' ? 'Emprunter' : 'Livrer'}</span>
                                          </>
                                        ) : (
                                          <>
                                            <RotateCcw className="w-4 h-4" />
                                            <span>Valider le retour</span>
                                          </>
                                        )}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-indigo-600 text-white border-none font-bold py-2 px-4 rounded-xl shadow-xl">
                                      <p>
                                        {request.status === 'approved' 
                                          ? (request.type === 'returnable' ? 'Confirmer que l\'utilisateur a pris possession du matériel en prêt' : 'Confirmer la remise définitive du consommable')
                                          : 'Enregistrer le retour du matériel dans l\'inventaire'}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>

                                  {overdue?.isOverdue && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all animate-bounce shadow-lg shadow-red-600/30"
                                          onClick={() => toast.info(`Rappel envoyé à ${request.userName}`, {
                                            description: `Un message a été envoyé pour le matériel : ${request.materialName}`,
                                            icon: <BellRing className="w-4 h-4 text-indigo-500" />
                                          })}
                                        >
                                          <BellRing className="w-4 h-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="bg-red-600 text-white border-none font-bold py-2 px-4 rounded-xl shadow-xl">
                                        <p>Envoyer une alerte de rappel immédiate à l'utilisateur</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              )}
                            </div>
                          </TooltipProvider>

                          <div className="flex flex-col items-end gap-1.5 opacity-60">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                              {request.requestDate ? new Date(request.requestDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                            </div>
                            {overdue && (
                              <Badge variant="outline" className={`text-[8px] font-black border-transparent uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                overdue.isOverdue ? 'bg-red-500 text-white' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              }`}>
                                {overdue.isOverdue ? 'Retard' : 'À venir'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] min-h-0 bg-background/50">
      <Header 
        title="Gestion des demandes" 
        actions={
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted border-border focus:bg-card"
              />
            </div>
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
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

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 p-6 space-y-6 overflow-auto"
      >
        {loading ? <RequestsSkeleton /> : (
          <Tabs defaultValue="ongoing" className="w-full space-y-8">
          <div className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-white/50 dark:bg-card/40 backdrop-blur-md p-1.5 rounded-2xl shadow-xl shadow-indigo-500/5 border border-border/40 h-16">
              {[
                { id: 'ongoing', label: 'Demandes en cours', icon: Activity, count: stats.ongoing, color: 'indigo' },
                { id: 'historique', label: 'Historique', icon: RotateCcw, count: stats.historique, color: 'slate' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="group flex items-center justify-center gap-3 rounded-xl px-4 text-sm font-black transition-all duration-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-600/40 hover:bg-muted/50 dark:hover:bg-white/5 min-w-0 overflow-hidden"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <tab.icon className={`w-4 h-4 shrink-0 transition-transform ${tab.id === 'ongoing' && tab.count > 0 ? 'animate-pulse' : ''}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <div className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-lg text-[11px] font-black bg-muted/50 dark:bg-white/5 text-muted-foreground group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white transition-colors shrink-0">
                    {tab.count}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="ongoing" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <RequestTable data={ongoingRequests} />
          </TabsContent>

          <TabsContent value="historique" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <RequestTable data={historiqueRequests} />
          </TabsContent>
          </Tabs>
        )}
      </motion.div>
      <AnimatePresence>
        {confirmingAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmingAction(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 shadow-2xl border border-border/40 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                  <ShieldAlert className="w-10 h-10 text-indigo-500" />
                </div>
                
                <h3 className="text-xl font-black text-foreground mb-3 tracking-tight">Confirmation requise</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
                  {confirmingAction.type === 'returned' ? (
                    <>Wach <span className="text-indigo-600 font-black">{confirmingAction.userName}</span> red <span className="text-indigo-600 font-black">{confirmingAction.materialName}</span> wla la ?</>
                  ) : confirmingAction.type === 'rejected' ? (
                    <>Êtes-vous sûr de vouloir rejeter la demande de <span className="text-red-500 font-black">{confirmingAction.userName}</span> ?</>
                  ) : (
                    <>Voulez-vous confirmer cette action ?</>
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => {
                      handleStatusChange(confirmingAction.id, confirmingAction.type);
                      setConfirmingAction(null);
                    }}
                    className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Oui, confirmer
                  </button>
                  <button
                    onClick={() => setConfirmingAction(null)}
                    className="flex-1 h-14 rounded-2xl bg-muted/50 text-muted-foreground font-black text-sm uppercase tracking-widest hover:bg-muted hover:text-foreground transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
