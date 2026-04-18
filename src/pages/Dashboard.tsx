import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Users, CreditCard, AlertTriangle, FileText, MessageSquare, Car } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MONTHLY_COLLECTION, GRIEVANCE_BY_SECTOR, MOCK_USERS, MOCK_PAYMENTS, MOCK_GRIEVANCES } from '@/data/mockData';
import PageTransition from '@/components/PageTransition';
import { StaggerList, StaggerItem } from '@/components/StaggerList';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const totalResidents = MOCK_USERS.filter(u => u.role === 'resident').length;
  const paidCount = MOCK_PAYMENTS.filter(p => p.status === 'paid').length;
  const collectionRate = Math.round((paidCount / Math.max(totalResidents, 1)) * 100);
  const openGrievances = MOCK_GRIEVANCES.filter(g => g.status === 'open').length;

  const stats = [
    { label: 'Total Residents', value: totalResidents, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Collection Rate', value: `${collectionRate}%`, icon: CreditCard, color: 'from-primary to-violet-500' },
    { label: 'Open Grievances', value: openGrievances, icon: AlertTriangle, color: 'from-destructive to-rose-500', pulse: true },
    { label: 'Vehicles Registered', value: '—', icon: Car, color: 'from-accent to-emerald-400' },
  ];

  const quickActions = [
    { label: 'Pay Now', icon: CreditCard, path: '/maintenance', color: 'from-primary to-violet-500' },
    { label: 'Raise Complaint', icon: MessageSquare, path: '/grievances', color: 'from-destructive to-rose-500' },
    { label: 'View Notices', icon: FileText, path: '/notices', color: 'from-blue-500 to-cyan-500' },
    { label: 'Service People', icon: Car, path: '/service-people', color: 'from-accent to-emerald-400' },
  ];

  const recentActivity = [
    { text: 'Rajesh Kumar paid ₹6,000 maintenance', time: 'Jan 15', color: 'bg-accent' },
    { text: 'Water Supply notice posted', time: 'Mar 5', color: 'bg-blue-500' },
    { text: 'Birthday Party booking requested', time: 'Mar 20', color: 'bg-primary' },
    { text: 'Pothole grievance raised by Rajesh', time: 'Feb 25', color: 'bg-destructive' },
    { text: 'Priya Sharma paid ₹2,000 maintenance', time: 'Feb 1', color: 'bg-accent' },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="font-display text-3xl font-bold">
            Welcome back, {user?.name} <span className="wave-emoji">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your community</p>
        </div>

        {/* Stats */}
        <StaggerList>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(s => (
              <StaggerItem key={s.label}>
                <div className="glass-card p-5 hover-lift">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                      <s.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    {s.pulse && <span className="w-2.5 h-2.5 rounded-full bg-destructive pulse-dot" />}
                  </div>
                  <p className="text-2xl font-display font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerList>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4">Monthly Collection</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={MONTHLY_COLLECTION}>
                <XAxis dataKey="month" stroke="hsl(215 20% 55%)" fontSize={12} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(222 47% 8%)', border: '1px solid hsl(217 33% 17%)', borderRadius: '12px', color: 'hsl(210 40% 96%)' }} />
                <Bar dataKey="amount" fill="hsl(239 84% 67%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4">Grievances by Sector</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={GRIEVANCE_BY_SECTOR} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {GRIEVANCE_BY_SECTOR.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222 47% 8%)', border: '1px solid hsl(217 33% 17%)', borderRadius: '12px', color: 'hsl(210 40% 96%)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {GRIEVANCE_BY_SECTOR.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                  {s.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-display font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(a => (
                <motion.button
                  key={a.label}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(a.path)}
                  className="glass-card p-5 flex flex-col items-center gap-3 hover-lift cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center`}>
                    <a.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
            <div className="glass-card p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {recentActivity.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 p-2">
                  <span className={`w-2 h-2 rounded-full ${a.color} shrink-0`} />
                  <span className="text-sm flex-1">{a.text}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
