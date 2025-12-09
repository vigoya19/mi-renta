import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { UserInputError } from 'apollo-server-express';

function formatErrors(errors: ValidationError[]): string {
  const messages: string[] = [];

  errors.forEach(function (err) {
    if (err.constraints) {
      messages.push.apply(messages, Object.values(err.constraints));
    }
    if (err.children && err.children.length > 0) {
      messages.push(formatErrors(err.children));
    }
  });

  return messages.join('; ');
}

export function validateDto<T>(cls: new () => T, payload: unknown): T {
  const instance = plainToInstance(cls, payload);
  const validationErrors = validateSync(instance as unknown as object, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (validationErrors.length > 0) {
    throw new UserInputError(formatErrors(validationErrors));
  }

  return instance;
}
