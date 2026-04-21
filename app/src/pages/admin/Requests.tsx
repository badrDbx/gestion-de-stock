import { useState } from 'react';
import { Header } from '@/layouts/Header';
import { mockRequests, mockMaterials } from '@/data/mockData';
import type { MaterialRequest, RequestStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Package,
  RotateCcw,
  Calendar,
  User,
  Clock,
  Activity,
  ClipboardList,
  Filter,
  ArrowRight,
  Inbox,
  AlertTriangle,
  BellRing,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Requests() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [requests, setRequests] = useState<MaterialRequest[]>(mockRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'consumable' | 'returnable'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    materialId: '',
    quantity: 1,
    notes: '',
  });

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const userRequests = filteredRequests.filter(r => r.userId === user?.id);
  
  // Logical splitting for the new UI: "En cours" vs "Historique"
  const stats = {
    total: requests.length,
    ongoing: requests.filter(r => ['pending', 'approved', 'borrowed'].includes(r.status)).length,
    historique: requests.filter(r => ['delivered', 'returned', 'rejected'].includes(r.status)).length,
    pendingOnly: requests.filter(r => r.status === 'pending').length, // For the pulse badge
  };

  const ongoingRequests = filteredRequests.filter(r => ['pending', 'approved', 'borrowed'].includes(r.status));
  const historiqueRequests = filteredRequests.filter(r => ['delivered', 'returned', 'rejected'].includes(r.status));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const material = mockMaterials.find(m => m.id === formData.materialId);
    if (!material) return;

    const newRequest: MaterialRequest = {
      id: Date.now().toString(),
      userId: user?.id || '',
      userName: user?.name || '',
      materialId: material.id,
      materialName: material.name,
      quantity: formData.quantity,
      status: 'pending',
      type: material.type,
      requestDate: new Date().toISOString(),
      notes: formData.notes,
    };

    setRequests([newRequest, ...requests]);
    setIsDialogOpen(false);
    setFormData({ materialId: '', quantity: 1, notes: '' });
  };

  const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
    setRequests(requests.map(r =>
      r.id === requestId
        ? {
            ...r,
            status: newStatus,
            deliveryDate: newStatus === 'delivered' ? new Date().toISOString() : r.deliveryDate,
            returnDate: newStatus === 'returned' ? new Date().toISOString() : r.returnDate,
          }
        : r
    ));
  };

  const getStatusBadge = (status: RequestStatus) => {
    const variants: Record<RequestStatus, { className: string; label: string }> = {
      pending: { className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'En attente' },
      approved: { className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Approuvé' },
      delivered: { className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Livré' },
      returned: { className: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-[#252525] dark:text-[#A0A0A0] dark:border-[#2A2A2A]', label: 'Retourné' },
      rejected: { className: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejeté' },
      borrowed: { className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', label: 'Emprunté' },
    };
    const item = variants[status];
    return <div className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${item.className}`}>{item.label}</div>;
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-black text-foreground tracking-tight">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
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

  const RequestTable = ({ data }: { data: MaterialRequest[] }) => {
    // Timeline step definitions
    const getSteps = (request: MaterialRequest) => {
      if (request.status === 'rejected') return 'rejected';
      
      const steps = [
        { key: 'pending', label: 'Demandé' },
        { key: 'approved', label: 'Approuvé' },
        { key: request.type === 'returnable' ? 'borrowed' : 'delivered', label: request.type === 'returnable' ? 'Emprunté' : 'Livré' },
      ];

      // If returned, add the final step
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
       return <EmptyState message={searchQuery || typeFilter !== 'all' ? "Aucun résultat pour vos filtres" : "Aucune demande à afficher"} />;
    }

    return (
      <div className="space-y-3">
        {/* Premium Header Bar (Desktop Only) */}
        <div className="hidden lg:grid grid-cols-[2.2fr_4fr_auto] gap-4 px-8 py-3 bg-card/40 backdrop-blur-sm border border-border/40 rounded-[16px] mb-2 shadow-sm ring-1 ring-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.15em]">
            <Package className="w-3.5 h-3.5 text-indigo-500/50" />
            <span>Informations</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.15em]">
            <Activity className="w-3.5 h-3.5 text-indigo-500/50" />
            <span>Parcours de la demande</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.15em]">
            <ClipboardList className="w-3.5 h-3.5 text-indigo-500/50" />
            <span>Actions</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {data.map(request => {
            const steps = getSteps(request);
            const initials = request.userName.split(' ').map(n => n[0]).join('').toUpperCase();
            const overdue = getOverdueInfo(request);

            return (
              <Card 
                key={request.id} 
                className={`group relative overflow-hidden transition-all duration-500 border-border/50 bg-card/50 backdrop-blur-sm rounded-[20px] hover:-translate-y-0.5 hover:shadow-xl hover:border-indigo-500/20 ${
                  overdue?.isOverdue ? 'ring-1 ring-red-500/20 bg-red-500/[0.02]' : ''
                }`}
              >
                <CardContent className="p-5 grid grid-cols-1 lg:grid-cols-[2.2fr_4fr_auto] items-center gap-5 lg:gap-4">
                  
                  {/* Col 1: Unified Info (Material + User) */}
                  <div className="flex items-center gap-4 min-w-0 pr-4 lg:border-r border-border/10">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105 ${
                      request.type === 'consumable' ? 'bg-orange-500/10 text-orange-600' : 'bg-indigo-500/10 text-indigo-600'
                    }`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-foreground truncate leading-tight">{request.materialName}</h3>
                        <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest shrink-0">×{request.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`rounded-md text-[7px] h-[18px] px-1.5 font-black uppercase tracking-widest border-none ${
                          request.type === 'consumable' ? 'bg-orange-500/10 text-orange-600' : 'bg-indigo-500/10 text-indigo-600'
                        }`}>
                          {request.type === 'consumable' ? 'Consommable' : 'Retournable'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground/50">•</span>
                        <div className="flex items-center gap-1.5">
                          <Avatar className="w-4 h-4 border border-border/50">
                            <AvatarFallback className="text-[6px] font-black bg-muted text-muted-foreground/70">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] font-semibold text-muted-foreground/70 truncate">{request.userName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Full-Width Timeline (Parcours) */}
                  <div className="w-full px-2 lg:px-4">
                    {steps === 'rejected' ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-500/5 rounded-xl border border-red-500/10 w-fit mx-auto">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Demande Rejetée</span>
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-between w-full max-w-[480px] mx-auto px-4">
                        <div className="absolute top-[18px] left-[8%] right-[8%] h-[2px] bg-muted/20 -z-0 rounded-full" />
                        {(steps as Array<{key: string; label: string; state: string}>).map((step, idx, arr) => {
                          const Icon = step.key === 'pending' ? Clock : step.key === 'approved' ? CheckCircle : step.key === 'returned' ? RotateCcw : Package;
                          return (
                            <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                              {idx < arr.length - 1 && (
                                <div className={`absolute top-[18px] left-[50%] w-full h-[2px] -z-10 ${step.state === 'completed' ? 'bg-slate-900 dark:bg-slate-100 animate-path-fill' : 'bg-transparent'}`} />
                              )}
                              <div className={`relative w-9 h-9 flex items-center justify-center rounded-xl border-2 transition-all duration-500 ${step.state === 'completed' ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 shadow-sm' : step.state === 'next' ? 'bg-card border-blue-600 text-blue-600 animate-glow-pulse animate-step-pop' : 'bg-muted/50 border-muted/50 text-muted-foreground/40'}`}>
                                <Icon className={`w-4 h-4 ${step.state === 'next' ? 'animate-bounce-subtle' : ''}`} />
                                {step.state === 'completed' && (
                                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card flex items-center justify-center animate-step-pop">
                                    <div className="w-1 h-1 bg-white rounded-full" />
                                  </div>
                                )}
                              </div>
                              <span className={`mt-2.5 text-[8px] font-black uppercase tracking-tight text-center leading-none transition-all duration-300 ${step.state === 'completed' ? 'text-foreground opacity-100' : step.state === 'next' ? 'text-blue-600 font-bold' : 'text-muted-foreground/30'}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Col 3: The "Control Center" (Actions + Meta) */}
                  <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/10 shrink-0">
                    {/* Admin Action Buttons */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 animate-step-pop">
                        {request.status === 'pending' && (
                          <div className="flex items-center gap-1.5 bg-muted/30 dark:bg-muted/20 rounded-xl p-1.5 border border-border/20">
                            <button 
                              className="flex items-center gap-1.5 h-8 px-3 text-[9px] font-black uppercase bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm active:scale-95 transition-all tracking-wider"
                              onClick={() => handleStatusChange(request.id, 'approved')}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approuver</span>
                            </button>
                            <button 
                              className="flex items-center gap-1.5 h-8 px-3 text-[9px] font-black uppercase text-red-600 hover:bg-red-500/10 rounded-lg transition-all tracking-wider"
                              onClick={() => handleStatusChange(request.id, 'rejected')}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rejeter</span>
                            </button>
                          </div>
                        )}
                        {request.status === 'approved' && (
                          <div className="flex items-center bg-muted/30 dark:bg-muted/20 rounded-xl p-1.5 border border-border/20">
                            <button
                              className="flex items-center gap-1.5 h-8 px-4 text-[9px] font-black uppercase bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 rounded-lg shadow-sm active:scale-95 transition-all tracking-wider"
                              onClick={() => handleStatusChange(request.id, request.type === 'returnable' ? 'borrowed' : 'delivered')}
                            >
                              <Package className="w-3.5 h-3.5" />
                              <span>{request.type === 'returnable' ? 'Emprunt' : 'Livrer'}</span>
                            </button>
                          </div>
                        )}
                        {(request.status === 'delivered' || request.status === 'borrowed') && request.type === 'returnable' && (
                          <div className="flex items-center gap-1.5 bg-muted/30 dark:bg-muted/20 rounded-xl p-1.5 border border-border/20">
                            <button
                              className="flex items-center gap-1.5 h-8 px-4 text-[9px] font-black uppercase text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all tracking-wider"
                              onClick={() => handleStatusChange(request.id, 'returned')}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retour</span>
                            </button>
                            {overdue?.isOverdue && (
                              <button
                                className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all animate-pulse"
                                onClick={() => alert(`Rappel envoyé à ${request.userName}`)}
                              >
                                <BellRing className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Date & Ref Badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 text-muted-foreground/60 text-[9px] font-bold tracking-wide">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.requestDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </div>
                      <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">
                        #{request.id.slice(-4).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </CardContent>

                {/* Status Indicator Banner (Left Edge) */}
                <div className={`absolute top-0 left-0 w-[3px] h-full ${
                  request.status === 'pending' ? 'bg-amber-400/50' :
                  request.status === 'approved' ? 'bg-blue-400/50' :
                  request.status === 'delivered' || request.status === 'borrowed' ? 'bg-emerald-400/50' :
                  request.status === 'rejected' ? 'bg-red-400/50' :
                  'bg-slate-400/50'
                } ${overdue?.isOverdue ? 'bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : ''}`} />
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <Header 
        title="Suivi des Demandes" 
        actions={
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher article ou utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted border-border focus:bg-card transition-all"
              />
            </div>
            <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
              <SelectTrigger className="w-44 h-9 bg-muted border-border">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Tous les types" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="consumable">Consommables</SelectItem>
                <SelectItem value="returnable">Retournables</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        primaryAction={
          !isAdmin && (
            <Button onClick={() => setIsDialogOpen(true)} className="h-9 gap-2 shadow-sm font-semibold">
              <Plus className="w-4 h-4" />
              Nouvelle Demande
            </Button>
          )
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {/* Requests Tabs */}
        <Tabs defaultValue="ongoing" className="w-full space-y-6">
          <TabsList className="bg-card p-1 rounded-2xl shadow-sm border border-border w-full sm:w-auto flex flex-wrap h-auto sm:h-12">
            {[
              { id: 'ongoing', label: 'Demandes en cours', icon: Activity, count: stats.ongoing },
              { id: 'historique', label: 'Historique', icon: RotateCcw, count: stats.historique },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 px-6 py-2 sm:py-0 data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-xl transition-all h-full"
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-bold text-[11px] uppercase tracking-wider">{tab.label}</span>
                <Badge 
                  variant="secondary" 
                  className={`ml-2 text-[10px] h-5 min-w-[24px] px-1 justify-center rounded-md border-none ${
                    tab.id === 'ongoing' && stats.pendingOnly > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="ongoing" className="mt-0 outline-none">
            <RequestTable data={isAdmin ? ongoingRequests : ongoingRequests.filter(r => r.userId === user?.id)} />
          </TabsContent>

          <TabsContent value="historique" className="mt-0 outline-none">
            <RequestTable data={isAdmin ? historiqueRequests : historiqueRequests.filter(r => r.userId === user?.id)} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
