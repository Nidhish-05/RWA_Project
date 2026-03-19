import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [flat, setFlat] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const filled = [name, email, flat, password.length >= 6].filter(Boolean).length;
  const progress = (filled / 4) * 100;

  const strength = password.length === 0 ? 0 : password.length < 4 ? 25 : password.length < 6 ? 50 : password.length < 8 ? 75 : 100;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][Math.ceil(strength / 25)];
  const strengthColor = strength <= 25 ? 'bg-destructive' : strength <= 50 ? 'bg-warning' : strength <= 75 ? 'bg-blue-500' : 'bg-accent';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const result = await register(name, email, password, flat);
    setLoading(false);
    if (result.success) { toast.success('Account created!'); navigate('/'); }
    else toast.error(result.error || 'Email already registered or server error');
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-mesh relative overflow-hidden">
      <AnimatedBackground />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card p-8 glow-primary">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-center mb-1">Create Account</h1>
          <p className="text-center text-muted-foreground text-sm mb-4">Join your community</p>
          <Progress value={progress} className="h-1.5 mb-6" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required className="bg-secondary/50 border-border/50 rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="bg-secondary/50 border-border/50 rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Flat Number</Label>
              <Input value={flat} onChange={e => setFlat(e.target.value)} placeholder="A-101" required className="bg-secondary/50 border-border/50 rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
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
            <Button type="submit" className="w-full h-11 rounded-xl ripple-btn bg-primary hover:bg-primary/90 font-semibold" disabled={loading}>
              {loading ? <span className="animate-spin w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" /> : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
