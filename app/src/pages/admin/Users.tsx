import { useState, useEffect } from 'react';
import { Header } from '@/layouts/Header';
import api from '@/lib/api';
import type { User, UserRole } from '@/types';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserCircle,
  Mail,
  Phone,
  Building2,
  ShieldAlert,
  ShieldCheck,
  Users as UsersIcon,
  X,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    department: string;
    phone: string;
    password: string;
  }>({
    name: '',
    email: '',
    role: 'user',
    department: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      // Some Laravel responses wrap the array in a `data` key
      const responseData = response.data?.data || response.data;
      const data = Array.isArray(responseData) ? responseData : [];
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const TableSkeleton = () => (
    <div className="space-y-4">
      <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="border border-border/50 rounded-2xl overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 w-full bg-slate-50 dark:bg-slate-900 border-b border-border/50 animate-pulse" />
        ))}
      </div>
    </div>
  );

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSubmit = { ...formData };
      
      // If we are editing and haven't toggled 'Change Password', don't send the password
      if (editingUser && !isChangingPassword) {
        delete (dataToSubmit as any).password;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, dataToSubmit);
        toast.success(`L'utilisateur "${formData.name}" a été modifié.`);
      } else {
        if (!formData.password || formData.password.length < 8) {
          toast.error('Le mot de passe doit contenir au moins 8 caractères.');
          setIsSaving(false);
          return;
        }
        await api.post('/users', formData);
        toast.success(`L'utilisateur "${formData.name}" a été créé avec succès.`);
      }
      fetchUsers();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0] as string[];
        toast.error(firstError[0]);
      } else {
        const msg = error?.response?.data?.message || 'Erreur lors de la sauvegarde';
        toast.error(msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: (user.role as UserRole) || 'user',
      department: user.department || '',
      phone: user.phone || '',
      password: '',
    });
    setShowPassword(false);
    setIsChangingPassword(false);
    setIsDialogOpen(true);
  };

  const confirmDelete = (user: User) => {
    if (String(user.id) === '1') {
      toast.error('Le super administrateur ne peut pas être supprimé.');
      return;
    }
    if (String(currentUser?.id) === String(user.id)) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${userToDelete.id}`);
      toast.success(`L'utilisateur "${userToDelete.name}" a été supprimé.`);
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setShowPassword(false);
    setIsChangingPassword(false);
    setFormData({ name: '', email: '', role: 'user', department: '', phone: '', password: '' });
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <Header
        title="Gestion des Utilisateurs"
        actions={
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted border-border focus:bg-card transition-all"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="user">Utilisateurs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        primaryAction={
          <Button onClick={openAddDialog} className="h-9 gap-2 shadow-sm font-semibold">
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">


        {/* User Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <UsersIcon className="w-16 h-16 mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold">Aucun utilisateur trouvé</p>
            <p className="text-sm text-muted-foreground mt-1">Ajustez vos filtres ou ajoutez un nouvel utilisateur.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredUsers.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm ${
                      user.role === 'admin'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                    }`}>
                      {getInitials(user.name || '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{user.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground truncate mt-0.5">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                    <div className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      String(user.id) === '1'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'
                    }`}>
                      {String(user.id) === '1' ? 'Admin' : 'Utilisateur'}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    {user.department && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{user.department}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="flex-1 h-8 gap-1.5 text-xs rounded-xl hover:bg-blue-500/10 hover:text-blue-600"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Modifier
                    </Button>
                    {String(user.id) !== '1' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(user)}
                        className="flex-1 h-8 gap-1.5 text-xs rounded-xl hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingUser ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </DialogTitle>
            <DialogDescription>
              Remplissez tous les champs pour créer ou modifier un compte.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-5 py-4">
              {/* Header Info for New User */}
              {!editingUser && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm font-medium">
                    <UserCircle className="w-4 h-4" />
                    Nouveau compte utilisateur
                  </div>
                  <Badge variant="secondary" className="bg-white dark:bg-white/5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
                    Rôle: Utilisateur
                  </Badge>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold">Nom complet *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Mohamed Alami"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              {/* Email + Role (Role only visible when editing ID 1) */}
              <div className={`grid ${editingUser ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 rounded-xl"
                    autoComplete="off"
                    required
                  />
                </div>
                {editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-bold">Rôle</Label>
                    <div className="flex items-center h-11 px-3 rounded-xl bg-muted/50 border border-border text-sm font-medium text-foreground gap-2">
                      {String(editingUser.id) === '1' ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-600">Admin</span>
                        </>
                      ) : (
                        <>
                          <UserCircle className="w-4 h-4 text-slate-500" />
                          <span>Utilisateur</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Department + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-bold">Service</Label>
                  <Input
                    id="department"
                    placeholder="Ex: Pédiatrie"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-bold">Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="0612345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Password Section */}
              {editingUser ? (
                <div className="space-y-3">
                  {!isChangingPassword ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-11 rounded-xl border-dashed border-blue-200 hover:border-blue-500 hover:bg-blue-50 dark:border-blue-900/50 dark:hover:bg-blue-950/20 gap-2 text-blue-600 dark:text-blue-400 font-bold"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      <KeyRound className="w-4 h-4" />
                      Changer le mot de passe
                    </Button>
                  ) : (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-bold flex items-center gap-2">
                          <KeyRound className="w-3.5 h-3.5" />
                          Nouveau mot de passe *
                        </Label>
                        <button 
                          type="button" 
                          onClick={() => { setIsChangingPassword(false); setFormData({...formData, password: ''}); }}
                          className="text-[10px] text-muted-foreground hover:text-red-500 transition-colors uppercase font-bold tracking-wider"
                        >
                          Annuler
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Entrez le nouveau mot de passe"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className="h-11 rounded-xl pr-10"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5" />
                    Mot de passe *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 caractères"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="h-11 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic px-1">
                    Veuillez saisir un mot de passe de sécurité pour cet utilisateur.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving ? 'Sauvegarde...' : editingUser ? 'Enregistrer' : 'Créer le compte'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-red-500/20 shadow-2xl rounded-2xl bg-card">
          <div className="bg-red-50 dark:bg-red-950/20 p-6 pb-4 border-b border-red-100 dark:border-red-900/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-bold">
                <ShieldAlert className="w-5 h-5" />
                <h2>Supprimer l'utilisateur</h2>
              </div>
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="text-red-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-red-800/70 dark:text-red-400/80 leading-relaxed">
              Cette action est irréversible. Toutes les données associées seront perdues.
            </p>
          </div>

          <div className="p-6">
            {userToDelete && (
              <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${
                  userToDelete.role === 'admin'
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                }`}>
                  {getInitials(userToDelete.name || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground truncate">{userToDelete.name}</h4>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    {userToDelete.email}
                  </p>
                </div>
                <Badge variant={userToDelete.role === 'admin' ? 'default' : 'secondary'} className="rounded-lg px-2.5">
                  {userToDelete.role === 'admin' ? 'Admin' : 'User'}
                </Badge>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="flex-1 rounded-xl"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 gap-2 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Suppression…' : 'Supprimer'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
