import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, RegisterPayload } from '@/contexts/AuthContext';
import type { ResidentType, VehicleType, VehicleFormData, TenantDetails } from '@/data/types';
import { Building2, ChevronLeft, ChevronRight, Check, Plus, Trash2, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const STEPS = ['Personal Info', 'Residence', 'Vehicles', 'Review'];

const emptyVehicle = (): VehicleFormData => ({
  registrationNumber: '',
  registeredName: '',
  contactInfo: '',
  vehicleType: '4-wheeler',
});

const Register = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Step 1 — Personal Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');

  // Step 2 — Residence
  const [flatNumber, setFlatNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [residentType, setResidentType] = useState<ResidentType>('owner');
  const [tenantDetails, setTenantDetails] = useState<TenantDetails>({
    moveInDate: '', ownerName: '', ownerPhone: '',
  });

  // Step 3 — Vehicles
  const [vehicles, setVehicles] = useState<VehicleFormData[]>([]);

  // Password strength
  const strength = password.length === 0 ? 0 : password.length < 4 ? 25 : password.length < 6 ? 50 : password.length < 8 ? 75 : 100;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][Math.ceil(strength / 25)];
  const strengthColor = strength <= 25 ? 'bg-destructive' : strength <= 50 ? 'bg-warning' : strength <= 75 ? 'bg-blue-500' : 'bg-accent';

  // Validation per step
  const validateStep = (s: number): boolean => {
    if (s === 0) {
      if (!name.trim()) { toast.error('Full name is required'); return false; }
      if (!email.trim()) { toast.error('Email is required'); return false; }
      if (password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
      if (!phone.trim() || phone.length < 10) { toast.error('Valid phone number is required'); return false; }
    }
    if (s === 1) {
      if (!flatNumber.trim()) { toast.error('Flat number is required'); return false; }
      if (!floorNumber.trim()) { toast.error('Floor number is required'); return false; }
      if (residentType === 'tenant') {
        if (!tenantDetails.moveInDate) { toast.error('Move-in date is required for tenants'); return false; }
        if (!tenantDetails.ownerName.trim()) { toast.error("Owner's name is required for tenants"); return false; }
        if (!tenantDetails.ownerPhone.trim()) { toast.error("Owner's phone is required for tenants"); return false; }
      }
    }
    if (s === 2) {
      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        if (!v.registrationNumber.trim()) { toast.error(`Vehicle ${i + 1}: Registration number is required`); return false; }
        if (!v.registeredName.trim()) { toast.error(`Vehicle ${i + 1}: Registered name is required`); return false; }
        if (!v.contactInfo.trim()) { toast.error(`Vehicle ${i + 1}: Contact info is required`); return false; }
      }
    }
    return true;
  };

  const nextStep = () => { if (validateStep(step)) setStep(s => Math.min(s + 1, 3)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const addVehicle = () => setVehicles(prev => [...prev, emptyVehicle()]);
  const removeVehicle = (idx: number) => setVehicles(prev => prev.filter((_, i) => i !== idx));
  const updateVehicle = (idx: number, field: keyof VehicleFormData, value: any) => {
    setVehicles(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) return;
    setLoading(true);
    const payload: RegisterPayload = {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      alternatePhone: altPhone.trim() || undefined,
      flatNumber: flatNumber.trim(),
      floorNumber: floorNumber.trim(),
      residentType,
      tenantDetails: residentType === 'tenant' ? tenantDetails : undefined,
      vehicles,
    };
    const result = await register(payload);
    setLoading(false);
    if (result.success) { toast.success('Account created!'); navigate('/'); }
    else toast.error(result.error || 'Registration failed');
  };

  // ── Step progress bar ─────────────────────────────────────────────────────
  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center animated-mesh relative overflow-hidden py-12">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="glass-card p-8 glow-primary">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-center mb-1">Create Account</h1>
          <p className="text-center text-muted-foreground text-sm mb-6">Join your community — Pocket-19, Sector-24</p>

          {/* Stepper */}
          <div className="flex items-center gap-1 mb-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  i < step ? 'bg-accent text-accent-foreground' :
                  i === step ? 'bg-primary text-primary-foreground glow-primary-strong' :
                  'bg-secondary text-muted-foreground'
                )}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 hidden sm:block">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-secondary/50 mb-6 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── Step 0: Personal Info ──────────────────────────────── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nidhish Kumar" required className="bg-secondary/50 border-border/50 rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required className="bg-secondary/50 border-border/50 rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required className="bg-secondary/50 border-border/50 rounded-xl h-11" />
                    {password.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${strength}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{strengthLabel}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210" maxLength={15} className="bg-secondary/50 border-border/50 rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Alternate Phone <span className="text-muted-foreground">(optional)</span></Label>
                    <Input value={altPhone} onChange={e => setAltPhone(e.target.value)} placeholder="Backup number" maxLength={15} className="bg-secondary/50 border-border/50 rounded-xl h-11" />
                  </div>
                </div>
              )}

              {/* ── Step 1: Residence ──────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Floor Number *</Label>
                      <Input value={floorNumber} onChange={e => setFloorNumber(e.target.value)} placeholder="e.g. 2" className="bg-secondary/50 border-border/50 rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label>Flat Number *</Label>
                      <Input value={flatNumber} onChange={e => setFlatNumber(e.target.value)} placeholder="e.g. A-201" className="bg-secondary/50 border-border/50 rounded-xl h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Resident Type *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['owner', 'tenant'] as ResidentType[]).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setResidentType(t)}
                          className={cn(
                            'glass-card p-3 text-center rounded-xl transition-all duration-200 capitalize cursor-pointer',
                            residentType === t ? 'border-primary glow-primary-strong text-primary font-semibold' : 'hover:border-primary/50 text-muted-foreground'
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {residentType === 'tenant' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-2 border-t border-border/30"
                    >
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tenant Details</p>
                      <div className="space-y-2">
                        <Label>Move-in Date *</Label>
                        <Input type="date" value={tenantDetails.moveInDate} onChange={e => setTenantDetails(prev => ({ ...prev, moveInDate: e.target.value }))} className="bg-secondary/50 border-border/50 rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label>Owner's Name *</Label>
                        <Input value={tenantDetails.ownerName} onChange={e => setTenantDetails(prev => ({ ...prev, ownerName: e.target.value }))} placeholder="Property owner's full name" className="bg-secondary/50 border-border/50 rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label>Owner's Phone *</Label>
                        <Input value={tenantDetails.ownerPhone} onChange={e => setTenantDetails(prev => ({ ...prev, ownerPhone: e.target.value }))} placeholder="9876543210" maxLength={15} className="bg-secondary/50 border-border/50 rounded-xl h-11" />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── Step 2: Vehicles ───────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {vehicles.length === 0 ? 'No vehicles added yet' : `${vehicles.length} vehicle(s)`}
                    </p>
                    <Button type="button" size="sm" variant="outline" className="rounded-xl gap-1" onClick={addVehicle}>
                      <Plus className="w-3 h-3" /> Add Vehicle
                    </Button>
                  </div>

                  {vehicles.length === 0 && (
                    <div className="glass-card p-8 text-center">
                      <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Click "Add Vehicle" to register your vehicles.<br />You can skip this step if you have none.</p>
                    </div>
                  )}

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {vehicles.map((v, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4 space-y-3 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-primary">Vehicle {idx + 1}</span>
                          <button type="button" onClick={() => removeVehicle(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Registration No. *</Label>
                            <Input value={v.registrationNumber} onChange={e => updateVehicle(idx, 'registrationNumber', e.target.value.toUpperCase())} placeholder="DL01AB1234" className="bg-secondary/50 border-border/50 rounded-xl h-9 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Vehicle Type *</Label>
                            <Select value={v.vehicleType} onValueChange={(val: VehicleType) => updateVehicle(idx, 'vehicleType', val)}>
                              <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2-wheeler">2-Wheeler</SelectItem>
                                <SelectItem value="4-wheeler">4-Wheeler</SelectItem>
                                <SelectItem value="heavy">Heavy Vehicle</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Name as Registered *</Label>
                          <Input value={v.registeredName} onChange={e => updateVehicle(idx, 'registeredName', e.target.value)} placeholder="Name on RC" className="bg-secondary/50 border-border/50 rounded-xl h-9 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Contact Info *</Label>
                          <Input value={v.contactInfo} onChange={e => updateVehicle(idx, 'contactInfo', e.target.value)} placeholder="Phone or email linked to vehicle" className="bg-secondary/50 border-border/50 rounded-xl h-9 text-sm" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 3: Review ─────────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="glass-card p-4 space-y-2">
                    <p className="text-xs font-medium text-primary uppercase tracking-wider">Personal</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Name</span><span>{name}</span>
                      <span className="text-muted-foreground">Email</span><span className="truncate">{email}</span>
                      <span className="text-muted-foreground">Phone</span><span>{phone}</span>
                      {altPhone && <><span className="text-muted-foreground">Alt. Phone</span><span>{altPhone}</span></>}
                    </div>
                  </div>

                  <div className="glass-card p-4 space-y-2">
                    <p className="text-xs font-medium text-primary uppercase tracking-wider">Residence</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Floor</span><span>{floorNumber}</span>
                      <span className="text-muted-foreground">Flat</span><span>{flatNumber}</span>
                      <span className="text-muted-foreground">Type</span><span className="capitalize">{residentType}</span>
                    </div>
                    {residentType === 'tenant' && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pt-2 border-t border-border/20">
                        <span className="text-muted-foreground">Move-in</span><span>{tenantDetails.moveInDate}</span>
                        <span className="text-muted-foreground">Owner</span><span>{tenantDetails.ownerName}</span>
                        <span className="text-muted-foreground">Owner Ph.</span><span>{tenantDetails.ownerPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="glass-card p-4 space-y-2">
                    <p className="text-xs font-medium text-primary uppercase tracking-wider">
                      Vehicles ({vehicles.length})
                    </p>
                    {vehicles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No vehicles registered</p>
                    ) : (
                      <div className="space-y-2">
                        {vehicles.map((v, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Car className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{v.registrationNumber} — {v.vehicleType}</p>
                              <p className="text-xs text-muted-foreground truncate">{v.registeredName}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 gap-3">
            {step > 0 ? (
              <Button type="button" variant="outline" className="rounded-xl gap-1" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            ) : <div />}

            {step < 3 ? (
              <Button type="button" className="rounded-xl gap-1 ripple-btn" onClick={nextStep}>
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                className="rounded-xl ripple-btn bg-accent hover:bg-accent/90 gap-1 font-semibold"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <span className="animate-spin w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" /> : <><Check className="w-4 h-4" /> Create Account</>}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
