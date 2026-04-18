import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';

const navLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'Maintenance', path: '/maintenance' },
  { label: 'Notices', path: '/notices' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Grievances', path: '/grievances' },
  { label: 'Service People', path: '/service-people' },
  { label: 'Quick Links', path: '/quick-links' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/30 bg-card/40 backdrop-blur-md mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Branding */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">RWA Pocket-19</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Residents Welfare Association<br />
              Sector-24, Rohini, New Delhi
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-foreground/80 uppercase tracking-wider">Navigate</h4>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-foreground/80 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary/70" />
                <span>Pocket-19, Sector-24,<br />Rohini, New Delhi – 110085</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 text-primary/70" />
                <span>RWA Office</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0 text-primary/70" />
                <span>rwa.pocket19.s24@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-foreground/80 uppercase tracking-wider">Emergency</h4>
            <ul className="space-y-2">
              <li className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Police</span>
                <a href="tel:100" className="font-display font-bold text-destructive hover:underline">100</a>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fire</span>
                <a href="tel:101" className="font-display font-bold text-destructive hover:underline">101</a>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ambulance</span>
                <a href="tel:102" className="font-display font-bold text-destructive hover:underline">102</a>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Women Helpline</span>
                <a href="tel:1091" className="font-display font-bold text-destructive hover:underline">1091</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} RWA Pocket-19, Sector-24, Rohini. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/50">
            Built for the community, by the community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
