import { useState } from 'react';
import { Header } from '@/layouts/Header';
import { mockMaterials, mockRequests, mockBorrowedItems, mockUsers } from '@/data/mockData';
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
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
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


export function Dashboard() {
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [isSollicitationsModalOpen, setIsSollicitationsModalOpen] = useState(false);
  const totalItemsCount = mockMaterials.reduce((sum, m) => sum + m.quantity, 0);
  const consumablesCount = mockMaterials.filter(m => m.type === 'consumable').reduce((sum, m) => sum + m.quantity, 0);
  const returnablesCount = mockMaterials.filter(m => m.type === 'returnable').reduce((sum, m) => sum + m.quantity, 0);
  const totalUsers = mockUsers.length;
  const pendingRequestsCount = mockRequests.filter(r => r.status === 'pending').length;

  const stats = [
    { title: 'Total matériel', value: totalItemsCount, icon: Package, subLabel: 'articles en stock', link: '/admin/materials', color: 'blue' },
    { title: 'Consommables', value: consumablesCount, icon: ClipboardList, subLabel: 'non récupérables', link: '/admin/materials?type=consumable', color: 'amber' },
    { title: 'Récupérables', value: returnablesCount, icon: RotateCcw, subLabel: 'à retourner', link: '/admin/materials?type=returnable', color: 'indigo' },
    { title: 'Demandes en attente', value: pendingRequestsCount, icon: Clock, subLabel: 'demandes à traiter', link: '/admin/requests?status=pending', color: 'rose' },
    { title: 'Utilisateurs enregistrés', value: totalUsers, icon: Users, subLabel: 'agents enregistrés', link: '/admin/users', color: 'emerald' },
  ];

  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    approved: { label: 'Approved', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    delivered: { label: 'Delivered', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    returned: { label: 'Returned', className: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-[#252525] dark:text-[#A0A0A0] dark:border-[#2A2A2A]' },
    rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    borrowed: { label: 'Borrowed', className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  };

  // Priority Stock Alerts (Top 3 most critical)
  const priorityAlerts = [...mockMaterials]
    .filter(m => m.quantity <= m.minQuantity)
    .sort((a, b) => (a.quantity / a.minQuantity) - (b.quantity / b.minQuantity))
    .slice(0, 3);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <Header 
        title="Tableau de bord Admin" 
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
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
                
                {/* Decorative background glow */}
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

        {/* Main Content Area: Distribution and Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stock Distribution by Category */}
          {(() => {
            const distributionByCategory = mockMaterials.reduce((acc, item) => {
              const cat = item.category || 'Autres';
              acc[cat] = (acc[cat] || 0) + item.quantity;
              return acc;
            }, {} as Record<string, number>);

            const allCategories = Object.entries(distributionByCategory)
              .sort((a, b) => b[1] - a[1]);
            
            const topCategories = allCategories.slice(0, 7);
            const displayCategories = [...topCategories];
            while (displayCategories.length < 7) {
              displayCategories.push(['—', 0]);
            }
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
              const isPlaceholder = category === '—';
              const percentage = isPlaceholder ? 0 : Math.round((count / maxQuantity) * 100);
              const defaultColors = ['bg-blue-500', 'bg-sky-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500'];
              const bgColor = categoryColors[category] || defaultColors[idx % defaultColors.length];
              
              return (
                <div key={idx} className={`flex items-center justify-between py-1.5 group/item ${isPlaceholder ? 'opacity-20' : ''}`}>
                  <div className="w-[140px] shrink-0 text-[13px] text-muted-foreground group-hover/item:text-foreground transition-colors truncate pr-4">
                    {category}
                  </div>
                  <div className="flex-1 relative h-[4px] bg-slate-200 dark:bg-[#252525] rounded-full overflow-hidden">
                    {!isPlaceholder && (
                      <div 
                        className={`absolute left-0 top-0 h-full rounded-full ${bgColor} dark:shadow-[0_0_8px_rgba(255,255,255,1)] opacity-90 transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                  </div>
                  <div className="w-[40px] shrink-0 text-right text-[13px] font-medium text-foreground">
                    {isPlaceholder ? '' : count}
                  </div>
                </div>
              );
            };

            return (
              <>
                <Card 
                  onClick={() => setIsDistributionModalOpen(true)}
                  className="border border-border/50 bg-card shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] flex flex-col overflow-hidden cursor-pointer group/card border-transparent hover:border-emerald-200 !py-0 !gap-0"
                >
                  <div className="px-5 py-2 border-b border-border shrink-0 flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-foreground">Répartition par catégorie</h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium group-hover/card:text-blue-500 transition-colors">Détails →</span>
                  </div>
                  <CardContent className="!px-5 !pt-2 pb-4 flex-1 flex flex-col justify-start space-y-0.5">
                    {displayCategories.map(([category, count], idx) => (
                      <CategoryItem key={idx} category={category} count={count} idx={idx} />
                    ))}
                  </CardContent>
                </Card>

                <Sheet open={isDistributionModalOpen} onOpenChange={setIsDistributionModalOpen}>
                  <SheetContent side="right" className="w-full sm:max-w-[450px] p-0 flex flex-col border-l border-border bg-background/95 backdrop-blur-xl shadow-2xl">
                    <SheetHeader gardens="px-6 pt-6 pb-0 border-b-0 bg-transparent">
                      <SheetTitle className="text-lg font-black text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        Répartition par catégorie
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto px-6 pt-2 pb-6 space-y-1 scrollbar-thin">
                      {allCategories.map(([category, count], idx) => (
                        <div key={category} className="group/drawer-item p-3 rounded-xl hover:bg-muted transition-all border border-border/50 hover:border-emerald-200">
                          <CategoryItem category={category} count={count} idx={idx} />
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            );
          })()}

          {/* Top Trending Items */}
          {(() => {
            const TrendingItem = ({ item, idx }: { item: typeof mockMaterials[0], idx: number }) => (
              <div key={idx} className="group/item py-2 flex items-center justify-between border-b border-border/50 last:border-border hover:bg-muted/50 px-3 -mx-3 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-5 text-xs font-medium text-muted-foreground group-hover/item:text-blue-500 transition-colors">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground group-hover/item:text-blue-600 transition-colors">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                       {item.quantity} {item.unit}s en stock
                    </p>
                  </div>
                </div>
                <div className="text-[11px] font-medium text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded text-right">
                  +12%
                </div>
              </div>
            );

            return (
              <>
                <Card 
                  onClick={() => setIsSollicitationsModalOpen(true)}
                  className="border border-border/50 bg-card shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] flex flex-col overflow-hidden cursor-pointer group/card border-transparent hover:border-blue-200 !py-0 !gap-0"
                >
                  <div className="px-5 py-2 border-b border-border shrink-0 flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-foreground">Articles les plus sollicités</h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium group-hover/card:text-blue-500 transition-colors">Analyse →</span>
                  </div>
                  <CardContent className="!px-5 !pt-2 pb-4 flex-1 flex flex-col justify-start">
                    <div className="flex flex-col space-y-0.5">
                      {mockMaterials.slice(0, 4).map((item, idx) => (
                        <TrendingItem key={idx} item={item} idx={idx} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Sheet open={isSollicitationsModalOpen} onOpenChange={setIsSollicitationsModalOpen}>
                  <SheetContent side="right" className="w-full sm:max-w-[450px] p-0 flex flex-col border-l border-border bg-background/95 backdrop-blur-xl shadow-2xl">
                    <SheetHeader className="px-6 pt-6 pb-0 border-b-0 bg-transparent">
                      <SheetTitle className="text-lg font-black text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        Articles les plus sollicités
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto px-6 pt-2 pb-6 space-y-1 scrollbar-thin">
                      {mockMaterials.map((item, idx) => (
                        <div key={item.id} className="group/drawer-item flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-all border border-border/50 hover:border-blue-200">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-300 w-6 group-hover/drawer-item:text-blue-500 transition-colors tracking-tighter">0{idx + 1}</span>
                            <div>
                              <p className="text-sm font-bold text-foreground group-hover/drawer-item:text-slate-950 transition-colors">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground mt-1 font-medium tracking-wide flex items-center gap-1.5">
                                <span className={item.quantity < (item.minQuantity || 5) ? 'text-rose-500' : 'text-muted-foreground'}>
                                  {item.quantity} {item.unit}s
                                </span>
                                <span className="text-slate-200">•</span>
                                <span>Article {item.type === 'consumable' ? 'Consommable' : 'Récupérable'}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="text-[10px] font-black text-emerald-600 bg-emerald-50/80 px-2 py-1 rounded-md border border-emerald-100/50">
                               +12%
                             </div>
                             <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover/drawer-item:text-blue-500 group-hover/drawer-item:translate-x-0.5 group-hover/drawer-item:-translate-y-0.5 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
