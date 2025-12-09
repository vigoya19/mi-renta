export const ERROR_MESSAGES = {
  AUTH: {
    NOT_AUTHENTICATED: 'Debes iniciar sesión para continuar.',
    NOT_AUTHORIZED: 'No tienes permisos para realizar esta acción.',
    EMAIL_IN_USE: 'El email ya está registrado.',
    INVALID_CREDENTIALS: 'Las credenciales no son válidas.',
  },
  PROPERTY: {
    NOT_FOUND: 'Propiedad no encontrada.',
    UNAUTHORIZED_UPDATE: 'No puedes modificar esta propiedad.',
    UNAUTHORIZED_DELETE: 'No puedes eliminar esta propiedad.',
  },
  BOOKING: {
    INVALID_DATE_RANGE: 'El rango de fechas es inválido (start >= end).',
    PROPERTY_NOT_FOUND: 'Propiedad no encontrada.',
    CAPACITY_EXCEEDED: 'Número de huéspedes excede la capacidad máxima.',
    DATES_UNAVAILABLE_BOOKING: 'Las fechas no están disponibles (reservas confirmadas).',
    DATES_UNAVAILABLE_BLOCKED: 'Las fechas no están disponibles (fechas bloqueadas).',
    NOT_FOUND: 'Reserva no encontrada.',
    UNAUTHORIZED_STATUS_CHANGE: 'No estás autorizado para cambiar el estado de esta reserva.',
    CONFLICT_BOOKING: 'No se puede confirmar, hay otra reserva confirmada solapada.',
    CONFLICT_BLOCK: 'No se puede confirmar, hay bloqueos solapados.',
    INVALID_STATUS_TRANSITION: 'Transición de estado no permitida para la reserva.',
  },
  BLOCK: {
    INVALID_DATE_RANGE: 'El rango de fechas es inválido (start >= end).',
    PROPERTY_NOT_FOUND: 'Propiedad no encontrada.',
    UNAUTHORIZED: 'No tienes permisos para bloquear esta propiedad.',
    OVERLAP_BOOKINGS:
      'No se puede bloquear el rango porque se solapa con reservas confirmadas.',
    OVERLAP_BLOCKS:
      'La propiedad ya tiene un bloqueo que se solapa con este rango de fechas.',
  },
  VALIDATION: {
    PAGE_POSITIVE: 'El parámetro page debe ser un entero positivo.',
    PAGESIZE_POSITIVE: 'El parámetro pageSize debe ser un entero positivo.',
    PAGESIZE_MAX: 'pageSize no puede ser mayor a 100.',
    DATE_FORMAT: function (fieldName: string): string {
      return 'El campo ' + fieldName + ' debe tener formato YYYY-MM-DD.';
    },
    FIELD_REQUIRED: function (fieldName: string): string {
      return 'El campo ' + fieldName + ' es requerido.';
    },
    EMAIL_INVALID: function (fieldName: string): string {
      return 'El campo ' + fieldName + ' debe ser un email válido.';
    },
    POSITIVE_INT: function (fieldName: string): string {
      return 'El campo ' + fieldName + ' debe ser un entero positivo.';
    },
    POSITIVE_NUMBER: function (fieldName: string): string {
      return 'El campo ' + fieldName + ' debe ser un número positivo.';
    },
    ROLE_INVALID: 'El campo role debe ser PROPIETARIO o VIAJERO.',
    BOOKING_STATUS_INVALID: 'El estado debe ser PENDING, CONFIRMED o CANCELLED.',
  },
};
