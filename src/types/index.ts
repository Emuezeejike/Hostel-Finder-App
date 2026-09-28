export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AvailabilityStatus = 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
export type PropertyType =
  | 'Self-contained'
  | 'Room & Parlour'
  | 'Shared Apartment'
  | 'Hostel'
  | 'Apartment';

export type InspectionStatus = 'Pending' | 'Confirmed' | 'Declined' | 'Completed' | 'Cancelled';
export type ProceedStatus = 'Inspection completed' | 'Property accepted' | 'Proceeding' | 'Provider confirmation' | 'Completed';

export interface School {
  id: string;
  name: string;
  campus: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface Provider {
  id: string;
  name: string;
  isVerified: boolean;
  phone: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  price: number;
  images: string[];
  location: {
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  amenities: string[];
  availability: AvailabilityStatus;
  verificationStatus: VerificationStatus;
  provider: Provider;
  inspectionAvailable: boolean;
  createdAt: string;
}

export interface InspectionRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  requestedDate: string;
  requestedTime: string;
  message: string;
  status: InspectionStatus;
  providerResponse: string;
  accepted: boolean;
  proceedStatus: ProceedStatus;
}

export interface Review {
  id: string;
  propertyId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Report {
  id: string;
  propertyId: string;
  reason: string;
  description: string;
  createdAt: string;
}
