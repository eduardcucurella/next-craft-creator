import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const Login = () => {
  const [loginUser, setLoginUser] = useState('');
  const [clau, setClau] = useState('');
  const [digition, setDigition] = useState('PRODUCCIO');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(loginUser, clau, digition);
      toast({
        title: 'Inici de sessió correcte',
        description: 'Benvingut de nou!',
      });
      navigate('/dashboard/users');
    } catch (error) {
      toast({
        title: 'Error d\'inici de sessió',
        description: 'Credencials no vàlides',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Portal d'Administració</CardTitle>
          <CardDescription className="text-center">
            Introduïu les vostres credencials per accedir al tauler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Usuari</Label>
              <Input
                id="login"
                type="text"
                placeholder="Introduïu el vostre nom d'usuari"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contrasenya</Label>
              <Input
                id="password"
                type="password"
                placeholder="Introduïu la vostra contrasenya"
                value={clau}
                onChange={(e) => setClau(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="digition">Edició</Label>
              <Select value={digition} onValueChange={setDigition}>
                <SelectTrigger id="digition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCCIO">PRODUCCIÓ</SelectItem>
                  <SelectItem value="DOCUMENTACIO">DOCUMENTACIÓ</SelectItem>
                  <SelectItem value="ARXIU">ARXIU</SelectItem>
                  <SelectItem value="EMISSIO">EMISSIÓ</SelectItem>
                  <SelectItem value="PARLAMENT">PARLAMENT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Iniciant sessió...' : 'Iniciar sessió'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
