import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AvailabilityStatus, InspectionRequest, Property, PropertyType, School, VerificationStatus } from '../types';

const DEFAULT_API_BASE_URL = 'https://hostelfinderbe.onrender.com';
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

type ApiRecord = Record<string, unknown>;
type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly details?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'provider' | 'admin';
  verificationStatus: VerificationStatus;
}

export interface AuthResult {
  user: ApiUser;
  token?: string;
  nextStep?: string;
}

export interface PropertySearchFilters {
  minPrice?: number;
  maxPrice?: number;
  schoolId?: string;
  maxDistanceKm?: number;
  amenities?: string[];
  propertyType?: string;
  availability?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ApiSlot {
  id: string;
  propertyId: string;
  start: string;
  end: string;
  status: string;
}

let activeToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;
const TOKEN_KEY = 'ochf-access-token';

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function unwrap(value: unknown): unknown {
  if (!isRecord(value)) return value;
  return value.data ?? value.result ?? value;
}

function records(value: unknown, keys: string[]): unknown[] {
  const unwrapped = unwrap(value);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (!isRecord(unwrapped)) return [];
  for (const key of keys) {
    if (Array.isArray(unwrapped[key])) return unwrapped[key] as unknown[];
  }
  return [];
}

async function readToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function writeToken(token: string | null): Promise<void> {
  activeToken = token;
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      else window.localStorage.removeItem(TOKEN_KEY);
    }
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function clearApiToken(): Promise<void> {
  await writeToken(null);
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export async function restoreApiSession(): Promise<ApiUser | null> {
  activeToken = await readToken();
  if (!activeToken) return null;
  return fetchCurrentAccount();
}

async function request<T = unknown>(path: string, method: ApiMethod = 'GET', body?: unknown): Promise<T> {
  if (!activeToken) activeToken = await readToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (activeToken) headers.Authorization = `Bearer ${activeToken}`;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body as FormData : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.message === 'string'
      ? payload.message
      : typeof payload === 'string' && payload.trim()
        ? payload
        : `Request failed (${response.status})`;
    if (response.status === 401) {
      await clearApiToken();
      unauthorizedHandler?.();
    }
    throw new ApiError(message, response.status, payload);
  }
  return payload as T;
}

function mapRole(value: unknown): ApiUser['role'] {
  const role = asString(value).toLowerCase();
  return role === 'provider' || role === 'admin' ? role : 'student';
}

function mapApiUser(value: unknown, fallback: Partial<ApiUser> = {}): ApiUser {
  const user = isRecord(value) ? value : {};
  const status = asString(user.verificationStatus, asString(user.studentVerificationStatus)).toLowerCase();
  return {
    id: asString(user._id, asString(user.id, fallback.id ?? '')),
    name: asString(user.fullName, asString(user.name, asString(user.businessName, fallback.name ?? ''))),
    email: asString(user.email, fallback.email ?? ''),
    role: mapRole(user.role ?? fallback.role),
    verificationStatus: status === 'verified' ? 'VERIFIED' : status === 'rejected' ? 'REJECTED' : 'PENDING',
  };
}

function authResult(payload: unknown, fallback: Partial<ApiUser>): AuthResult {
  const root = isRecord(payload) ? payload : {};
  const data = isRecord(root.data) ? root.data : root;
  const token = asString(data.token, asString(data.accessToken, asString(data.jwt)));
  const userData = data.user ?? data.account ?? data;
  return {
    user: mapApiUser(userData, fallback),
    token: token || undefined,
    nextStep: asString(data.nextStep) || undefined,
  };
}

export async function authenticate(email: string, password: string, role: ApiUser['role']): Promise<AuthResult> {
  const payload = await request('/auth/login', 'POST', { email, password });
  const result = authResult(payload, { email, role });
  if (!result.token) throw new ApiError('The server response did not include an access token.', 502, payload);
  await writeToken(result.token);
  return result;
}

export async function registerStudent(input: {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  schoolId: string;
}): Promise<AuthResult> {
  const payload = await request('/auth/register', 'POST', { ...input, role: 'student' });
  const result = authResult(payload, { email: input.email, name: input.fullName, role: 'student' });
  if (result.token) await writeToken(result.token);
  return result;
}

export async function registerProvider(input: {
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  phone: string;
}): Promise<AuthResult> {
  const payload = await request('/auth/register', 'POST', { ...input, role: 'provider' });
  const result = authResult(payload, { email: input.email, name: input.businessName, role: 'provider' });
  if (result.token) await writeToken(result.token);
  return result;
}

export async function sendStudentOtp(): Promise<unknown> {
  return request('/auth/otp/send', 'POST');
}

export async function resendStudentOtp(): Promise<unknown> {
  return request('/auth/otp/resend', 'POST');
}

export async function verifyStudentOtp(code: string): Promise<unknown> {
  return request('/auth/otp/verify', 'POST', { code });
}

export async function fetchCurrentAccount(): Promise<ApiUser> {
  const payload = await request('/auth/me');
  return mapApiUser(unwrap(payload));
}

function mapSchool(value: unknown): School | null {
  if (!isRecord(value)) return null;
  const location = isRecord(value.location) ? value.location : {};
  const coordinates = Array.isArray(location.coordinates) ? location.coordinates : [];
  const id = asString(value._id, asString(value.id));
  if (!id || !asString(value.name)) return null;
  return {
    id,
    name: asString(value.name),
    campus: asString(value.campus, asString(value.name)),
    city: asString(value.city, asString(location.city)),
    state: asString(value.state, asString(location.state)),
    latitude: asNumber(value.latitude, asNumber(coordinates[1])),
    longitude: asNumber(value.longitude, asNumber(coordinates[0])),
  };
}

function mapPropertyType(value: unknown): PropertyType {
  const rawType = Array.isArray(value) ? value[0] : value;
  const type = asString(rawType).toLowerCase();
  const knownTypes: Record<string, PropertyType> = {
    self_contain: 'Self-contained',
    self_contained: 'Self-contained',
    room_and_parlour: 'Room & Parlour',
    shared_apartment: 'Shared Apartment',
    hostel: 'Hostel',
    apartment: 'Apartment',
  };
  return knownTypes[type] ?? (type ? (type as PropertyType) : 'Apartment');
}

function mapProperty(value: unknown): Property | null {
  if (!isRecord(value)) return null;
  const location = isRecord(value.location) ? value.location : {};
  const coordinates = Array.isArray(location.coordinates) ? location.coordinates : [];
  const provider = isRecord(value.providerId)
    ? value.providerId
    : isRecord(value.provider)
      ? value.provider
      : {};
  const school = isRecord(value.schoolId) ? value.schoolId : null;
  const rawPhotos = Array.isArray(value.photos) ? value.photos : [];
  const images = rawPhotos.flatMap((photo) => {
    if (typeof photo === 'string') return [photo];
    if (isRecord(photo) && typeof photo.url === 'string') return [photo.url];
    return [];
  });
  const coverPhoto = asString(value.coverPhoto);
  const rawVerification = asString(value.verificationStatus).toLowerCase();
  const verificationStatus: VerificationStatus = rawVerification === 'verified'
    ? 'VERIFIED'
    : rawVerification === 'rejected'
      ? 'REJECTED'
      : 'PENDING';
  const rawAvailability = asString(value.availabilityStatus).toUpperCase();
  const availability: AvailabilityStatus = rawAvailability === 'AVAILABLE' || rawAvailability === 'BOOKED'
    ? rawAvailability
    : 'UNAVAILABLE';
  const id = asString(value._id, asString(value.id));
  if (!id || !asString(value.title)) return null;

  return {
    id,
    schoolId: asString(school?._id, asString(school?.id, asString(value.schoolId))) || undefined,
    title: asString(value.title),
    description: asString(value.description),
    propertyType: mapPropertyType(value.propertyType),
    price: asNumber(value.price),
    images: [...new Set([coverPhoto, ...images].filter(Boolean))],
    location: {
      address: asString(value.address, asString(location.address)),
      city: asString(value.city, asString(location.city)),
      state: asString(value.state, asString(location.state)),
      latitude: asNumber(value.latitude, asNumber(coordinates[1])),
      longitude: asNumber(value.longitude, asNumber(coordinates[0])),
    },
    amenities: Array.isArray(value.amenities) ? value.amenities.filter((item): item is string => typeof item === 'string') : [],
    availability,
    verificationStatus,
    provider: {
      id: asString(provider._id, asString(provider.id, asString(value.providerId))),
      name: asString(provider.businessName, asString(provider.name)),
      isVerified: asString(provider.verificationStatus).toLowerCase() === 'verified',
      phone: asString(provider.phone),
    },
    inspectionAvailable: availability === 'AVAILABLE',
    createdAt: asString(value.createdAt),
  };
}

function propertyList(payload: unknown): Property[] {
  return records(payload, ['properties', 'items']).map(mapProperty).filter((item): item is Property => item !== null);
}

function queryString(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function fetchProperties(filters: PropertySearchFilters = {}): Promise<Property[]> {
  const query = queryString({
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    schoolId: filters.schoolId,
    maxDistanceKm: filters.maxDistanceKm,
    amenities: filters.amenities?.join(','),
    propertyType: filters.propertyType,
    availability: filters.availability,
    sort: filters.sort,
    page: filters.page ?? 1,
    limit: filters.limit ?? 100,
  });
  return propertyList(await request(`/properties${query}`));
}

export async function fetchPropertyById(id: string, schoolId?: string): Promise<Property> {
  const query = queryString({ schoolId });
  const payload = unwrap(await request(`/properties/${encodeURIComponent(id)}${query}`));
  const record = isRecord(payload) ? payload.property ?? payload : payload;
  const property = mapProperty(record);
  if (!property) throw new ApiError('The server returned an invalid property.', 502, payload);
  return property;
}

export async function fetchSchools(search = ''): Promise<School[]> {
  const payload = await request(`/schools${queryString({ q: search })}`);
  return records(payload, ['schools', 'items']).map(mapSchool).filter((item): item is School => item !== null);
}

export async function fetchSchoolById(id: string): Promise<School> {
  const payload = unwrap(await request(`/schools/${encodeURIComponent(id)}`));
  const school = mapSchool(isRecord(payload) ? payload.school ?? payload : payload);
  if (!school) throw new ApiError('The server returned an invalid school.', 502, payload);
  return school;
}

export async function createProperty(payload: ApiRecord): Promise<Property | null> {
  const result = unwrap(await request('/properties', 'POST', payload));
  if (!isRecord(result)) return null;
  const property = mapProperty(isRecord(result) ? result.property ?? result : result);
  return property;
}

export async function fetchMyProperties(): Promise<Property[]> {
  return propertyList(await request('/properties/mine'));
}

export async function updateProperty(id: string, payload: ApiRecord): Promise<Property | null> {
  const result = unwrap(await request(`/properties/${encodeURIComponent(id)}`, 'PUT', payload));
  if (!isRecord(result)) return null;
  const property = mapProperty(isRecord(result) ? result.property ?? result : result);
  return property;
}

export async function deleteProperty(id: string): Promise<void> {
  await request(`/properties/${encodeURIComponent(id)}`, 'DELETE');
}

function mapSlot(value: unknown): ApiSlot | null {
  if (!isRecord(value)) return null;
  const id = asString(value._id, asString(value.id));
  const property = isRecord(value.propertyId) ? value.propertyId : {};
  const propertyId = asString(property._id, asString(property.id, asString(value.propertyId)));
  const start = asString(value.start, asString(value.startsAt, asString(value.startAt)));
  const end = asString(value.end, asString(value.endsAt, asString(value.endAt)));
  return id && start && end ? { id, propertyId, start, end, status: asString(value.status, 'open') } : null;
}

export async function createInspectionSlots(propertyId: string, windows: { start: string; end: string }[], slotMinutes = 30): Promise<unknown> {
  return request('/slots', 'POST', { propertyId, slotMinutes, windows });
}

export async function fetchMySlots(): Promise<ApiSlot[]> {
  return records(await request('/slots/mine'), ['slots', 'items']).map(mapSlot).filter((slot): slot is ApiSlot => slot !== null);
}

export async function fetchOpenSlots(propertyId: string): Promise<ApiSlot[]> {
  return records(await request(`/slots/property/${encodeURIComponent(propertyId)}`), ['slots', 'items']).map(mapSlot).filter((slot): slot is ApiSlot => slot !== null);
}

export async function deleteInspectionSlot(id: string): Promise<void> {
  await request(`/slots/${encodeURIComponent(id)}`, 'DELETE');
}

function mapInspection(value: unknown): InspectionRequest | null {
  if (!isRecord(value)) return null;
  const property = isRecord(value.propertyId) ? value.propertyId : {};
  const scheduledAt = asString(value.scheduledAt);
  const date = scheduledAt ? new Date(scheduledAt) : null;
  const propertyId = asString(property._id, asString(property.id, asString(value.propertyId)));
  const id = asString(value._id, asString(value.id));
  if (!id || !propertyId) return null;
  const status = asString(value.status, 'requested').toLowerCase();
  const displayStatus = status === 'confirmed' ? 'Confirmed' : status === 'rescheduled' ? 'Rescheduled' : status === 'rejected' ? 'Rejected' : status === 'declined' ? 'Declined' : status === 'completed' ? 'Completed' : status === 'cancelled' ? 'Cancelled' : 'Pending';
  return {
    id,
    propertyId,
    propertyName: asString(property.title, asString(value.propertyName, 'Property')),
    scheduledAt: scheduledAt || undefined,
    requestedDate: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : asString(value.requestedDate),
    requestedTime: date && !Number.isNaN(date.getTime()) ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : asString(value.requestedTime),
    message: asString(value.message),
    status: displayStatus,
    providerResponse: asString(value.reason),
    accepted: asString(value.decision).toLowerCase() === 'accepted',
    proceedStatus: displayStatus === 'Completed' ? 'Inspection completed' : 'Provider confirmation',
  };
}

function inspectionList(payload: unknown): InspectionRequest[] {
  return records(payload, ['inspections', 'items']).map(mapInspection).filter((item): item is InspectionRequest => item !== null);
}

export async function bookInspection(propertyId: string, scheduledAt: string): Promise<InspectionRequest> {
  const payload = unwrap(await request('/inspections', 'POST', { propertyId, scheduledAt }));
  const inspection = mapInspection(isRecord(payload) ? payload.inspection ?? payload : payload);
  if (!inspection) throw new ApiError('The server returned an invalid inspection booking.', 502, payload);
  return inspection;
}

export async function fetchMyInspections(): Promise<InspectionRequest[]> {
  return inspectionList(await request('/inspections/mine'));
}

export async function fetchReceivedInspections(): Promise<InspectionRequest[]> {
  return inspectionList(await request('/inspections/received'));
}

export async function updateInspection(id: string, action: 'schedule' | 'decline' | 'reschedule' | 'complete' | 'missed', body?: ApiRecord): Promise<unknown> {
  return request(`/inspections/${encodeURIComponent(id)}/${action}`, 'PUT', body);
}

export async function decideInspection(id: string, decision: 'accepted' | 'rejected', reason?: string): Promise<unknown> {
  return request(`/inspections/${encodeURIComponent(id)}/decision`, 'PUT', { decision, ...(reason ? { reason } : {}) });
}

export async function cancelInspection(id: string): Promise<void> {
  await request(`/inspections/${encodeURIComponent(id)}`, 'DELETE');
}

export async function createReview(payload: { propertyId: string; rating: number; comment: string }): Promise<unknown> {
  return request('/reviews', 'POST', payload);
}

export async function fetchPropertyReviews(propertyId: string): Promise<unknown[]> {
  return records(await request(`/reviews/property/${encodeURIComponent(propertyId)}`), ['reviews', 'items']);
}

export async function fetchMyReviews(): Promise<unknown[]> {
  return records(await request('/reviews/mine'), ['reviews', 'items']);
}

export async function createReport(payload: { propertyId: string; reason: string }): Promise<unknown> {
  return request('/reports', 'POST', payload);
}

export async function fetchMyReports(): Promise<unknown[]> {
  return records(await request('/reports/mine'), ['reports', 'items']);
}

export async function fetchTransactions(role: 'student' | 'provider'): Promise<unknown[]> {
  return records(await request(role === 'provider' ? '/transactions/received' : '/transactions/mine'), ['transactions', 'items']);
}

export async function updateTransactionStatus(id: string, status: string): Promise<unknown> {
  return request(`/transactions/${encodeURIComponent(id)}/status`, 'PUT', { status });
}

export async function fetchAdminUsers(filters: { role?: string; status?: string; q?: string } = {}): Promise<unknown[]> {
  return records(await request(`/admin/users${queryString(filters)}`), ['users', 'items']);
}

export async function updateAdminUserStatus(id: string, status: string): Promise<unknown> {
  return request(`/admin/users/${encodeURIComponent(id)}/status`, 'PUT', { status });
}

export async function fetchAdminQueue(kind: 'students' | 'providers' | 'properties', status = 'pending'): Promise<unknown[]> {
  return records(await request(`/admin/${kind}${queryString({ status })}`), [kind, 'items', 'queue']);
}

export async function fetchAdminProperties(status?: string): Promise<Property[]> {
  return propertyList(await request(`/admin/properties${queryString({ status })}`));
}

export async function reviewAdminQueueItem(kind: 'students' | 'providers' | 'properties', id: string, status: string, reason?: string): Promise<unknown> {
  return request(`/admin/${kind}/${encodeURIComponent(id)}`, 'PUT', { status, ...(reason ? { reason } : {}) });
}

export async function fetchAdminReports(status = 'open'): Promise<unknown[]> {
  return records(await request(`/admin/reports${queryString({ status })}`), ['reports', 'items']);
}

export async function updateAdminReport(id: string, status: 'reviewed' | 'resolved'): Promise<unknown> {
  return request(`/admin/reports/${encodeURIComponent(id)}`, 'PUT', { status });
}

export async function fetchAdminInspections(status = 'confirmed'): Promise<InspectionRequest[]> {
  return inspectionList(await request(`/admin/inspections${queryString({ status })}`));
}

export async function updateAdminInspection(id: string, status: 'confirmed' | 'rejected'): Promise<unknown> {
  return request(`/admin/inspections/${encodeURIComponent(id)}`, 'PUT', { status });
}

export async function sendSystemAnnouncement(userId: string, title: string, body: string): Promise<unknown> {
  return request('/notifications/announce', 'POST', { userId, title, body });
}

export async function sendAdminTestEmail(to: string): Promise<unknown> {
  return request('/notifications/test', 'POST', { to });
}