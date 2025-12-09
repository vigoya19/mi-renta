import { diffInDays, rangesOverlap } from '../date-utils';

describe('date-utils', () => {
  test('rangesOverlap detects overlap', () => {
    expect(rangesOverlap('2024-01-01', '2024-01-05', '2024-01-04', '2024-01-10')).toBe(
      true,
    );
    expect(rangesOverlap('2024-01-01', '2024-01-05', '2024-01-06', '2024-01-10')).toBe(
      false,
    );
  });

  test('diffInDays returns whole day difference', () => {
    expect(diffInDays('2024-01-01', '2024-01-02')).toBe(1);
    expect(diffInDays('2024-01-01', '2024-01-05')).toBe(4);
  });
});
