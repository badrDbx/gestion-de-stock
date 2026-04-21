import { useState } from 'react';
import { Header } from '@/layouts/Header';
import { mockMaterials } from '@/data/mockData';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Materials() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaterialType | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // نموذج المادة
  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    description: '',
    type: 'consumable',
    category: 'Informatique',
    quantity: 0,
    minQuantity: 0,
    unit: 'Pièce',
    image: '',
  });

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || material.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      // تحديث مادة موجودة
      setMaterials(materials.map(m =>
        m.id === editingMaterial.id
          ? { ...m, ...formData, updatedAt: new Date().toISOString() } as Material
          : m
      ));
    } else {
      // إضافة مادة جديدة
      const newMaterial: Material = {
        ...formData as Material,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMaterials([...materials, newMaterial]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData(material);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      description: '',
      type: 'consumable',
      category: 'Informatique',
      quantity: 0,
      minQuantity: 0,
      unit: 'Pièce',
      image: '',
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
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
        primaryAction={
          isAdmin && (
            <Button onClick={openAddDialog} className="h-9 gap-2 shadow-sm font-semibold">
              <Plus className="w-4 h-4" />
              Ajouter un article
            </Button>
          )
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Materials Table */}
        <Card>
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
                  {isAdmin && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map(material => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div className="flex flex-col min-w-0">
                        <p className="font-medium truncate">{material.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{material.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const categoryColors: Record<string, string> = {
                          'Informatique':           'bg-blue-500/10 text-blue-400 border-blue-500/20',
                          'Impression':             'bg-purple-500/10 text-purple-400 border-purple-500/20',
                          'Bureautique':            'bg-orange-500/10 text-orange-400 border-orange-500/20',
                          'Réseau & Câblage':      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                          'Audiovisuel':            'bg-pink-500/10 text-pink-400 border-pink-500/20',
                          'Téléphonie':             'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                          'Stockage & Sauvegarde':  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                          'Protection & Sécurité': 'bg-red-500/10 text-red-500 border-red-500/20',
                          'Énergie & Alimentation': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                          'Mobilier':               'bg-slate-100 text-slate-500 border-slate-200 dark:bg-[#252525] dark:text-[#A0A0A0] dark:border-[#2A2A2A]',
                          'Hygiène & Santé':        'bg-teal-500/10 text-teal-400 border-teal-500/20',
                          'Consommables Divers':    'bg-slate-100 text-slate-500 border-slate-200 dark:bg-[#252525] dark:text-[#A0A0A0] dark:border-[#2A2A2A]',
                        };
                        const cls = categoryColors[material.category] || 'bg-muted text-foreground border-border';
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
                            {material.category}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={material.type === 'consumable' ? 'secondary' : 'outline'}>
                        {material.type === 'consumable' ? 'Consommable' : 'Retournable'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{material.quantity}</span>
                    </TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell>
                      {material.quantity === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                          Critique
                        </span>
                      ) : material.quantity <= material.minQuantity ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Bas
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          OK
                        </span>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(material)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(material.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? 'Modifier l\'article' : 'Ajouter un nouvel article'}
            </DialogTitle>
            <DialogDescription>
              Entrez les informations de l'article ci-dessous
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'article</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v as MaterialType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumable">Consommable</SelectItem>
                      <SelectItem value="returnable">Retournable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as MaterialCategory })}
                >
                  <SelectTrigger id="category">
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
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité Initiale</Label>
                  <div className="flex items-center w-full bg-card border border-border shadow-sm rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-slate-300 focus-within:border-slate-300 transition-all">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, quantity: Math.max(0, (formData.quantity || 0) - 1) })}
                      className="px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-r border-border outline-none"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      value={formData.quantity === undefined ? 0 : formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="flex-1 w-full text-center font-bold text-foreground text-sm py-2 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, quantity: (formData.quantity || 0) + 1 })}
                      className="px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-l border-border outline-none"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unité (ex: Pièce, Rame)</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Advanced Setting: Alert Threshold */}
              <div className="pt-4 mt-2 border-t border-border flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-foreground font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Seuil d'alerte critique
                  </Label>
                  <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                    Définit la quantité minimale pour déclencher un statut 'Bas' ou 'Critique'.
                  </p>
                </div>
                
                <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden shrink-0 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, minQuantity: Math.max(0, (formData.minQuantity || 0) - 1) })}
                    className="px-3 py-2 text-muted-foreground hover:bg-muted border-r border-border transition-colors outline-none"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="w-12 text-center font-bold text-foreground text-sm">
                    {formData.minQuantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, minQuantity: (formData.minQuantity || 0) + 1 })}
                    className="px-3 py-2 text-muted-foreground hover:bg-muted border-l border-border transition-colors outline-none"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingMaterial ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
