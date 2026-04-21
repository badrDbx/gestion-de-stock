import { Header } from '@/layouts/Header';
import { Card, CardContent } from '@/components/ui/card';
import { mockMaterials } from '@/data/mockData';
import { Package, Search, AlertTriangle, ArrowUpRight, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MaterialType } from '@/types';

export function Catalog() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaterialType | 'all'>('all');

  const filtered = mockMaterials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                         m.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalCount = mockMaterials.length;
  const filteredCount = filtered.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <Header 
        title="Catalogue matériel" 
        actions={
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un article..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-muted border-border focus:bg-card transition-colors"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as MaterialType | 'all')}>
              <SelectTrigger className="w-36 h-9 bg-muted border-border">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="consumable">Consommable</SelectItem>
                <SelectItem value="returnable">Retournable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(item => (
            <Card key={item.id} className="relative overflow-hidden border border-border/50 bg-card shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] transition-all duration-500 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:border-blue-400/30 hover:-translate-y-1.5 rounded-[24px] group">
              <CardContent className="p-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:rotate-3 ${
                    item.type === 'consumable'
                      ? 'bg-muted border border-border text-muted-foreground group-hover:bg-slate-700 group-hover:text-white group-hover:shadow-slate-200'
                      : 'bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-blue-200'
                  }`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider ${
                      item.type === 'consumable'
                        ? 'bg-muted text-muted-foreground border-border'
                        : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {item.type === 'consumable' ? 'Consommable' : 'Retournable'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <p className="font-bold text-sm text-foreground group-hover:text-blue-600 transition-colors duration-300 truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/80">
                  <div className="flex items-center gap-1.5">
                    {item.quantity <= item.minQuantity && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                    <span className={`text-sm font-black ${
                      item.quantity === 0 ? 'text-red-600' :
                      item.quantity <= item.minQuantity ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {item.quantity}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">{item.unit}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.quantity === 0 ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">Critique</span>
                    ) : item.quantity <= item.minQuantity ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">Bas</span>
                    ) : (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">OK</span>
                    )}
                  </div>
                </div>
              </CardContent>

              {/* Decorative background glow */}
              <div className={`absolute -right-8 -bottom-8 w-32 h-32 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none ${
                item.type === 'consumable' ? 'bg-slate-600' : 'bg-blue-600'
              }`} />
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-muted-foreground font-semibold">Aucun article trouvé</p>
            <p className="text-xs text-muted-foreground mt-1">Essayez de modifier votre recherche ou vos filtres</p>
          </div>
        )}
      </div>
    </div>
  );
}
