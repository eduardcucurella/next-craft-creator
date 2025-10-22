import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCircle, Shield, UsersRound } from 'lucide-react';

const stats = [
  { name: 'Usuaris Totals', value: '2', icon: Users, color: 'text-blue-600' },
  { name: 'Perfils', value: '2', icon: UserCircle, color: 'text-green-600' },
  { name: 'Grups', value: '2', icon: UsersRound, color: 'text-purple-600' },
  { name: 'Rols', value: '2', icon: Shield, color: 'text-orange-600' },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Benvingut/da de nou, {user?.name}!</h1>
        <p className="text-muted-foreground mt-2">
          Aquí teniu una visió general del vostre sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accions Ràpides</CardTitle>
            <CardDescription>Tasques administratives comunes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">• Gestionar usuaris i permisos</p>
              <p className="text-sm text-muted-foreground">• Configurar grups i rols</p>
              <p className="text-sm text-muted-foreground">• Actualitzar perfils d'usuari</p>
              <p className="text-sm text-muted-foreground">• Monitoritzar l'activitat del sistema</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estat del Sistema</CardTitle>
            <CardDescription>Informació actual del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Estat: <span className="text-green-600 font-medium">En línia</span></p>
              <p className="text-sm text-muted-foreground">API: <span className="text-orange-600 font-medium">Mode simulació</span></p>
              <p className="text-sm text-muted-foreground">Versió: 1.0.0</p>
              <p className="text-sm text-muted-foreground">Última actualització: {new Date().toLocaleDateString('ca-ES')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
