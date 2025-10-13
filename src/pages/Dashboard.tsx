import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCircle, Shield, UsersRound } from 'lucide-react';

const stats = [
  { name: 'Total Users', value: '2', icon: Users, color: 'text-blue-600' },
  { name: 'Profiles', value: '2', icon: UserCircle, color: 'text-green-600' },
  { name: 'Groups', value: '2', icon: UsersRound, color: 'text-purple-600' },
  { name: 'Roles', value: '2', icon: Shield, color: 'text-orange-600' },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your system
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
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">• Manage users and permissions</p>
              <p className="text-sm text-muted-foreground">• Configure groups and roles</p>
              <p className="text-sm text-muted-foreground">• Update user profiles</p>
              <p className="text-sm text-muted-foreground">• Monitor system activity</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status: <span className="text-green-600 font-medium">Online</span></p>
              <p className="text-sm text-muted-foreground">API: <span className="text-orange-600 font-medium">Mock Mode</span></p>
              <p className="text-sm text-muted-foreground">Version: 1.0.0</p>
              <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
