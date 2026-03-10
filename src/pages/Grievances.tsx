import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_GRIEVANCES, GRIEVANCE_SECTORS } from '@/data/mockData';
import { Grievance } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { StaggerList, StaggerItem } from '@/components/StaggerList';

const Grievances = () => {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>(MOCK_GRIEVANCES);
  const [open, setOpen] = useState(false);
  const [sector, setSector] = useState('');
  const [desc, setDesc] = useState('');
  const [filter, setFilter] = useState('all');

  const handleSubmit = () => {
    if (!sector || !desc) { toast.error('Fill all fields'); return; }
    const g: Grievance = { id: `gr${Date.now()}`, userId: user!.id, userName: user!.name, sector, description: desc, status: 'open', createdAt: new Date().toISOString().split('T')[0] };
    setGrievances(prev => [g, ...prev]);
    toast.info('Complaint submitted. We\'ll look into it.');
    setSector(''); setDesc(''); setOpen(false);
  };

  const resolve = (id: string) => {
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: 'resolved' as const } : g));
    toast.success('Grievance resolved.');
  };

  const filtered = filter === 'all' ? grievances : grievances.filter(g => g.status === filter);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-destructive" /> Grievance Portal</h1>
            <p className="text-muted-foreground text-sm">Your voice matters</p>
          </div>
          {user?.role === 'resident' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="rounded-xl ripple-btn gap-2"><Plus className="w-4 h-4" /> Raise Complaint</Button></DialogTrigger>
              <DialogContent className="glass-card border-border/50">
                <DialogHeader><DialogTitle className="font-display">Raise Complaint</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Sector</Label>
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl"><SelectValue placeholder="Select sector" /></SelectTrigger>
                      <SelectContent>{Object.entries(GRIEVANCE_SECTORS).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Description</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <Button className="w-full rounded-xl ripple-btn" onClick={handleSubmit}>Submit</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex gap-2">
          {['all', 'open', 'resolved'].map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" className="rounded-xl capitalize" onClick={() => setFilter(f)}>{f}</Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-4">🎉</p>
            <p className="font-display text-xl font-semibold">No grievances found!</p>
            <p className="text-muted-foreground text-sm">Your community is doing great.</p>
          </div>
        ) : (
          <StaggerList>
            <div className="space-y-3">
              {filtered.map(g => {
                const sectorInfo = GRIEVANCE_SECTORS[g.sector as keyof typeof GRIEVANCE_SECTORS];
                return (
                  <StaggerItem key={g.id}>
                    <motion.div layout className={`glass-card p-5 hover-lift border-l-4 ${sectorInfo?.color || 'border-l-primary'} transition-colors duration-500`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{sectorInfo?.icon}</span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{sectorInfo?.label}</span>
                              <Badge className={g.status === 'open' ? 'status-open' : 'status-resolved'}>{g.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{g.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">{g.userName} · {g.createdAt}</p>
                          </div>
                        </div>
                        {user?.role === 'admin' && g.status === 'open' && (
                          <Button size="sm" className="rounded-xl bg-accent hover:bg-accent/90 gap-1" onClick={() => resolve(g.id)}>
                            <CheckCircle className="w-3 h-3" /> Resolve
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </div>
          </StaggerList>
        )}
      </div>
    </PageTransition>
  );
};

export default Grievances;
