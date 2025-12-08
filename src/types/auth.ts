
export interface RegisterArgs {
  name: string;
  email: string;
  password: string;
  role: 'PROPIETARIO' | 'VIAJERO';
}

export interface LoginArgs {
  email: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'PROPIETARIO' | 'VIAJERO';
  };
}