import { Header } from '@/layouts/Header';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { Package, Search, AlertTriangle, ArrowUpRight, Filter, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Material, MaterialType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

export function Catalog() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaterialType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      const data = Array.isArray(response.data) ? response.data : [];
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!selectedMaterial || !user) return;
    
    if (requestQuantity > selectedMaterial.quantity) {
      toast.error('Quantité insuffisante', {
        description: 'La quantité demandée dépasse le stock disponible.'
      });
      return;
    }

    setIsRequesting(true);
    try {
      const requestData = {
        userId: user.id,
        userName: user.name,
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        quantity: requestQuantity,
        status: 'pending',
        type: selectedMaterial.type,
        requestDate: new Date().toISOString().split('T')[0],
      };

      await api.post('/material-requests', requestData);
      
      toast.success('Demande envoyée !', {
        description: `Votre demande pour ${requestQuantity} ${selectedMaterial.name} est en attente d'approbation.`,
      });
      
      setIsDialogOpen(false);
      setSelectedMaterial(null);
      setRequestQuantity(1);
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Erreur lors de la demande', {
        description: 'Vérifiez que MySQL est démarré.'
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const categories = ['all', ...new Set(materials.map(m => m.category).filter(Boolean))];

  const filtered = materials.filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
                         (m.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalCount = materials.length;
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
              <SelectTrigger className="w-auto min-w-[130px] h-9 bg-muted border-border px-3 overflow-hidden">
                <div className="flex items-center gap-2 truncate">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Type" className="truncate" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="consumable">Consommables</SelectItem>
                <SelectItem value="returnable">Retournables</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-auto min-w-[160px] max-w-[200px] h-9 bg-muted border-border px-3 overflow-hidden">
                <div className="flex items-center gap-2 truncate">
                  <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Catégorie" className="truncate" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'Toutes catégories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        primaryAction={
          isAdmin ? (
            <Button onClick={() => navigate('/admin/materials')} className="h-9 gap-2 shadow-sm font-semibold">
              <Settings className="w-4 h-4" />
              Gérer le stock
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(item => (
            <Card key={item.id} className="relative overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-700 premium-shadow-hover rounded-[28px] group">
              <CardContent className="p-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:rotate-3 ${
                    item.type === 'consumable'
                      ? 'bg-sky-50 border border-sky-100 text-sky-600 dark:bg-sky-900/20 dark:border-sky-900/30 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white group-hover:shadow-sky-200'
                      : 'bg-red-50 border border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-red-200'
                  }`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider ${
                      item.type === 'consumable'
                        ? 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-900/30'
                        : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
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
                    {item.quantity <= item.minQuantity && item.quantity > 0 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
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
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">Rupture</span>
                    ) : item.quantity <= item.minQuantity ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30">Bas</span>
                    ) : (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30">Dispo</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <Button 
                    onClick={() => {
                      setSelectedMaterial(item);
                      setRequestQuantity(1);
                      setIsDialogOpen(true);
                    }}
                    disabled={item.quantity === 0}
                    className="w-full h-9 rounded-xl font-bold transition-all group-hover:shadow-lg group-hover:shadow-blue-200 gap-2"
                    variant={item.quantity === 0 ? "outline" : "default"}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {item.quantity === 0 ? 'Rupture de stock' : 'Demander cet article'}
                  </Button>
                </div>
              </CardContent>

              {/* Decorative background glow */}
              <div className={`absolute -right-8 -bottom-8 w-32 h-32 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none ${
                item.type === 'consumable' ? 'bg-sky-500' : 'bg-red-600'
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

      {/* Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-background/95 backdrop-blur-xl shadow-2xl rounded-[28px]">
          <div className="bg-primary p-6 text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <DialogHeader>
                <DialogTitle className="text-xl font-black tracking-tight">Nouvelle Demande</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 font-medium">
                  Remplissez les détails pour votre demande de matériel.
                </DialogDescription>
              </DialogHeader>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{selectedMaterial?.name}</p>
                <p className="text-[11px] text-muted-foreground uppercase font-black tracking-wider">
                  {selectedMaterial?.category} · En stock: {selectedMaterial?.quantity}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="quantity" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Quantité souhaitée ({selectedMaterial?.unit})
              </Label>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-2xl border border-border/50">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-xl hover:bg-background hover:shadow-sm hover:text-primary transition-all active:scale-95"
                  onClick={() => setRequestQuantity(Math.max(1, requestQuantity - 1))}
                >
                  <span className="text-xl font-bold">−</span>
                </Button>
                
                <div className="flex-1 flex flex-col items-center">
                  <input
                    type="number"
                    value={requestQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setRequestQuantity(Math.min(selectedMaterial?.quantity || 1, Math.max(1, val)));
                      }
                    }}
                    className="w-full bg-transparent border-none text-center text-2xl font-black focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest -mt-1">
                    {selectedMaterial?.unit}
                  </span>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-xl hover:bg-background hover:shadow-sm hover:text-primary transition-all active:scale-95"
                  onClick={() => setRequestQuantity(Math.min(selectedMaterial?.quantity || 1, requestQuantity + 1))}
                >
                  <span className="text-xl font-bold">+</span>
                </Button>
              </div>
              {selectedMaterial && requestQuantity > selectedMaterial.quantity && (
                <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  La quantité dépasse le stock disponible
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <Button 
              className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2"
              onClick={handleRequest}
              disabled={isRequesting || !selectedMaterial || requestQuantity > selectedMaterial.quantity}
            >
              {isRequesting ? (
                <>Envoi en cours...</>
              ) : (
                <>
                  Confirmer la demande
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
