export type Role = 'admin' | 'resident' | 'collector';
export type ResidentType = 'owner' | 'tenant';
export type VehicleType = '2-wheeler' | '4-wheeler' | 'heavy' | 'other';

export interface VehicleRCData {
  make?: string;
  model?: string;
  fuelType?: string;
  color?: string;
  ownerType?: string;
  rtoCode?: string;
  registrationDate?: string;
  vehicleAgeYears?: number;
  fitnessUpto?: string;
  insuranceUpto?: string;
  pucUpto?: string;
  financerName?: string;
  rcStatus?: string;
}

export interface VehicleFormData {
  registrationNumber: string;
  registeredName: string;
  contactInfo: string;
  vehicleType: VehicleType;
  imageFile?: File | null;
  imageUrl?: string;
  rcData?: VehicleRCData;
}

export interface Vehicle extends VehicleFormData {
  id: string;
  userId: string;
  make?: string;
  model?: string;
  fuelType?: string;
  color?: string;
  ownerType?: string;
  rtoCode?: string;
  registrationDate?: string;
  vehicleAgeYears?: number;
  fitnessUpto?: string;
  insuranceUpto?: string;
  pucUpto?: string;
  financerName?: string;
  rcStatus?: string;
  apiLastFetchedAt?: string;
  createdAt?: string;
}

export interface TenantDetails {
  moveInDate: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  flatNumber: string;
  floorNumber?: string;
  phone?: string;
  alternatePhone?: string;
  residentType?: ResidentType;
  isRegularPayer?: boolean;
  tenantDetails?: TenantDetails;
  vehicles?: Vehicle[];
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
