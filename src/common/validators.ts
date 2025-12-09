import { PaginationArgs, PaginationParams } from '../types/pagination';
import { UserInputError } from 'apollo-server-express';
import { ERROR_MESSAGES } from './error-messages';

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
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.PAGE_POSITIVE);
  }

  if (!isPositiveInteger(pageSize)) {
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.PAGESIZE_POSITIVE);
  }

  if (pageSize > 100) {
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.PAGESIZE_MAX);
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
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.DATE_FORMAT(fieldName));
  }
}

export function requireNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.FIELD_REQUIRED(fieldName));
  }
  return value.trim();
}

export function requireEmail(value: unknown, fieldName: string): string {
  const email = requireNonEmptyString(value, fieldName);
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.EMAIL_INVALID(fieldName));
  }
  return email;
}

export function requirePositiveInt(value: unknown, fieldName: string): number {
  if (!isPositiveInteger(value)) {
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.POSITIVE_INT(fieldName));
  }
  return value;
}

export function requirePositiveIntFromString(value: string, fieldName: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.POSITIVE_INT(fieldName));
  }
  return parsed;
}

export function requirePositiveNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.POSITIVE_NUMBER(fieldName));
  }
  return value;
}

export function requireRoleValue(value: unknown): 'PROPIETARIO' | 'VIAJERO' {
  if (value !== 'PROPIETARIO' && value !== 'VIAJERO') {
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.ROLE_INVALID);
  }
  return value;
}

export function requireBookingStatus(
  value: unknown,
): 'PENDING' | 'CONFIRMED' | 'CANCELLED' {
  if (value !== 'PENDING' && value !== 'CONFIRMED' && value !== 'CANCELLED') {
    throw new UserInputError(ERROR_MESSAGES.VALIDATION.BOOKING_STATUS_INVALID);
  }
  return value;
}
