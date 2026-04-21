import { Header } from '@/layouts/Header';
import { Card, CardContent } from '@/components/ui/card';
import { mockBorrowedItems } from '@/data/mockData';
import { RotateCcw, Calendar, AlertCircle, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function MyBorrowed() {
  const myItems = mockBorrowedItems.filter(b => b.userId === '2');
  const activeBorrowed = myItems.filter(b => b.status === 'borrowed');
  const returnedItems = myItems.filter(b => b.status === 'returned');

  // Check for overdue items
  const overdueItems = activeBorrowed.filter(
    b => new Date(b.expectedReturnDate) < new Date()
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <Header 
        title="Mes emprunts" 
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{activeBorrowed.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Actifs</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              overdueItems.length > 0 
                ? 'bg-red-50 border border-red-100' 
                : 'bg-emerald-50 border border-emerald-100'
            }`}>
              <AlertCircle className={`w-5 h-5 ${overdueItems.length > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{overdueItems.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">En retard</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{returnedItems.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Retournés</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <Card className="border border-border/50 bg-card shadow-sm rounded-[24px] overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-500 text-white flex items-center justify-center shadow-sm shadow-violet-200">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h3 className="text-[13px] font-bold text-foreground">Détail des emprunts</h3>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{myItems.length} total</span>
          </div>
          <CardContent className="p-0">
            {myItems.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-muted-foreground font-semibold">Aucun emprunt</p>
                <p className="text-xs text-muted-foreground mt-1">Vous n'avez aucun équipement emprunté</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matériel</TableHead>
                    <TableHead>Date d'emprunt</TableHead>
                    <TableHead>Date de retour</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myItems.map(item => {
                    const isOverdue = item.status === 'borrowed' && new Date(item.expectedReturnDate) < new Date();
                    return (
                      <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              item.status === 'borrowed' 
                                ? 'bg-violet-50 border border-violet-100 group-hover:bg-violet-100' 
                                : 'bg-muted border border-border/50'
                            }`}>
                              <RotateCcw className={`w-4 h-4 ${
                                item.status === 'borrowed' ? 'text-violet-500' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <span className="font-semibold text-sm text-foreground">{item.materialName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{item.borrowDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {isOverdue ? (
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            <span className={`text-sm font-medium ${
                              isOverdue ? 'text-red-600' : 'text-muted-foreground'
                            }`}>{item.expectedReturnDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.status === 'borrowed' ? (
                            isOverdue ? (
                              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-red-50 text-red-700 border-red-200">
                                En retard
                              </span>
                            ) : (
                              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
                                À retourner
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                              Retourné
                            </span>
                          )}
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
