import { PaginationArgs, PaginationParams } from '../types/pagination';

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function normalizePagination(
  args: PaginationArgs | undefined,
  defaults?: { page?: number; pageSize?: number },
): PaginationParams {
  const page = args?.page ?? defaults?.page ?? 1;
  const pageSize = args?.pageSize ?? defaults?.pageSize ?? 10;

  if (!isPositiveInteger(page)) {
    throw new Error('El parámetro page debe ser un entero positivo');
  }

  if (!isPositiveInteger(pageSize)) {
    throw new Error('El parámetro pageSize debe ser un entero positivo');
  }

  if (pageSize > 100) {
    throw new Error('pageSize no puede ser mayor a 100');
  }

  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    limit: pageSize,
    offset,
  };
}

export function requireDateString(value: string, fieldName: string): void {
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!isValid) {
    throw new Error('El campo ' + fieldName + ' debe tener formato YYYY-MM-DD');
  }
}

export function requireNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('El campo ' + fieldName + ' es requerido');
  }
  return value.trim();
}

export function requireEmail(value: unknown, fieldName: string): string {
  const email = requireNonEmptyString(value, fieldName);
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('El campo ' + fieldName + ' debe ser un email válido');
  }
  return email;
}

export function requirePositiveInt(value: unknown, fieldName: string): number {
  if (!isPositiveInteger(value)) {
    throw new Error('El campo ' + fieldName + ' debe ser un entero positivo');
  }
  return value;
}

export function requirePositiveIntFromString(value: string, fieldName: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('El campo ' + fieldName + ' debe ser un entero positivo');
  }
  return parsed;
}

export function requirePositiveNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw new Error('El campo ' + fieldName + ' debe ser un número positivo');
  }
  return value;
}

export function requireRoleValue(value: unknown): 'PROPIETARIO' | 'VIAJERO' {
  if (value !== 'PROPIETARIO' && value !== 'VIAJERO') {
    throw new Error('El campo role debe ser PROPIETARIO o VIAJERO');
  }
  return value;
}

export function requireBookingStatus(
  value: unknown,
): 'PENDING' | 'CONFIRMED' | 'CANCELLED' {
  if (value !== 'PENDING' && value !== 'CONFIRMED' && value !== 'CANCELLED') {
    throw new Error('El estado debe ser PENDING, CONFIRMED o CANCELLED');
  }
  return value;
}
