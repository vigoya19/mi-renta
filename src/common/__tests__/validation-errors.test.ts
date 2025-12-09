import { validateDto } from '../validation';
import { IsEmail, IsNotEmpty } from 'class-validator';

class SampleInvalidDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  name!: string;
}

describe('validation error formatting', () => {
  test('lanza UserInputError con validationErrors detallados', () => {
    try {
      validateDto(SampleInvalidDto, { email: 'bad', name: '' });
      fail('debería lanzar');
    } catch (err) {
      const anyErr = err as any;
      expect(anyErr.extensions.validationErrors).toBeDefined();
      const fields = anyErr.extensions.validationErrors.map((e: any) => e.field);
      expect(fields).toContain('email');
      expect(fields).toContain('name');
    }
  });
});
