export interface CreateBookingArgs {
  propertyId: string;
  startDate: string;
  endDate: string;
  guests: number;
}

export interface UpdateBookingStatusArgs {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}