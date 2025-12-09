import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { validateDto } from '../validation';

class SampleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Type(() => Number)
  @IsInt()
  age!: number;
}

describe('validateDto', () => {
  test('returns validated instance for valid payload', () => {
    const dto = validateDto(SampleDto, { name: 'John', age: '30' });
    expect(dto).toBeInstanceOf(SampleDto);
    expect(dto.name).toBe('John');
    expect(dto.age).toBe(30);
  });

  test('throws with readable errors for invalid payload', () => {
    expect(() => validateDto(SampleDto, { name: '', age: 'not-a-number' })).toThrow();
  });
});
