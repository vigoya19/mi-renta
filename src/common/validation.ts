import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { UserInputError } from 'apollo-server-express';

interface FieldError {
  field: string;
  messages: string[];
}

function flattenErrors(errors: ValidationError[], parentPath?: string): FieldError[] {
  const result: FieldError[] = [];

  errors.forEach(function (err) {
    const fieldPath = parentPath ? parentPath + '.' + err.property : err.property;
    if (err.constraints) {
      result.push({
        field: fieldPath,
        messages: Object.values(err.constraints),
      });
    }
    if (err.children && err.children.length > 0) {
      result.push.apply(result, flattenErrors(err.children, fieldPath));
    }
  });

  return result;
}

export function validateDto<T>(cls: new () => T, payload: unknown): T {
  const instance = plainToInstance(cls, payload);
  const validationErrors = validateSync(instance as unknown as object, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (validationErrors.length > 0) {
    const formatted = flattenErrors(validationErrors);
    throw new UserInputError('Validación fallida', { validationErrors: formatted });
  }

  return instance;
}
