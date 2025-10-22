import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Users, UserCircle, UsersRound, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="text-center max-w-3xl">
        <div className="mb-8 flex justify-center gap-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="rounded-full bg-primary/10 p-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div className="rounded-full bg-primary/10 p-4">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
          <div className="rounded-full bg-primary/10 p-4">
            <UsersRound className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="mb-4 text-5xl font-bold">Portal d'Administració</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Sistema modern de gestió d'usuaris amb capacitats CRUD completes
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/login')}>
            Començar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
