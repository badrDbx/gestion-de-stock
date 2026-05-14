import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Header } from '@/layouts/Header';
import api from '@/lib/api';
import type { Material, MaterialType, MaterialCategory } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Minus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Filter,
  Save,
  X,
  ShieldAlert,
  Tag,
  Hash,
  Layers,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export function Materials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaterialType | 'all'>('all');

  // Edit/Add dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/materials');
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const MaterialsSkeleton = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="h-10 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 rounded-[24px] bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    </div>
  );

  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    description: '',
    type: 'consumable',
    category: 'Informatique',
    quantity: 1,
    minQuantity: 5,
    unit: 'Pièce',
    image: '',
  });

  const filteredMaterials = materials.filter(material => {
    const name = material.name || '';
    const description = material.description || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || material.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await api.put(`/materials/${editingMaterial.id}`, formData);
        toast.success('Article modifié avec succès');
      } else {
        await api.post('/materials', formData);
        toast.success('Article ajouté avec succès');
      }
      fetchMaterials();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Erreur lors de la sauvegarde. Vérifiez que MySQL est démarré.');
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData(material);
    setIsDialogOpen(true);
  };

  const confirmDelete = (material: Material) => {
    setDeletingMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingMaterial) return;
    setIsDeleting(true);
    try {
      await api.delete(`/materials/${deletingMaterial.id}`);
      toast.success(`"${deletingMaterial.name}" a été supprimé.`);
      fetchMaterials();
      setIsDeleteDialogOpen(false);
      setDeletingMaterial(null);
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Erreur lors de la suppression.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      description: '',
      type: 'consumable',
      category: 'Informatique',
      quantity: 1,
      minQuantity: 5,
      unit: 'Pièce',
      image: '',
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <Header 
        title="Gestion du Matériel" 
        actions={
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted border-border focus:bg-card transition-colors"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as MaterialType | 'all')}>
              <SelectTrigger className="w-auto min-w-[144px] h-9 bg-muted border-border px-3 overflow-hidden">
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
          </div>
        }
        primaryAction={
          <Button onClick={openAddDialog} className="h-9 gap-2 shadow-sm font-semibold">
            <Plus className="w-4 h-4" />
            Ajouter un article
          </Button>
        }
      />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 p-6 space-y-6 overflow-auto"
      >
        {loading ? <MaterialsSkeleton /> : (
          <Card className="border border-border/50 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-14 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map(material => (
                  <TableRow key={material.id} className="group">
                    <TableCell>
                      <div className="flex flex-col min-w-0">
                        <p className="font-medium truncate">{material.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{material.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        {material.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        material.type === 'consumable' 
                          ? 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400' 
                          : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'
                      }`}>
                        {material.type === 'consumable' ? 'Consommable' : 'Retournable'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{material.quantity}</span>
                    </TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell>
                      {material.quantity === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                          <ShieldAlert className="w-3 h-3" />
                          Critique
                        </span>
                      ) : material.quantity <= material.minQuantity ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Bas
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          En Stock
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-muted">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => handleEdit(material)} className="gap-2 cursor-pointer">
                            <Edit className="w-4 h-4 text-indigo-500" />
                            <span>Modifier</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => confirmDelete(material)}
                            className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Supprimer</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        )}
      </motion.div>

      {/* ─── ADD / EDIT DIALOG ─── */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-xl p-0 overflow-hidden gap-0 bg-white dark:bg-[#121212] border-border/50 shadow-2xl">
          {/* Colored header band */}
          <div className={`px-6 py-5 ${editingMaterial ? 'bg-indigo-600' : 'bg-gradient-to-r from-indigo-600 to-violet-600'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                {editingMaterial ? <Edit className="w-5 h-5 text-white" /> : <Package className="w-5 h-5 text-white" />}
              </div>
              <div>
                <DialogTitle className="text-white text-lg font-black">
                  {editingMaterial ? 'Modifier l\'article' : 'Ajouter un article'}
                </DialogTitle>
                <DialogDescription className="text-white/70 text-xs mt-0.5">
                  {editingMaterial ? `Modification de "${editingMaterial.name}"` : 'Remplissez les informations du nouvel article'}
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-5">

              {/* Row: Name + Type */}
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3 space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Nom de l'article
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Souris USB, Papier A4…"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-10"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v as MaterialType })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumable">Consommable</SelectItem>
                      <SelectItem value="returnable">Retournable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Catégorie
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as MaterialCategory })}
                >
                  <SelectTrigger id="category" className="h-10">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Informatique">💻 Informatique</SelectItem>
                    <SelectItem value="Impression">🖨️ Impression</SelectItem>
                    <SelectItem value="Bureautique">📋 Bureautique</SelectItem>
                    <SelectItem value="Réseau & Câblage">🔌 Réseau & Câblage</SelectItem>
                    <SelectItem value="Audiovisuel">📽️ Audiovisuel</SelectItem>
                    <SelectItem value="Téléphonie">📞 Téléphonie</SelectItem>
                    <SelectItem value="Stockage & Sauvegarde">💾 Stockage & Sauvegarde</SelectItem>
                    <SelectItem value="Protection & Sécurité">🔒 Protection & Sécurité</SelectItem>
                    <SelectItem value="Énergie & Alimentation">⚡ Énergie & Alimentation</SelectItem>
                    <SelectItem value="Mobilier">🪑 Mobilier</SelectItem>
                    <SelectItem value="Hygiène & Santé">🦺 Hygiène & Santé</SelectItem>
                    <SelectItem value="Consommables Divers">📦 Consommables Divers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Description
                </Label>
                <Input
                  id="description"
                  placeholder="Brève description de l'article…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-10"
                />
              </div>

              {/* Row: Quantity + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> Quantité
                  </Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-xl border border-border/50 shadow-inner">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, quantity: Math.max(0, (Number(formData.quantity) || 0) - 1) })}
                        className="w-9 h-9 rounded-lg bg-white dark:bg-[#2a2a2a] shadow-sm text-slate-400 hover:text-red-500 hover:shadow-md flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 active:scale-95"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        id="quantity"
                        type="number"
                        value={formData.quantity === undefined ? '' : formData.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, quantity: val === '' ? '' as any : Math.max(0, parseInt(val)) });
                        }}
                        className="w-full bg-transparent text-center text-xl font-black text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, quantity: (Number(formData.quantity) || 0) + 1 })}
                        className="w-9 h-9 rounded-lg bg-white dark:bg-[#2a2a2a] shadow-sm text-slate-400 hover:text-emerald-500 hover:shadow-md flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Unité
                  </Label>
                  <Input
                    id="unit"
                    placeholder="Pièce, Rame, Boîte…"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="h-10"
                    required
                  />
                </div>
              </div>

              {/* Alert Threshold */}
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-center justify-between gap-4 transition-all focus-within:ring-2 focus-within:ring-amber-500/40 focus-within:border-amber-400">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-amber-900 dark:text-amber-500 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                    Seuil d'alerte (Stock Bas)
                  </Label>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                    Quantité minimale à partir de laquelle le stock est considéré comme "Bas".
                  </p>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-[#1a1a1a] p-1 rounded-xl border border-amber-200 dark:border-amber-500/30 shadow-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, minQuantity: Math.max(0, (Number(formData.minQuantity) || 0) - 1) })}
                    className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    id="minQuantity"
                    type="number"
                    value={formData.minQuantity === undefined ? '' : formData.minQuantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, minQuantity: val === '' ? '' as any : Math.max(0, parseInt(val)) });
                    }}
                    className="w-12 bg-transparent text-center text-base font-black text-amber-950 dark:text-amber-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, minQuantity: (Number(formData.minQuantity) || 0) + 1 })}
                    className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="gap-2">
                <X className="w-4 h-4" />
                Annuler
              </Button>
              <Button type="submit" className="gap-2 min-w-[130px]">
                <Save className="w-4 h-4" />
                {editingMaterial ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE CONFIRMATION DIALOG ─── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!isDeleting) { setIsDeleteDialogOpen(open); if (!open) setDeletingMaterial(null); } }}>
        <DialogContent className="max-w-sm p-0 overflow-hidden gap-0 bg-white dark:bg-[#121212] shadow-2xl border-border/50">
          <div className="bg-red-500/10 px-6 py-5 flex items-center gap-4 border-b border-red-500/20">
            <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground">Confirmer la suppression</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Cette action est irréversible.
              </DialogDescription>
            </div>
          </div>
          <div className="px-6 py-5 space-y-3">
            <p className="text-sm text-foreground">
              Vous allez supprimer l'article :
            </p>
            <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 flex items-center gap-3">
              <Package className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-sm text-foreground">{deletingMaterial?.name}</p>
                <p className="text-xs text-muted-foreground">{deletingMaterial?.category} · {deletingMaterial?.quantity} {deletingMaterial?.unit}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes les données associées à cet article seront définitivement perdues.
            </p>
          </div>
          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border gap-2">
            <Button
              variant="outline"
              onClick={() => { setIsDeleteDialogOpen(false); setDeletingMaterial(null); }}
              disabled={isDeleting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Suppression…' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
