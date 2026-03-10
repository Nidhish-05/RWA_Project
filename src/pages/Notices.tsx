import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_NOTICES, NOTICE_CATEGORIES } from '@/data/mockData';
import { Notice } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '@/components/PageTransition';
import { StaggerList, StaggerItem } from '@/components/StaggerList';

const categoryBorderColors: Record<string, string> = {
  local_event: 'border-l-primary',
  electricity: 'border-l-warning',
  water_supply: 'border-l-blue-500',
  weekly_meeting: 'border-l-accent',
};

const Notices = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('');
  const [date, setDate] = useState('');

  const handleAdd = () => {
    if (!title || !desc || !cat || !date) { toast.error('Fill all fields'); return; }
    const n: Notice = { id: `n${Date.now()}`, title, description: desc, category: cat, date, createdBy: user!.name };
    setNotices(prev => [n, ...prev]);
    toast.success('Notice published successfully.');
    setTitle(''); setDesc(''); setCat(''); setDate(''); setOpen(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6 text-primary" /> Notice Board</h1>
            <p className="text-muted-foreground text-sm">Stay informed about your community</p>
          </div>
          {user?.role === 'admin' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl ripple-btn gap-2"><Plus className="w-4 h-4" /> New Notice</Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-border/50">
                <DialogHeader><DialogTitle className="font-display">Create Notice</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <div><Label>Description</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <div><Label>Category</Label>
                    <Select value={cat} onValueChange={setCat}>
                      <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{Object.entries(NOTICE_CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <Button className="w-full rounded-xl ripple-btn" onClick={handleAdd}>Publish</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <StaggerList>
          <div className="space-y-4">
            {notices.map(n => {
              const catInfo = NOTICE_CATEGORIES[n.category as keyof typeof NOTICE_CATEGORIES];
              return (
                <StaggerItem key={n.id}>
                  <div className={`glass-card p-5 hover-lift border-l-4 ${categoryBorderColors[n.category] || 'border-l-primary'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {catInfo && <Badge className={`${catInfo.color} rounded-lg mb-2`}>{catInfo.label}</Badge>}
                        <h3 className="font-display font-semibold text-lg">{n.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{n.description}</p>
                        <p className="text-xs text-muted-foreground mt-3">Posted by {n.createdBy} · {n.date}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerList>
      </div>
    </PageTransition>
  );
};

export default Notices;
