import { ERROR_MESSAGES } from '../error-messages';

describe('error-messages', () => {
  test('validation helpers devuelven mensajes', () => {
    expect(ERROR_MESSAGES.VALIDATION.DATE_FORMAT('start')).toContain('start');
    expect(ERROR_MESSAGES.VALIDATION.FIELD_REQUIRED('email')).toContain('email');
    expect(ERROR_MESSAGES.VALIDATION.EMAIL_INVALID('email')).toContain('email');
    expect(ERROR_MESSAGES.VALIDATION.POSITIVE_INT('count')).toContain('count');
    expect(ERROR_MESSAGES.VALIDATION.POSITIVE_NUMBER('price')).toContain('price');
  });
});
