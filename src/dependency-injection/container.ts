import { AuthService } from "../modules/auth/auth.service";
import { PropertyService } from "../modules/property/property.service";
import { BlockedDateService } from "../modules/blocked-date/blocked-date.service";
import { BookingService } from "../modules/booking/booking.service";

export interface AppContainer {
  authService: AuthService;
  propertyService: PropertyService;
  blockedDateService: BlockedDateService;
  bookingService: BookingService;
}

export function createContainer(): AppContainer {
  const authService = new AuthService();
  const propertyService = new PropertyService();
  const blockedDateService = new BlockedDateService();
  const bookingService = new BookingService();

  return {
    authService,
    propertyService,
    blockedDateService,
    bookingService,
  };
}
