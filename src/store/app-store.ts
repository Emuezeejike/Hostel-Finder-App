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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'provider' | 'admin';
  verificationStatus?: VerificationStatus;
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
  email?: string;
  phone?: string;
  verification?: string;
  documents?: string[];
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
  apiError: string;
  setApiError: (message: string) => void;
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
  setInspectionRequests: (requests: InspectionRequest[]) => void;
  addInspectionRequest: (request: InspectionRequest) => void;
  updateInspectionRequest: (id: string, updates: Partial<InspectionRequest>) => void;
  reviews: Review[];
  addReview: (review: Review) => void;
  reports: Report[];
  addReport: (report: Report) => void;
  providerProperties: Property[];
  setProviderProperties: (properties: Property[]) => void;
  addProviderProperty: (property: Property) => void;
  updateProviderProperty: (id: string, updates: Partial<Property>) => void;
  providerPropertyDraft: Property | null;
  setProviderPropertyDraft: (property: Property | null) => void;
  availabilitySchedule: Record<string, { available: boolean; from: string; to: string }>;
  setAvailabilitySchedule: (schedule: Record<string, { available: boolean; from: string; to: string }>) => void;
  adminApprovals: ProviderApprovalItem[];
  setAdminApprovals: (items: ProviderApprovalItem[]) => void;
  approveApproval: (id: string) => void;
  updateApprovalStatus: (id: string, status: string) => void;
  adminUsers: AdminUser[];
  setAdminUsers: (users: AdminUser[]) => void;
  updateAdminUserStatus: (id: string, status: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      properties: [],
      apiError: '',
      schools: [],
      selectedSchool: null,
      searchQuery: '',
      guestMode: true,
      authUser: null,
      studentVerificationStatus: 'PENDING',
      inspectionRequests: [],
      reviews: [],
      reports: [],
      providerProperties: [],
      providerPropertyDraft: null,
      availabilitySchedule: {},
      adminApprovals: [],
      adminUsers: [],
      setProperties: (properties) => set({ properties }),
      setApiError: (apiError) => set({ apiError }),
      setSchools: (schools) =>
        set((state) => {
          const normalizeName = (name: string) => name.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();
          const selectedName = state.selectedSchool ? normalizeName(state.selectedSchool.name) : '';
          const selectedSchool = selectedName
            ? schools.find((school) => {
                const schoolName = normalizeName(school.name);
                return schoolName.includes(selectedName) || selectedName.includes(schoolName);
              })
            : schools[0];

          return { schools, selectedSchool: selectedSchool ?? schools[0] ?? null };
        }),
      setSelectedSchool: (school) => set({ selectedSchool: school }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setGuestMode: (value) => set({ guestMode: value }),
      login: (user) => set({ authUser: user, guestMode: false, studentVerificationStatus: user.verificationStatus ?? 'PENDING' }),
      logout: () => set({ authUser: null, guestMode: true, studentVerificationStatus: 'PENDING', searchQuery: '', selectedSchool: null }),
      setStudentVerificationStatus: (status) => set({ studentVerificationStatus: status }),
        setInspectionRequests: (inspectionRequests) => set({ inspectionRequests }),
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
      setProviderProperties: (providerProperties) => set({ providerProperties }),
      updateProviderProperty: (id, updates) =>
        set((state) => ({
          providerProperties: state.providerProperties.map((property) =>
            property.id === id ? { ...property, ...updates } : property,
          ),
        })),
      setProviderPropertyDraft: (property) => set({ providerPropertyDraft: property }),
      setAvailabilitySchedule: (availabilitySchedule) => set({ availabilitySchedule }),
      setAdminApprovals: (adminApprovals) => set({ adminApprovals }),
      setAdminUsers: (adminUsers) => set({ adminUsers }),
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
      version: 2,
      migrate: (persistedState) => ({
        ...(persistedState as AppState),
        properties: [],
        apiError: '',
        schools: [],
        inspectionRequests: [],
        reviews: [],
        reports: [],
        providerProperties: [],
        adminApprovals: [],
        adminUsers: [],
      }),
      partialize: (state) => ({
        selectedSchool: state.selectedSchool,
        availabilitySchedule: state.availabilitySchedule,
        searchQuery: state.searchQuery,
      }),
    },
  ),
);
