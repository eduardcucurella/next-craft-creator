import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

const Roles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useState({
    rolId: '',
    nom: '',
  });
  const [pagina, setPage] = useState(1);
  const [midaPagina, setPageSize] = useState(10);
  const [campOrdenacio, setSortBy] = useState<string>('nom');
  const [ordreOrdenacio, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; nom: string } | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    descripcio: '',
  });

  const searchMutation = useMutation({
    mutationFn: rolesApi.search,
    onSuccess: (data) => {
      setSearchResults(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No s\'han pogut cercar els rols.',
        variant: 'destructive',
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rols'] });
      toast({
        title: 'Rol creat',
        description: 'El rol s\'ha creat correctament.',
      });
      setIsDialogOpen(false);
      resetForm();
      handleSearch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No s\'ha pogut crear el rol.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { descripcio: string; digition: string } }) =>
      rolesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rols'] });
      toast({
        title: 'Rol actualitzat',
        description: 'El rol s\'ha actualitzat correctament.',
      });
      setIsDialogOpen(false);
      resetForm();
      handleSearch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No s\'ha pogut actualitzar el rol.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, digition }: { id: string; digition: string }) =>
      rolesApi.delete(id, digition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rols'] });
      toast({
        title: 'Rol eliminat',
        description: 'El rol s\'ha eliminat correctament.',
      });
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      handleSearch();
    },
    onError: (error: any) => {
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
      rolId: searchParams.rolId ? Number(searchParams.rolId) : undefined,
      nom: searchParams.nom,
      pagina,
      midaPagina,
      campOrdenacio,
      ordreOrdenacio,
      digition: user.digition,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      searchMutation.mutate({
        rolId: searchParams.rolId ? Number(searchParams.rolId) : undefined,
        nom: searchParams.nom,
        pagina: newPage,
        midaPagina,
        campOrdenacio,
        ordreOrdenacio,
        digition: user.digition,
      });
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', descripcio: '' });
    setEditingRole(null);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (role: any) => {
    setEditingRole(role);
    setFormData({
      nom: role.nom,
      descripcio: role.descripcio,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
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

    if (editingRole) {
      // Editar rol - només es pot modificar la descripció
      updateMutation.mutate({
        id: editingRole.id,
        data: {
          descripcio: formData.descripcio,
          digition: user.digition,
        },
      });
    } else {
      // Crear nou rol
      createMutation.mutate({
        nom: formData.nom,
        descripcio: formData.descripcio,
        digition: user.digition,
      });
    }
  };

  const handleDeleteClick = (role: any) => {
    setRoleToDelete({ id: role.id, nom: role.nom });
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
    
    if (roleToDelete) {
      deleteMutation.mutate({ id: roleToDelete.id, digition: user.digition });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rols</h1>
          <p className="text-muted-foreground mt-2">Gestionar els rols i permisos del sistema</p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Afegir Rol
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cercar Rols</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="rolId">Rol ID</Label>
              <Input
                id="rolId"
                type="number"
                value={searchParams.rolId}
                onChange={(e) => setSearchParams({ ...searchParams, rolId: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cerca per ID..."
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="campOrdenacio">Ordenar per</Label>
              <Select value={campOrdenacio} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger id="campOrdenacio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nom">Nom</SelectItem>
                  <SelectItem value="description">Descripció</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ordreOrdenacio">Ordre</Label>
              <Select value={ordreOrdenacio} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger id="ordreOrdenacio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascendent</SelectItem>
                  <SelectItem value="desc">Descendent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="midaPagina">Elements per pàgina</Label>
              <Select value={midaPagina.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger id="midaPagina">
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
            <CardTitle>Resultats de la Cerca</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Descripció</TableHead>
                  <TableHead className="text-right">Accions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.nom}</TableCell>
                    <TableCell>{role.descripcio}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(role)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(role)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {totalElements.toLocaleString()} elements totals
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Pàgina {pagina} de {totalPages.toLocaleString()}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => pagina > 1 && handlePageChange(pagina - 1)}
                        className={pagina <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>{pagina}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => pagina >= totalPages && handlePageChange(pagina + 1)}
                        className={pagina >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Editar Rol' : 'Afegir Rol'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Nom del rol..."
                disabled={!!editingRole}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcio">Descripció</Label>
              <Textarea
                id="descripcio"
                value={formData.descripcio}
                onChange={(e) => setFormData({ ...formData, descripcio: e.target.value })}
                placeholder="Descripció del rol..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel·lar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                (!editingRole && (!formData.nom.trim() || !formData.descripcio.trim())) ||
                (editingRole && !formData.descripcio.trim()) ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending ? 'Guardant...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estàs segur?</AlertDialogTitle>
            <AlertDialogDescription>
              Aquesta acció no es pot desfer. Això eliminarà permanentment el rol{' '}
              <strong>{roleToDelete?.nom}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Eliminant...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Roles;
