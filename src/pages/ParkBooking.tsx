import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_PARK_BOOKINGS } from '@/data/mockData';
import { ParkBooking as PB } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TreePine, Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '@/components/PageTransition';
import { StaggerList, StaggerItem } from '@/components/StaggerList';

const statusStyles: Record<string, string> = { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected' };

const ParkBooking = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<PB[]>(MOCK_PARK_BOOKINGS);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [size, setSize] = useState('');
  const [purpose, setPurpose] = useState('');
  const [price, setPrice] = useState('');

  const handleBook = () => {
    if (!date || !timeSlot || !size || !purpose || !price) { toast.error('Fill all fields'); return; }
    const b: PB = { id: `b${Date.now()}`, userId: user!.id, userName: user!.name, date, timeSlot, gatheringSize: Number(size), purpose, price: Number(price), status: 'pending' };
    setBookings(prev => [b, ...prev]);
    toast.success('Booking request sent.');
    setOpen(false); setDate(''); setTimeSlot(''); setSize(''); setPurpose(''); setPrice('');
  };

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    toast.success(`Booking ${status}.`);
  };

  // Calendar dates
  const bookedDates = bookings.map(b => b.date);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2"><TreePine className="w-6 h-6 text-accent" /> Central Park Booking</h1>
          </div>
          {user?.role === 'resident' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="rounded-xl ripple-btn gap-2"><Plus className="w-4 h-4" /> Book Now</Button></DialogTrigger>
              <DialogContent className="glass-card border-border/50">
                <DialogHeader><DialogTitle className="font-display">Book Park</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <div><Label>Time Slot</Label><Input value={timeSlot} onChange={e => setTimeSlot(e.target.value)} placeholder="4 PM - 7 PM" className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <div><Label>Gathering Size</Label><Input type="number" value={size} onChange={e => setSize(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <div><Label>Purpose</Label><Textarea value={purpose} onChange={e => setPurpose(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <div><Label>Price (₹)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <Button className="w-full rounded-xl ripple-btn" onClick={handleBook}>Submit Booking</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Booked dates info */}
        {bookedDates.length > 0 && (
          <div className="glass-card p-4">
            <p className="text-sm font-medium mb-2">Booked Dates</p>
            <div className="flex flex-wrap gap-2">
              {bookedDates.map(d => <Badge key={d} className="status-pending rounded-lg">{d}</Badge>)}
            </div>
          </div>
        )}

        <StaggerList>
          <div className="space-y-3">
            {bookings.map(b => (
              <StaggerItem key={b.id}>
                <div className="glass-card p-5 hover-lift">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                        <TreePine className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{b.purpose}</p>
                        <p className="text-sm text-muted-foreground">{b.userName} · {b.date} · {b.timeSlot}</p>
                        <p className="text-sm text-muted-foreground">Size: {b.gatheringSize} · ₹{b.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusStyles[b.status]}>{b.status}</Badge>
                      {user?.role === 'admin' && b.status === 'pending' && (
                        <>
                          <Button size="sm" className="rounded-xl bg-accent hover:bg-accent/90 gap-1" onClick={() => updateStatus(b.id, 'approved')}><Check className="w-3 h-3" /> Approve</Button>
                          <Button size="sm" variant="destructive" className="rounded-xl gap-1" onClick={() => updateStatus(b.id, 'rejected')}><X className="w-3 h-3" /> Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerList>
      </div>
    </PageTransition>
  );
};

export default ParkBooking;
