import { useState } from 'react';
import { Header } from '@/layouts/Header';
import { Card, CardContent } from '@/components/ui/card';
import { mockRequests } from '@/data/mockData';
import { ClipboardList, Clock, CheckCircle2, XCircle, Search, Filter, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

export function MyRequests() {
  const myRequests = mockRequests.filter(r => r.userId === '2');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    pending: { label: 'En attente', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
    approved: { label: 'Approuvé', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle2 },
    delivered: { label: 'Livré', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
    returned: { label: 'Retourné', className: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-[#252525] dark:text-[#A0A0A0] dark:border-[#2A2A2A]', icon: CheckCircle2 },
    rejected: { label: 'Refusé', className: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
    borrowed: { label: 'Emprunté', className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: Clock },
  };

  const filteredRequests = myRequests.filter(req => {
    const matchesSearch = req.materialName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = myRequests.filter(r => r.status === 'pending').length;
  const deliveredCount = myRequests.filter(r => r.status === 'delivered').length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <Header 
        title="Mes demandes" 
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9 bg-muted border-border">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Statut" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="returned">Retourné</SelectItem>
                <SelectItem value="rejected">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{pendingCount}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">En attente</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{deliveredCount}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Livrés</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{myRequests.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <Card className="border border-border/50 bg-card shadow-sm rounded-[24px] overflow-hidden">
          <CardContent className="p-0">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-muted-foreground font-semibold">Aucune demande trouvée</p>
                <p className="text-xs text-muted-foreground mt-1">Parcourez le catalogue pour faire une demande</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map(req => {
                    const status = statusConfig[req.status] || statusConfig.pending;
                    return (
                      <TableRow key={req.id} className="group hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted border border-border/50 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                              <ClipboardList className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <p className="font-semibold text-sm text-foreground truncate">{req.materialName}</p>
                              {req.notes && (
                                <p className="text-[11px] text-muted-foreground truncate max-w-xs italic">"{req.notes}"</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{req.requestDate}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-foreground">{req.quantity}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.type === 'consumable' ? 'secondary' : 'outline'}>
                            {req.type === 'consumable' ? 'Consommable' : 'Retournable'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${status.className}`}>
                            {status.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
