import { User, Payment, OfflineTicket, Notice, GalleryImage, Grievance, ServicePerson } from './types';

export const DURATION_PRICES: Record<number, number> = { 2: 2000, 4: 4000, 6: 6000, 12: 12000 };

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@rwa.com', password: 'admin123', role: 'admin', flatNumber: 'A-101' },
  { id: '2', name: 'Rajesh Kumar', email: 'rajesh@rwa.com', password: 'rajesh123', role: 'resident', flatNumber: 'B-204', isRegularPayer: true },
  { id: '3', name: 'Collector Singh', email: 'collector@rwa.com', password: 'collector123', role: 'collector', flatNumber: 'C-301' },
  { id: '4', name: 'Priya Sharma', email: 'priya@rwa.com', password: 'priya123', role: 'resident', flatNumber: 'A-305', isRegularPayer: false },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', userId: '2', userName: 'Rajesh Kumar', flatNumber: 'B-204', duration: 6, amount: 6000, status: 'paid', invoiceDate: '2026-01-15', type: 'online' },
  { id: 'p2', userId: '4', userName: 'Priya Sharma', flatNumber: 'A-305', duration: 2, amount: 2000, status: 'paid', invoiceDate: '2026-02-01', type: 'online' },
];

export const MOCK_OFFLINE_TICKETS: OfflineTicket[] = [
  { id: 'ot1', userId: '2', userName: 'Rajesh Kumar', flatNumber: 'B-204', timeSlot: '10:00 AM - 12:00 PM', duration: 4, amount: 4000, status: 'pending', createdAt: '2026-02-20' },
  { id: 'ot2', userId: '4', userName: 'Priya Sharma', flatNumber: 'A-305', timeSlot: '2:00 PM - 4:00 PM', duration: 2, amount: 2000, status: 'collected', createdAt: '2026-02-18' },
];

export const MOCK_NOTICES: Notice[] = [
  { id: 'n1', title: 'Annual General Meeting', description: 'All residents are invited to the AGM on March 15th at the community hall. Agenda includes budget review and new initiatives.', category: 'weekly_meeting', date: '2026-03-15', createdBy: 'Admin User' },
  { id: 'n2', title: 'Water Supply Disruption', description: 'Water supply will be disrupted on March 5th from 10 AM to 4 PM due to maintenance work by Delhi Jal Board.', category: 'water_supply', date: '2026-03-05', createdBy: 'Admin User' },
  { id: 'n3', title: 'Holi Celebration', description: 'Join us for Holi celebrations at the central park on March 14th. Colors and refreshments will be provided.', category: 'local_event', date: '2026-03-14', createdBy: 'Admin User' },
];

export const MOCK_GALLERY: GalleryImage[] = [
  { id: 'g1', title: 'Republic Day Celebration', imageUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600', uploadedBy: 'Admin User', uploadedAt: '2026-01-26' },
  { id: 'g2', title: 'Garden Maintenance Drive', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600', uploadedBy: 'Rajesh Kumar', uploadedAt: '2026-02-10' },
];


export const MOCK_GRIEVANCES: Grievance[] = [
  { id: 'gr1', userId: '2', userName: 'Rajesh Kumar', sector: 'roads', description: 'Potholes near Block B entrance need urgent repair.', status: 'open', createdAt: '2026-02-25' },
  { id: 'gr2', userId: '4', userName: 'Priya Sharma', sector: 'water', description: 'Low water pressure in A block since last week.', status: 'open', createdAt: '2026-02-22' },
];

export const MOCK_SERVICE_PEOPLE: ServicePerson[] = [
  { id: 's1', name: 'Ramesh', category: 'electrician', contactNumber: '9876543210' },
  { id: 's2', name: 'Sunita Devi', category: 'maid', contactNumber: '9876543211' },
  { id: 's3', name: 'Mohd Irfan', category: 'scrap_collector', contactNumber: '9876543212' },
  { id: 's4', name: 'Geeta Devi', category: 'tiffin_service', contactNumber: '9876543213' },
];

export const NOTICE_CATEGORIES = {
  local_event: { label: 'Local Event', color: 'bg-primary/20 text-primary' },
  electricity: { label: 'Electricity', color: 'bg-warning/20 text-warning' },
  water_supply: { label: 'Water Supply', color: 'bg-blue-500/20 text-blue-400' },
  weekly_meeting: { label: 'Weekly Meeting', color: 'bg-accent/20 text-accent' },
};

export const GRIEVANCE_SECTORS = {
  roads: { label: 'Roads', icon: '🛣️', color: 'border-l-orange-500' },
  sewage: { label: 'Sewage', icon: '💧', color: 'border-l-cyan-500' },
  security: { label: 'Security', icon: '🔒', color: 'border-l-purple-500' },
  electricity: { label: 'Electricity', icon: '⚡', color: 'border-l-yellow-500' },
  water: { label: 'Water', icon: '🚿', color: 'border-l-blue-500' },
};

export const SERVICE_CATEGORIES = {
  maid: { label: 'Maid', color: 'from-pink-500 to-rose-500' },
  electrician: { label: 'Electrician', color: 'from-yellow-500 to-amber-500' },
  scrap_collector: { label: 'Scrap Collector', color: 'from-green-500 to-emerald-500' },
  tiffin_service: { label: 'Tiffin Service', color: 'from-blue-500 to-indigo-500' },
};

export const MONTHLY_COLLECTION = [
  { month: 'Oct', amount: 45000 },
  { month: 'Nov', amount: 52000 },
  { month: 'Dec', amount: 38000 },
  { month: 'Jan', amount: 60000 },
  { month: 'Feb', amount: 48000 },
  { month: 'Mar', amount: 55000 },
];

export const GRIEVANCE_BY_SECTOR = [
  { name: 'Roads', value: 8, fill: 'hsl(25, 95%, 53%)' },
  { name: 'Sewage', value: 5, fill: 'hsl(187, 92%, 50%)' },
  { name: 'Security', value: 3, fill: 'hsl(271, 91%, 65%)' },
  { name: 'Electricity', value: 7, fill: 'hsl(48, 96%, 53%)' },
  { name: 'Water', value: 6, fill: 'hsl(217, 91%, 60%)' },
];
