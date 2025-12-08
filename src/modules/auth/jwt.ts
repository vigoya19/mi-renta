import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

interface JwtPayload {
  userId: number;
  role: 'PROPIETARIO' | 'VIAJERO';
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}