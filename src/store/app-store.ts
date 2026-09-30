import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockProperties } from '../data/properties';
import { schools as demoSchools } from '../data/schools';
import { InspectionRequest, Property, Report, Review, School, VerificationStatus } from '../types';

const webStorage = {
  getItem: async (name: string) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    return window.localStorage.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(name);
    }
  },
};

const memoryStorage = new Map<string, string>();

const nativeStorage = {
  getItem: async (name: string) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return memoryStorage.get(name) ?? null;
    }
  },
  setItem: async (name: string, value: string) => {
    memoryStorage.set(name, value);

    try {
      await AsyncStorage.setItem(name, value);
    } catch {
    }
  },
  removeItem: async (name: string) => {
    memoryStorage.delete(name);

    try {
      await AsyncStorage.removeItem(name);
    } catch {
    }
  },
};

const safeStorage = () => {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    return webStorage;
  }

  return nativeStorage;
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'provider' | 'admin';
}

interface ProviderApprovalItem {
  id: string;
  name: string;
  type: 'Provider' | 'Listing';
  status: string;
  location?: string;
  school?: string;
  distance?: string;
  drivingTime?: string;
  facilities?: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  role: string;
  status: string;
  email?: string;
  school?: string;
  matricNumber?: string;
  registeredAt?: string;
  verifiedAt?: string;
}

interface AppState {
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  schools: School[];
  setSchools: (schools: School[]) => void;
  selectedSchool: School | null;
  setSelectedSchool: (school: School) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  guestMode: boolean;
  setGuestMode: (value: boolean) => void;
  authUser: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  studentVerificationStatus: VerificationStatus;
  setStudentVerificationStatus: (status: VerificationStatus) => void;
  inspectionRequests: InspectionRequest[];
  addInspectionRequest: (request: InspectionRequest) => void;
  updateInspectionRequest: (id: string, updates: Partial<InspectionRequest>) => void;
  reviews: Review[];
  addReview: (review: Review) => void;
  reports: Report[];
  addReport: (report: Report) => void;
  providerProperties: Property[];
  addProviderProperty: (property: Property) => void;
  updateProviderProperty: (id: string, updates: Partial<Property>) => void;
  providerPropertyDraft: Property | null;
  setProviderPropertyDraft: (property: Property | null) => void;
  availabilitySchedule: Record<string, { available: boolean; from: string; to: string }>;
  setAvailabilitySchedule: (schedule: Record<string, { available: boolean; from: string; to: string }>) => void;
  adminApprovals: ProviderApprovalItem[];
  approveApproval: (id: string) => void;
  updateApprovalStatus: (id: string, status: string) => void;
  adminUsers: AdminUser[];
  updateAdminUserStatus: (id: string, status: string) => void;
}

const demoProviderProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Emerald Student Lodge',
    description: 'Modern student accommodation close to campus with good security, dedicated water supply, and study-friendly rooms.',
    propertyType: 'Self-contained',
    price: 450000,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=80',
    ],
    location: {
      address: 'Ajegunle, Lagos',
      city: 'Lagos',
      state: 'Lagos State',
      latitude: 6.4969,
      longitude: 3.3343,
    },
    amenities: ['Water', 'Electricity', 'Security', 'Wi-Fi', 'Kitchen', 'Furnished'],
    availability: 'AVAILABLE',
    verificationStatus: 'VERIFIED',
    provider: { id: 'prov-1', name: 'Olivia Homes', isVerified: true, phone: '+2348012345678' },
    inspectionAvailable: true,
    createdAt: '2026-09-10',
  },
  {
    id: 'prop-2',
    title: 'Akoka Serenity House',
    description: 'Well-maintained apartment near the campus with shared lounge and easy access to transport.',
    propertyType: 'Room & Parlour',
    price: 360000,
    images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80'],
    location: {
      address: 'Akoka, Lagos',
      city: 'Lagos',
      state: 'Lagos State',
      latitude: 6.5187,
      longitude: 3.3856,
    },
    amenities: ['Water', 'Electricity', 'Wi-Fi', 'Parking', 'Security'],
    availability: 'AVAILABLE',
    verificationStatus: 'PENDING',
    provider: { id: 'prov-2', name: 'Akoka Living', isVerified: false, phone: '+2348034567890' },
    inspectionAvailable: true,
    createdAt: '2026-09-12',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      properties: mockProperties,
      schools: demoSchools,
      selectedSchool: null,
      searchQuery: '',
      guestMode: true,
      authUser: null,
      studentVerificationStatus: 'PENDING',
      inspectionRequests: [
        {
          id: 'inspection-1',
          propertyId: 'prop-1',
          propertyName: 'Emerald Student Lodge',
          requestedDate: 'Saturday, 28 September 2026',
          requestedTime: '2:00 PM',
          message: 'I would like to inspect this property.',
          status: 'Confirmed',
          providerResponse: 'Inspection confirmed for the selected time.',
          accepted: false,
          proceedStatus: 'Provider confirmation',
        },
      ],
      reviews: [
        {
          id: 'review-1',
          propertyId: 'prop-1',
          rating: 5,
          comment: 'Very clean and secure. The inspection was smooth and transparent.',
          createdAt: '2026-09-20',
        },
      ],
      reports: [
        {
          id: 'report-1',
          propertyId: 'prop-2',
          reason: 'Misleading listing',
          description: 'The property was advertised as furnished, but the photos did not match the room condition.',
          createdAt: '2026-09-18',
        },
      ],
      providerProperties: demoProviderProperties,
      providerPropertyDraft: null,
      availabilitySchedule: {
        Monday: { available: true, from: '10:00 AM', to: '02:00 PM' },
        Tuesday: { available: false, from: '10:00 AM', to: '02:00 PM' },
        Wednesday: { available: true, from: '10:00 AM', to: '02:00 PM' },
        Thursday: { available: false, from: '10:00 AM', to: '02:00 PM' },
        Friday: { available: false, from: '10:00 AM', to: '02:00 PM' },
        Saturday: { available: false, from: '10:00 AM', to: '02:00 PM' },
        Sunday: { available: false, from: '10:00 AM', to: '02:00 PM' },
      },
      adminApprovals: [
        { id: 'approval-1', name: 'Sunrise Lodge', type: 'Listing', status: 'Pending verification', location: 'Adebayo Ogunleye, Ikeja, Lagos', school: 'University of Lagos', distance: '2.4 km', drivingTime: '12 min', facilities: ['Borehole', 'Electricity', 'Pre-Paid Meter', 'Wi-Fi'] },
        { id: 'approval-2', name: 'Urban Nest Homes', type: 'Provider', status: 'Awaiting documents', location: 'Ikeja, Lagos' },
        { id: 'approval-3', name: 'Fresh Lodge', type: 'Provider', status: 'Reviewing compliance', location: 'Yaba, Lagos' },
        { id: 'approval-4', name: 'Yabatech Residency', type: 'Listing', status: 'Pending verification', location: 'Yaba, Lagos', school: 'Yaba College of Technology' },
      ],
      adminUsers: [
        { id: 'user-1', name: 'John Doe', role: 'Student', status: 'Verified', email: 'john.doe@gmail.com', school: 'University of Lagos', matricNumber: '20501051909', registeredAt: '12 Aug 2024', verifiedAt: '14 Aug 2024' },
        { id: 'user-2', name: 'Amina Mohammed', role: 'Student', status: 'Pending', email: 'amina.m@gmail.com', school: 'Lagos State University', matricNumber: '20501051909', registeredAt: '12 Sep 2024' },
        { id: 'user-3', name: 'Tunde Oladipo', role: 'Student', status: 'Requires Correction', email: 'tunde.o@gmail.com', school: 'Lagos State Polytechnic', matricNumber: '20501051909', registeredAt: '14 Sep 2024' },
        { id: 'user-4', name: 'Esther Lily', role: 'Student', status: 'Verification Issue', email: 'esther.l@gmail.com', school: 'Lagos State Polytechnic', matricNumber: '20501051909', registeredAt: '12 Sep 2024' },
        { id: 'user-5', name: 'Ibrahim Kabir', role: 'Student', status: 'Suspended', email: 'ibrahim.k@gmail.com', school: 'Lagos State Polytechnic', matricNumber: '20501051909', registeredAt: '12 Sep 2024' },
        { id: 'user-6', name: 'Olivia Homes', role: 'Provider', status: 'Verified', email: 'olivia@homes.ng', registeredAt: '20 Aug 2024', verifiedAt: '22 Aug 2024' },
        { id: 'user-7', name: 'System Admin', role: 'Admin', status: 'Online', email: 'admin@hostelfinder.ng' },
      ],
      setProperties: (properties) => set({ properties }),
      setSchools: (schools) =>
        set((state) => {
          const normalizeName = (name: string) => name.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();
          const selectedName = state.selectedSchool ? normalizeName(state.selectedSchool.name) : '';
          const selectedSchool = selectedName
            ? schools.find((school) => {
                const schoolName = normalizeName(school.name);
                return schoolName.includes(selectedName) || selectedName.includes(schoolName);
              })
            : schools.find((school) => /university of lagos/i.test(school.name)) ?? schools[0];

          return { schools, selectedSchool: selectedSchool ?? state.selectedSchool };
        }),
      setSelectedSchool: (school) => set({ selectedSchool: school }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setGuestMode: (value) => set({ guestMode: value }),
      login: (user) => set({ authUser: user, guestMode: false }),
      logout: () => set({ authUser: null, guestMode: true, searchQuery: '', selectedSchool: null }),
      setStudentVerificationStatus: (status) => set({ studentVerificationStatus: status }),
      addInspectionRequest: (request) => set((state) => ({ inspectionRequests: [request, ...state.inspectionRequests] })),
      updateInspectionRequest: (id, updates) =>
        set((state) => ({
          inspectionRequests: state.inspectionRequests.map((request) =>
            request.id === id ? { ...request, ...updates } : request,
          ),
        })),
      addReview: (review) => set((state) => ({ reviews: [review, ...state.reviews] })),
      addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
      addProviderProperty: (property) =>
        set((state) => ({ providerProperties: [property, ...state.providerProperties] })),
      updateProviderProperty: (id, updates) =>
        set((state) => ({
          providerProperties: state.providerProperties.map((property) =>
            property.id === id ? { ...property, ...updates } : property,
          ),
        })),
      setProviderPropertyDraft: (property) => set({ providerPropertyDraft: property }),
      setAvailabilitySchedule: (availabilitySchedule) => set({ availabilitySchedule }),
      approveApproval: (id) =>
        set((state) => ({
          adminApprovals: state.adminApprovals.map((approval) => approval.id === id ? { ...approval, status: 'Approved' } : approval),
        })),
      updateApprovalStatus: (id, status) =>
        set((state) => ({
          adminApprovals: state.adminApprovals.map((approval) => approval.id === id ? { ...approval, status } : approval),
        })),
      updateAdminUserStatus: (id, status) =>
        set((state) => ({
          adminUsers: state.adminUsers.map((user) => user.id === id ? { ...user, status } : user),
        })),
    }),
    {
      name: 'student-hostel-checker-store',
      storage: createJSONStorage(safeStorage),
    },
  ),
);
