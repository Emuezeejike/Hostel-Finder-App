import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export type ThemeMode = 'light' | 'dark';

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
}

interface AppState {
  selectedSchool: School | null;
  setSelectedSchool: (school: School) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  guestMode: boolean;
  setGuestMode: (value: boolean) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
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
  adminApprovals: ProviderApprovalItem[];
  approveApproval: (id: string) => void;
  adminUsers: { id: string; name: string; role: string; status: string }[];
}

const demoProviderProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Emerald Student Lodge',
    description: 'Modern student accommodation close to campus with good security, dedicated water supply, and study-friendly rooms.',
    propertyType: 'Self-contained',
    price: 450000,
    additionalCharges: [
      { label: 'Service charge', amount: 50000 },
      { label: 'Legal', amount: 20000 },
      { label: 'Agreement', amount: 10000 },
      { label: 'Security deposit', amount: 50000 },
    ],
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
    additionalCharges: [{ label: 'Service charge', amount: 35000 }],
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
      selectedSchool: null,
      searchQuery: '',
      guestMode: true,
      themeMode: 'light',
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
      adminApprovals: [
        { id: 'approval-1', name: 'Urban Nest Homes', type: 'Provider', status: 'Awaiting documents' },
        { id: 'approval-2', name: 'Fresh Lodge', type: 'Provider', status: 'Reviewing compliance' },
        { id: 'approval-3', name: 'Yabatech Residency', type: 'Listing', status: 'Pending verification' },
      ],
      adminUsers: [
        { id: 'user-1', name: 'Ada Okafor', role: 'Student', status: 'Active' },
        { id: 'user-2', name: 'Olivia Homes', role: 'Provider', status: 'Verified' },
        { id: 'user-3', name: 'System Admin', role: 'Admin', status: 'Online' },
      ],
      setSelectedSchool: (school) => set({ selectedSchool: school }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setGuestMode: (value) => set({ guestMode: value }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleThemeMode: () => set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
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
      approveApproval: (id) =>
        set((state) => ({
          adminApprovals: state.adminApprovals.filter((approval) => approval.id !== id),
        })),
    }),
    {
      name: 'student-hostel-checker-store',
      storage: createJSONStorage(safeStorage),
    },
  ),
);
