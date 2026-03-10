import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_SERVICE_PEOPLE, SERVICE_CATEGORIES } from '@/data/mockData';
import { ServicePerson } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wrench, Plus, Phone, Sparkles, Zap, Recycle, UtensilsCrossed, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

const categoryIcons: Record<string, React.ElementType> = {
  maid: Sparkles, electrician: Zap, scrap_collector: Recycle, tiffin_service: UtensilsCrossed,
};

const ServicePeoplePage = () => {
  const { user } = useAuth();
  const [people, setPeople] = useState<ServicePerson[]>(MOCK_SERVICE_PEOPLE);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [cat, setCat] = useState('');
  const [contact, setContact] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const handleAdd = () => {
    if (!name || !cat || !contact) { toast.error('Fill all fields'); return; }
    setPeople(prev => [...prev, { id: `s${Date.now()}`, name, category: cat, contactNumber: contact }]);
    toast.success('Service person added!');
    setName(''); setCat(''); setContact(''); setOpen(false);
  };

  const filtered = people.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Wrench className="w-6 h-6 text-primary" /> Service People Directory</h1>
          {user?.role === 'admin' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="rounded-xl ripple-btn gap-2"><Plus className="w-4 h-4" /> Add Person</Button></DialogTrigger>
              <DialogContent className="glass-card border-border/50">
                <DialogHeader><DialogTitle className="font-display">Add Service Person</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <div><Label>Category</Label>
                    <Select value={cat} onValueChange={setCat}>
                      <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{Object.entries(SERVICE_CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Contact</Label><Input value={contact} onChange={e => setContact(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <Button className="w-full rounded-xl ripple-btn" onClick={handleAdd}>Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 bg-secondary/50 border-border/50 rounded-xl" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', ...Object.keys(SERVICE_CATEGORIES)].map(c => (
              <Button key={c} variant={filterCat === c ? 'default' : 'outline'} size="sm" className="rounded-xl capitalize" onClick={() => setFilterCat(c)}>
                {c === 'all' ? 'All' : SERVICE_CATEGORIES[c as keyof typeof SERVICE_CATEGORIES]?.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(p => {
              const catInfo = SERVICE_CATEGORIES[p.category as keyof typeof SERVICE_CATEGORIES];
              const Icon = categoryIcons[p.category] || Wrench;
              return (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-5 hover-lift flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${catInfo?.color || 'from-primary to-primary'} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{catInfo?.label}</p>
                  </div>
                  <a href={`tel:${p.contactNumber}`} className="shrink-0">
                    <Button size="sm" variant="outline" className="rounded-xl gap-1"><Phone className="w-3 h-3" /> Call</Button>
                  </a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default ServicePeoplePage;
