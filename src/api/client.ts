import { mockProperties } from '../data/properties';
import { schools as demoSchools } from '../data/schools';
import { AvailabilityStatus, Property, PropertyType, School, VerificationStatus } from '../types';

export const API_BASE_URL = 'https://capstone-project-be-oeov.onrender.com';

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const responseText = await response.text();
  let body: unknown;

  try {
    body = responseText ? JSON.parse(responseText) : null;
  } catch {
    body = responseText;
  }

  if (!response.ok) {
    const message = isRecord(body) && typeof body.message === 'string' ? body.message : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body as T;
}

function mapSchool(value: unknown): School | null {
  if (!isRecord(value)) return null;

  const name = asString(value.name, 'School');
  const id = asString(value._id, asString(value.id));
  const location = isRecord(value.location) ? value.location : {};
  const coordinates = Array.isArray(location.coordinates) ? location.coordinates : [];
  const knownSchool = demoSchools.find((school) =>
    name.toLowerCase().includes(school.name.toLowerCase()) || school.name.toLowerCase().includes(name.toLowerCase()),
  );

  return {
    id,
    name,
    campus: knownSchool?.campus ?? name,
    city: knownSchool?.city ?? '',
    state: knownSchool?.state ?? '',
    longitude: asNumber(coordinates[0]),
    latitude: asNumber(coordinates[1]),
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
  const rawPhotos = Array.isArray(value.photos) ? value.photos : [];
  const photos = rawPhotos.flatMap((photo) => {
    if (typeof photo === 'string') return [photo];
    if (isRecord(photo) && typeof photo.url === 'string') return [photo.url];
    return [];
  });
  const coverPhoto = asString(value.coverPhoto);
  const images = [...new Set([coverPhoto, ...photos].filter(Boolean))];
  const verificationStatus: VerificationStatus = asString(value.verificationStatus).toLowerCase() === 'verified'
    ? 'VERIFIED'
    : asString(value.verificationStatus).toLowerCase() === 'rejected'
      ? 'REJECTED'
      : 'PENDING';
  const rawAvailability = asString(value.availabilityStatus).toUpperCase();
  const availability: AvailabilityStatus = rawAvailability === 'BOOKED' || rawAvailability === 'UNAVAILABLE'
    ? rawAvailability
    : 'AVAILABLE';
  const providerVerification = asString(provider.verificationStatus).toLowerCase() === 'verified';

  return {
    id: asString(value._id, asString(value.id)),
    schoolId: asString(value.schoolId) || undefined,
    title: asString(value.title, 'Student accommodation'),
    description: asString(value.description, 'Contact the provider for more details about this property.'),
    propertyType: mapPropertyType(value.propertyType),
    price: asNumber(value.price),
    images: images.length > 0 ? images : mockProperties[0].images,
    location: {
      address: asString(value.address, asString(location.address)),
      city: asString(location.city),
      state: asString(location.state),
      latitude: asNumber(coordinates[1], asNumber(value.latitude)),
      longitude: asNumber(coordinates[0], asNumber(value.longitude)),
    },
    amenities: Array.isArray(value.amenities) ? value.amenities.filter((item): item is string => typeof item === 'string') : [],
    availability,
    verificationStatus,
    provider: {
      id: asString(provider._id, asString(provider.id)),
      name: asString(provider.businessName, asString(provider.name, 'Property provider')),
      isVerified: providerVerification,
      phone: asString(provider.phone),
    },
    inspectionAvailable: availability === 'AVAILABLE',
    createdAt: asString(value.createdAt, new Date().toISOString()),
  };
}

export async function fetchProperties(): Promise<Property[]> {
  const response = await getJson<{ properties?: unknown }>('/properties?page=1&limit=100');
  return Array.isArray(response.properties)
    ? response.properties.map(mapProperty).filter((property): property is Property => property !== null)
    : [];
}

export async function fetchSchools(): Promise<School[]> {
  const response = await getJson<{ schools?: unknown }>('/schools');
  return Array.isArray(response.schools)
    ? response.schools.map(mapSchool).filter((school): school is School => school !== null)
    : [];
}