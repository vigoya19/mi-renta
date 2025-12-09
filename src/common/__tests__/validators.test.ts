import {
  normalizePagination,
  requireDateString,
  requireEmail,
  requirePositiveInt,
  requirePositiveIntFromString,
  requirePositiveNumber,
} from '../validators';

describe('validators', () => {
  test('normalizePagination returns defaults when undefined', () => {
    const result = normalizePagination(undefined);
    expect(result).toEqual({
      page: 1,
      pageSize: 10,
      limit: 10,
      offset: 0,
    });
  });

  test('normalizePagination validates bounds', () => {
    expect(() => normalizePagination({ page: 0, pageSize: 10 })).toThrow();
    expect(() => normalizePagination({ page: 1, pageSize: 101 })).toThrow();
  });

  test('requireDateString accepts YYYY-MM-DD and rejects others', () => {
    expect(() => requireDateString('2024-01-01', 'start')).not.toThrow();
    expect(() => requireDateString('01-01-2024', 'start')).toThrow();
  });

  test('requireEmail validates email format', () => {
    expect(() => requireEmail('user@example.com', 'email')).not.toThrow();
    expect(() => requireEmail('invalid', 'email')).toThrow();
  });

  test('requirePositiveInt and requirePositiveIntFromString', () => {
    expect(requirePositiveInt(5, 'count')).toBe(5);
    expect(() => requirePositiveInt(-1, 'count')).toThrow();

    expect(requirePositiveIntFromString('3', 'count')).toBe(3);
    expect(() => requirePositiveIntFromString('abc', 'count')).toThrow();
  });

  test('requirePositiveNumber', () => {
    expect(requirePositiveNumber(2.5, 'price')).toBe(2.5);
    expect(() => requirePositiveNumber(0, 'price')).toThrow();
  });
});
