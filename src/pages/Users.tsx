import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
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

const Users = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      toast({
        title: 'Usuari eliminat',
        description: 'L\'usuari s\'ha eliminat correctament.',
      });
      handleSearch();
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

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuaris</h1>
          <p className="text-muted-foreground mt-2">Gestionar els usuaris del sistema i els seus permisos</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Afegir Usuari
        </Button>
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
                placeholder="Cerca per login..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={searchParams.nom}
                onChange={(e) => setSearchParams({ ...searchParams, nom: e.target.value })}
                placeholder="Cerca per nom..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cognom">Cognom</Label>
              <Input
                id="cognom"
                value={searchParams.cognom}
                onChange={(e) => setSearchParams({ ...searchParams, cognom: e.target.value })}
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
                        {user.primaryGroupId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(user.id)}
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
    </div>
  );
};

export default Users;
