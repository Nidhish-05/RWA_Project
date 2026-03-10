import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DURATION_PRICES, MOCK_PAYMENTS, MOCK_OFFLINE_TICKETS } from '@/data/mockData';
import { Payment, OfflineTicket } from '@/data/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, Clock } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { StaggerList, StaggerItem } from '@/components/StaggerList';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  paid: 'status-paid',
  pending: 'status-pending',
  collected: 'status-collected',
  approved: 'status-approved',
};

const Maintenance = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [tickets, setTickets] = useState<OfflineTicket[]>(MOCK_OFFLINE_TICKETS);
  const [selectedDuration, setSelectedDuration] = useState<number>(2);
  const [timeSlot, setTimeSlot] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const amount = DURATION_PRICES[selectedDuration] || 0;

  const handleOnlinePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setProcessing(false);
    setPaymentSuccess(true);
    const newPayment: Payment = {
      id: `p${Date.now()}`, userId: user!.id, userName: user!.name, flatNumber: user!.flatNumber,
      duration: selectedDuration, amount, status: 'paid', invoiceDate: new Date().toISOString().split('T')[0], type: 'online',
    };
    setPayments(prev => [newPayment, ...prev]);
    toast.success('Payment successful! Invoice generated.');
    setTimeout(() => setPaymentSuccess(false), 3000);
  };

  const handleOfflineSubmit = () => {
    if (!timeSlot) { toast.error('Please enter a time slot'); return; }
    const newTicket: OfflineTicket = {
      id: `ot${Date.now()}`, userId: user!.id, userName: user!.name, flatNumber: user!.flatNumber,
      timeSlot, duration: selectedDuration, amount, status: 'pending', createdAt: new Date().toISOString().split('T')[0],
    };
    setTickets(prev => [newTicket, ...prev]);
    toast.success('Offline request submitted.');
    setTimeSlot('');
  };

  const markCollected = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'collected' as const } : t));
    toast.success('Ticket marked as collected.');
  };

  const approveTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' as const } : t));
    toast.success('Ticket approved.');
  };

  const DurationSelector = () => (
    <div className="grid grid-cols-4 gap-2">
      {Object.entries(DURATION_PRICES).map(([dur, price]) => (
        <button key={dur} onClick={() => setSelectedDuration(Number(dur))}
          className={cn('glass-card p-3 text-center rounded-xl transition-all duration-200 cursor-pointer', Number(dur) === selectedDuration ? 'border-primary glow-primary-strong' : 'hover:border-primary/50')}>
          <p className="font-display font-bold">{dur} mo</p>
          <p className="text-xs text-muted-foreground">₹{price.toLocaleString()}</p>
        </button>
      ))}
    </div>
  );

  // Collector view
  if (user?.role === 'collector') {
    const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
    return (
      <PageTransition>
        <div className="space-y-6">
          <h1 className="font-display text-2xl font-bold">Offline Tickets</h1>
          <div className="flex gap-2">
            {['all', 'pending', 'collected'].map(f => (
              <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" className="rounded-xl capitalize" onClick={() => setFilter(f)}>{f}</Button>
            ))}
          </div>
          <StaggerList>
            <div className="space-y-3">
              {filtered.map(t => (
                <StaggerItem key={t.id}>
                  <div className="glass-card p-4 hover-lift flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{t.userName} · {t.flatNumber}</p>
                      <p className="text-sm text-muted-foreground">{t.duration} months · ₹{t.amount.toLocaleString()} · {t.timeSlot}</p>
                      <p className="text-xs text-muted-foreground">{t.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusStyles[t.status]}>{t.status}</Badge>
                      {t.status === 'pending' && <Button size="sm" className="rounded-xl" onClick={() => markCollected(t.id)}>Mark Collected</Button>}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerList>
        </div>
      </PageTransition>
    );
  }

  // Admin extra section
  const AdminSection = () => (
    <div className="space-y-6 mt-8">
      <h2 className="font-display text-xl font-bold">Admin: Ticket Verification</h2>
      <div className="flex gap-3 flex-wrap mb-2">
        <div className="glass-card p-4 flex-1 min-w-[150px]"><p className="text-2xl font-display font-bold">₹{payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Collected</p></div>
        <div className="glass-card p-4 flex-1 min-w-[150px]"><p className="text-2xl font-display font-bold">{tickets.filter(t => t.status === 'pending').length}</p><p className="text-xs text-muted-foreground">Pending Tickets</p></div>
      </div>
      <div className="space-y-3">
        {tickets.filter(t => t.status === 'collected').map(t => (
          <div key={t.id} className="glass-card p-4 hover-lift flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{t.userName} · {t.flatNumber}</p>
              <p className="text-sm text-muted-foreground">{t.duration} months · ₹{t.amount.toLocaleString()}</p>
            </div>
            <Button size="sm" className="rounded-xl bg-accent hover:bg-accent/90" onClick={() => approveTicket(t.id)}>Approve</Button>
          </div>
        ))}
      </div>
    </div>
  );

  // Resident + Admin view
  const userPayments = user?.role === 'admin' ? payments : payments.filter(p => p.userId === user?.id);
  const userTickets = user?.role === 'admin' ? tickets : tickets.filter(t => t.userId === user?.id);

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6 text-primary" /> Maintenance</h1>

        <Tabs defaultValue="online" className="w-full">
          <TabsList className="bg-secondary/50 rounded-xl mb-6">
            <TabsTrigger value="online" className="rounded-xl">Online</TabsTrigger>
            <TabsTrigger value="offline" className="rounded-xl">Offline</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl">History</TabsTrigger>
          </TabsList>

          <TabsContent value="online">
            <div className="glass-card p-6 max-w-lg">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-primary to-accent mb-6" />
              <h3 className="font-display font-semibold mb-4">Select Duration</h3>
              <DurationSelector />
              <AnimatePresence mode="wait">
                <motion.div key={selectedDuration} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                  <p className="text-3xl font-display font-bold">₹{amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{selectedDuration} months maintenance</p>
                </motion.div>
              </AnimatePresence>

              {paymentSuccess ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-6 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-accent font-semibold">Payment Successful!</p>
                </motion.div>
              ) : (
                <Button className="w-full mt-6 h-11 rounded-xl ripple-btn" onClick={handleOnlinePay} disabled={processing}>
                  {processing ? <span className="animate-spin w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" /> : 'Pay Now (Demo)'}
                </Button>
              )}
              <p className="text-xs text-muted-foreground text-center mt-3">Razorpay integration coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="offline">
            <div className="glass-card p-6 max-w-lg">
              <h3 className="font-display font-semibold mb-4">Offline Payment Request</h3>
              <DurationSelector />
              <div className="mt-4 space-y-3">
                <div><Label>Time Slot</Label><Input value={timeSlot} onChange={e => setTimeSlot(e.target.value)} placeholder="10:00 AM - 12:00 PM" className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                <p className="text-xl font-display font-bold text-center">₹{amount.toLocaleString()}</p>
                <Button className="w-full rounded-xl ripple-btn" onClick={handleOfflineSubmit}>Submit Request</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <StaggerList>
              <div className="space-y-3 relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/30" />
                {[...userPayments.map(p => ({ ...p, kind: 'payment' as const })), ...userTickets.map(t => ({ ...t, kind: 'ticket' as const, type: 'offline' as const }))].map((item) => (
                  <StaggerItem key={item.id}>
                    <div className="glass-card p-4 hover-lift ml-10 relative">
                      <div className="absolute -left-[26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary bg-background" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{item.duration} months · ₹{item.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{'invoiceDate' in item ? item.invoiceDate : item.createdAt}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="rounded-lg">{item.type}</Badge>
                          <Badge className={statusStyles[item.status]}>{item.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerList>
          </TabsContent>
        </Tabs>

        {user?.role === 'admin' && <AdminSection />}
      </div>
    </PageTransition>
  );
};

export default Maintenance;
