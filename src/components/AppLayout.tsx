import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, CreditCard, FileText, Image, AlertTriangle, Users, Wrench, Link2, LogOut, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { MOCK_GRIEVANCES } from '@/data/mockData';
import Footer from '@/components/Footer';

const navItems = {
  admin: [
    { path: '/', label: 'Dashboard', icon: Building2 },
    { path: '/maintenance', label: 'Maintenance', icon: CreditCard },
    { path: '/notices', label: 'Notices', icon: FileText },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/grievances', label: 'Grievances', icon: AlertTriangle },
    { path: '/service-people', label: 'Service People', icon: Wrench },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/quick-links', label: 'Quick Links', icon: Link2 },
  ],
  resident: [
    { path: '/', label: 'Dashboard', icon: Building2 },
    { path: '/maintenance', label: 'Maintenance', icon: CreditCard },
    { path: '/notices', label: 'Notices', icon: FileText },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/grievances', label: 'Grievances', icon: AlertTriangle },
    { path: '/service-people', label: 'Service People', icon: Wrench },
    { path: '/quick-links', label: 'Quick Links', icon: Link2 },
  ],
  collector: [
    { path: '/', label: 'Dashboard', icon: Building2 },
    { path: '/maintenance', label: 'Maintenance', icon: CreditCard },
  ],
};

const roleBadgeColors = {
  admin: 'bg-primary/20 text-primary',
  resident: 'bg-blue-500/20 text-blue-400',
  collector: 'bg-warning/20 text-warning',
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const openGrievances = MOCK_GRIEVANCES.filter(g => g.status === 'open').length;

  if (!user) return null;

  const links = navItems[user.role] || [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold">RWA Portal</h1>
            <Badge className={cn('text-xs mt-1', roleBadgeColors[user.role])}>{user.role}</Badge>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                active ? 'nav-link-active bg-primary/10 text-primary glow-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <item.icon className={cn('w-5 h-5', active && 'text-primary')} />
              <span>{item.label}</span>
              {item.label === 'Grievances' && openGrievances > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center pulse-dot">
                  {openGrievances}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/50">
        <div className="mb-3 px-4">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.flatNumber}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive" onClick={logout}>
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[260px] fixed inset-y-0 left-0 glass-sidebar z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0 glass-sidebar border-r-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[260px]">
        <header className="sticky top-0 z-20 h-14 flex items-center gap-4 px-6 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h2 className="font-display font-semibold text-sm text-muted-foreground">
            {links.find(l => l.path === location.pathname)?.label || 'Dashboard'}
          </h2>
        </header>
        <main className="p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
