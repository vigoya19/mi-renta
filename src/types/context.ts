import { AppContainer } from '../di/container';

export interface AuthUser {
  userId: number;
  role: 'PROPIETARIO' | 'VIAJERO';
}

export interface GraphQLContext {
  user: AuthUser | null;
  container: AppContainer;
}
