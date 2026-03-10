import { ExternalLink, Droplets, Zap, Building, Shield, Landmark, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { StaggerList, StaggerItem } from '@/components/StaggerList';

const links = [
  { title: 'Delhi Jal Board', desc: 'Water supply & billing', icon: Droplets, color: 'from-blue-500 to-cyan-500', url: 'https://djb.gov.in' },
  { title: 'BSES/BYPL Portal', desc: 'Electricity billing & complaints', icon: Zap, color: 'from-yellow-500 to-amber-500', url: 'https://www.bsesdelhi.com' },
  { title: 'Municipal Corporation', desc: 'MCD Delhi services', icon: Building, color: 'from-primary to-violet-500', url: 'https://mcdonline.nic.in' },
  { title: 'Delhi Police', desc: 'File complaints & reports', icon: Shield, color: 'from-red-500 to-rose-500', url: 'https://delhipolice.gov.in' },
  { title: 'NDMC', desc: 'New Delhi Municipal Council', icon: Landmark, color: 'from-accent to-emerald-400', url: 'https://www.ndmc.gov.in' },
];

const emergency = [
  { label: 'Police', number: '100' },
  { label: 'Ambulance', number: '102' },
  { label: 'Fire', number: '101' },
];

const QuickLinks = () => (
  <PageTransition>
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold flex items-center gap-2"><ExternalLink className="w-6 h-6 text-primary" /> Quick Links</h1>

      <StaggerList>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map(l => (
            <StaggerItem key={l.title}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-5 hover-lift cursor-pointer group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center mb-4`}>
                    <l.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold">{l.title}</p>
                      <p className="text-sm text-muted-foreground">{l.desc}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              </a>
            </StaggerItem>
          ))}
        </div>
      </StaggerList>

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Emergency Numbers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {emergency.map(e => (
            <a key={e.number} href={`tel:${e.number}`} className="glass-card p-4 hover-lift flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium">{e.label}</p>
                <p className="text-lg font-display font-bold">{e.number}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  </PageTransition>
);

export default QuickLinks;
