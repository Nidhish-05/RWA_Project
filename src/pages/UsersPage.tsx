import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { StaggerList, StaggerItem } from '@/components/StaggerList';
import { cn } from '@/lib/utils';

const roleBadge: Record<string, string> = { admin: 'bg-primary/20 text-primary', resident: 'bg-blue-500/20 text-blue-400', collector: 'bg-warning/20 text-warning' };

const UsersPage = () => {
  const { allUsers } = useAuth();
  const [search, setSearch] = useState('');

  const filtered = allUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const residents = allUsers.filter(u => u.role === 'resident').length;
  const regulars = allUsers.filter(u => u.isRegularPayer).length;
  const collectors = allUsers.filter(u => u.role === 'collector').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Residents Directory</h1>

        <div className="flex flex-wrap gap-3">
          <div className="glass-card p-4 flex-1 min-w-[120px]"><p className="text-2xl font-display font-bold">{residents}</p><p className="text-xs text-muted-foreground">Residents</p></div>
          <div className="glass-card p-4 flex-1 min-w-[120px]"><p className="text-2xl font-display font-bold">{regulars}</p><p className="text-xs text-muted-foreground">Regular Payers</p></div>
          <div className="glass-card p-4 flex-1 min-w-[120px]"><p className="text-2xl font-display font-bold">{collectors}</p><p className="text-xs text-muted-foreground">Collectors</p></div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 bg-secondary/50 border-border/50 rounded-xl" />
        </div>

        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Flat</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Payer</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4">{u.flatNumber}</td>
                    <td className="p-4"><Badge className={cn('rounded-lg', roleBadge[u.role])}>{u.role}</Badge></td>
                    <td className="p-4">{u.isRegularPayer ? <Badge className="status-paid rounded-lg">Regular</Badge> : <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default UsersPage;
