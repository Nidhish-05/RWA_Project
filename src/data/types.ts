export type Role = 'admin' | 'resident' | 'collector';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  flatNumber: string;
  isRegularPayer?: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  flatNumber: string;
  duration: number;
  amount: number;
  status: 'paid' | 'pending' | 'collected' | 'approved';
  invoiceDate: string;
  type: 'online' | 'offline';
}

export interface OfflineTicket {
  id: string;
  userId: string;
  userName: string;
  flatNumber: string;
  timeSlot: string;
  duration: number;
  amount: number;
  status: 'pending' | 'collected' | 'approved';
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  createdBy: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ParkBooking {
  id: string;
  userId: string;
  userName: string;
  date: string;
  timeSlot: string;
  gatheringSize: number;
  purpose: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Grievance {
  id: string;
  userId: string;
  userName: string;
  sector: string;
  description: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface ServicePerson {
  id: string;
  name: string;
  category: string;
  contactNumber: string;
}
