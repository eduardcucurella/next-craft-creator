import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, rolesApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const Users = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { groups, getGroupName, roles, getRoleName } = useAuth();

  const [searchParams, setSearchParams] = useState({
    login: '',
    nom: '',
    cognom: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<'name' | 'description' | 'roleId'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; login: string } | null>(null);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserLogin, setSelectedUserLogin] = useState<string>('');
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [userForm, setUserForm] = useState({
    login: '',
    nom: '',
    cognoms: '',
    email: '',
    primaryGroupId: 0,
    active: true,
    notes: '',
  });

  const searchMutation = useMutation({
    mutationFn: usersApi.search,
    onSuccess: (data) => {
      // L'API retorna directament un array d'usuaris
      setSearchResults(Array.isArray(data) ? data : []);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No s\'han pogut cercar els usuaris.',
        variant: 'destructive',
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: async (data) => {
      // Si hi ha notes, cridar l'endpoint de notes
      const userData = localStorage.getItem('user');
      if (userForm.notes && userData) {
        try {
          const user = JSON.parse(userData);
          await usersApi.saveNotes(data.id, userForm.notes, user.digition);
        } catch (error) {
          console.error('Error saving notes:', error);
          toast({
            title: 'Avís',
            description: 'Usuari creat però no s\'han pogut desar les notes.',
            variant: 'destructive',
          });
        }
      }
      
      toast({
        title: 'Usuari creat',
        description: 'L\'usuari s\'ha creat correctament.',
      });
      handleCloseDialog();
      handleSearch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No s\'ha pogut crear l\'usuari.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) => 
      usersApi.update(userId, data),
    onSuccess: () => {
      toast({
        title: 'Usuari actualitzat',
        description: 'L\'usuari s\'ha actualitzat correctament.',
      });
      handleCloseDialog();
      handleSearch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No s\'ha pogut actualitzar l\'usuari.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, digition }: { id: number; digition: string }) => 
      usersApi.delete(id, digition),
    onSuccess: () => {
      toast({
        title: 'Usuari eliminat',
        description: 'L\'usuari s\'ha eliminat correctament.',
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      handleSearch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No s\'ha pogut eliminar l\'usuari.',
        variant: 'destructive',
      });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId, digition }: { userId: number; roleId: number; digition: string }) =>
      usersApi.assignRole(userId, roleId, digition),
    onSuccess: () => {
      toast({
        title: 'Rol assignat',
        description: 'El rol s\'ha assignat correctament a l\'usuari.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No s\'ha pogut assignar el rol.',
        variant: 'destructive',
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId, digition }: { userId: number; roleId: number; digition: string }) =>
      usersApi.removeRole(userId, roleId, digition),
    onSuccess: () => {
      toast({
        title: 'Rol eliminat',
        description: 'El rol s\'ha eliminat correctament de l\'usuari.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No s\'ha pogut eliminar el rol.',
        variant: 'destructive',
      });
    },
  });

  const handleSearch = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast({
        title: 'Error',
        description: 'No s\'ha pogut obtenir el digition.',
        variant: 'destructive',
      });
      return;
    }
    
    const user = JSON.parse(userData);
    
    searchMutation.mutate({
      ...searchParams,
      page,
      pageSize,
      sortBy,
      sortOrder,
      digition: user.digition,
    });
  };

  // Executar cerca automàticament al carregar la pàgina
  useEffect(() => {
    handleSearch();
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      searchMutation.mutate({
        ...searchParams,
        page: newPage,
        pageSize,
        sortBy,
        sortOrder,
        digition: user.digition,
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setUserForm({
      login: '',
      nom: '',
      cognoms: '',
      email: '',
      primaryGroupId: 0,
      active: true,
      notes: '',
    });
  };

  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setUserForm({
      login: '',
      nom: '',
      cognoms: '',
      email: '',
      primaryGroupId: 0,
      active: true,
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = async (user: any) => {
    setIsEditMode(true);
    setEditingUserId(user.id);
    
    // Carregar les dades completes de l'usuari des del servidor
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No user data found');
      }
      const currentUser = JSON.parse(userData);
      const fullUserData = await usersApi.getById(user.id, currentUser.digition);
      setUserForm({
        login: fullUserData.login,
        nom: fullUserData.nom,
        cognoms: fullUserData.cognoms,
        email: fullUserData.email,
        primaryGroupId: fullUserData.primaryGroupId,
        active: fullUserData.active !== undefined ? fullUserData.active : true,
        notes: fullUserData.notes || '',
      });
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No s\'han pogut carregar les dades de l\'usuari.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveUser = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast({
        title: 'Error',
        description: 'No s\'ha pogut obtenir el digition.',
        variant: 'destructive',
      });
      return;
    }
    
    const user = JSON.parse(userData);
    
    if (isEditMode && editingUserId !== null) {
      updateMutation.mutate({
        userId: editingUserId,
        data: {
          ...userForm,
          digition: user.digition,
        },
      });
    } else {
      createMutation.mutate({
        ...userForm,
        digition: user.digition,
      });
    }
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete({ id: user.id, login: user.login });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast({
        title: 'Error',
        description: 'No s\'ha pogut obtenir el digition.',
        variant: 'destructive',
      });
      return;
    }
    
    const user = JSON.parse(userData);
    
    if (userToDelete) {
      deleteMutation.mutate({ id: userToDelete.id, digition: user.digition });
    }
  };

  const handleOpenRolesDialog = async (user: any) => {
    setSelectedUserId(user.id);
    setSelectedUserLogin(user.login);
    
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast({
        title: 'Error',
        description: 'No s\'ha pogut obtenir el digition.',
        variant: 'destructive',
      });
      return;
    }
    
    const currentUser = JSON.parse(userData);
    
    try {
      const userRolesData = await rolesApi.getUserRoles(user.id, currentUser.digition);
      setUserRoles(Array.isArray(userRolesData) ? userRolesData : []);
      setAvailableRoles(roles.filter(role => 
        !userRolesData.some((ur: any) => ur.id === role.id)
      ));
      setRolesDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No s\'han pogut carregar els rols de l\'usuari.',
        variant: 'destructive',
      });
    }
  };

  const handleAddRole = async (roleId: string) => {
    const userData = localStorage.getItem('user');
    if (!userData || selectedUserId === null) return;
    
    const user = JSON.parse(userData);
    
    try {
      await assignRoleMutation.mutateAsync({
        userId: selectedUserId,
        roleId: Number(roleId),
        digition: user.digition,
      });
      
      // Refrescar els rols de l'usuari des del servidor
      const userRolesData = await rolesApi.getUserRoles(selectedUserId, user.digition);
      setUserRoles(Array.isArray(userRolesData) ? userRolesData : []);
      setAvailableRoles(roles.filter(role => 
        !userRolesData.some((ur: any) => ur.id === role.id)
      ));
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    const userData = localStorage.getItem('user');
    if (!userData || selectedUserId === null) return;
    
    const user = JSON.parse(userData);
    
    try {
      await removeRoleMutation.mutateAsync({
        userId: selectedUserId,
        roleId: Number(roleId),
        digition: user.digition,
      });
      
      // Refrescar els rols de l'usuari des del servidor
      const userRolesData = await rolesApi.getUserRoles(selectedUserId, user.digition);
      setUserRoles(Array.isArray(userRolesData) ? userRolesData : []);
      setAvailableRoles(roles.filter(role => 
        !userRolesData.some((ur: any) => ur.id === role.id)
      ));
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  const handleCloseRolesDialog = () => {
    setRolesDialogOpen(false);
    setSelectedUserId(null);
    setSelectedUserLogin('');
    setUserRoles([]);
    setAvailableRoles([]);
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuaris</h1>
          <p className="text-muted-foreground mt-2">Gestionar els usuaris del sistema i els seus permisos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Afegir Usuari
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Editar Usuari' : 'Crear Nou Usuari'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-login">Login *</Label>
                  <Input
                    id="new-login"
                    value={userForm.login}
                    onChange={(e) => setUserForm({ ...userForm, login: e.target.value })}
                    placeholder="Introdueix el login..."
                    disabled={isEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="usuari@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-nom">Nom *</Label>
                  <Input
                    id="new-nom"
                    value={userForm.nom}
                    onChange={(e) => setUserForm({ ...userForm, nom: e.target.value })}
                    placeholder="Introdueix el nom..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-cognoms">Cognoms *</Label>
                  <Input
                    id="new-cognoms"
                    value={userForm.cognoms}
                    onChange={(e) => setUserForm({ ...userForm, cognoms: e.target.value })}
                    placeholder="Introdueix els cognoms..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-primaryGroupId">Grup Principal *</Label>
                  <Select
                    value={userForm.primaryGroupId.toString()}
                    onValueChange={(value) => setUserForm({ ...userForm, primaryGroupId: Number(value) })}
                  >
                    <SelectTrigger id="new-primaryGroupId">
                      <SelectValue placeholder="Selecciona un grup..." />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-active" className="flex items-center gap-2">
                    Actiu
                  </Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="new-active"
                      checked={userForm.active}
                      onCheckedChange={(checked) => setUserForm({ ...userForm, active: checked })}
                    />
                    <Label htmlFor="new-active" className="text-sm text-muted-foreground">
                      {userForm.active ? 'Sí' : 'No'}
                    </Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-notes">Notes</Label>
                <Textarea
                  id="new-notes"
                  value={userForm.notes}
                  onChange={(e) => setUserForm({ ...userForm, notes: e.target.value })}
                  placeholder="Introdueix notes opcionals..."
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel·lar
              </Button>
              <Button 
                onClick={handleSaveUser} 
                disabled={isEditMode ? updateMutation.isPending : createMutation.isPending}
              >
                {isEditMode 
                  ? (updateMutation.isPending ? 'Guardant...' : 'Guardar')
                  : (createMutation.isPending ? 'Creant...' : 'Crear')
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cercar Usuaris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <Input
                id="login"
                value={searchParams.login}
                onChange={(e) => setSearchParams({ ...searchParams, login: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cerca per login..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={searchParams.nom}
                onChange={(e) => setSearchParams({ ...searchParams, nom: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cerca per nom..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cognom">Cognom</Label>
              <Input
                id="cognom"
                value={searchParams.cognom}
                onChange={(e) => setSearchParams({ ...searchParams, cognom: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cerca per cognom..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="sortBy">Ordenar per</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="description">Descripció</SelectItem>
                  <SelectItem value="roleId">Rol</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Ordre</Label>
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger id="sortOrder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascendent</SelectItem>
                  <SelectItem value="desc">Descendent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageSize">Elements per pàgina</Label>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger id="pageSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSearch} disabled={searchMutation.isPending}>
            <Search className="mr-2 h-4 w-4" />
            {searchMutation.isPending ? 'Cercant...' : 'Cercar'}
          </Button>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultats de la Cerca ({searchResults.length} usuaris)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Login</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Cognoms</TableHead>
                  <TableHead>Correu electrònic</TableHead>
                  <TableHead>Grup Principal</TableHead>
                  <TableHead className="text-right">Accions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.login}</TableCell>
                    <TableCell>{user.nom}</TableCell>
                    <TableCell>{user.cognoms}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getGroupName(user.primaryGroupId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEditDialog(user)}
                          title="Editar usuari"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenRolesDialog(user)}
                          title="Gestionar rols globals"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(user)}
                          title="Eliminar usuari"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrant {searchResults.length} resultats - Pàgina {page}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => page > 1 && handlePageChange(page - 1)}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive>{page}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => searchResults.length === pageSize && handlePageChange(page + 1)}
                      className={searchResults.length < pageSize ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminació</AlertDialogTitle>
            <AlertDialogDescription>
              Estàs segur que vols eliminar l'usuari <strong>{userToDelete?.login}</strong>? 
              Aquesta acció no es pot desfer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel·lar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Eliminant...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={rolesDialogOpen} onOpenChange={setRolesDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Rols Globals - {selectedUserLogin}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Rols Disponibles</h3>
                <div className="mb-3">
                  <Input
                    placeholder="Cercar rols..."
                    value={roleSearchTerm}
                    onChange={(e) => setRoleSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 border rounded-lg p-3 max-h-[400px] overflow-y-auto">
                  {availableRoles.filter(role => 
                    role.nom.toLowerCase().includes(roleSearchTerm.toLowerCase())
                  ).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {roleSearchTerm ? 'No s\'han trobat rols amb aquest criteri' : 'No hi ha rols disponibles per afegir'}
                    </p>
                  ) : (
                    availableRoles
                      .filter(role => role.nom.toLowerCase().includes(roleSearchTerm.toLowerCase()))
                      .map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                        >
                          <span className="text-sm">{role.nom}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddRole(role.id)}
                            disabled={assignRoleMutation.isPending}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Rols Assignats</h3>
                <div className="space-y-2 border rounded-lg p-3 max-h-[400px] overflow-y-auto">
                  {userRoles.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aquest usuari no té rols assignats
                    </p>
                  ) : (
                    userRoles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                      >
                        <Badge variant="secondary">{role.nom}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveRole(role.id)}
                          disabled={removeRoleMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCloseRolesDialog}>
              Tancar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
