import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  """
  Fecha/tiempo ISO-8601. Actualmente se maneja como string.
  """
  scalar DateTime

  enum Role {
    """Usuario propietario que puede publicar propiedades"""
    PROPIETARIO
    """Usuario viajero que puede reservar propiedades"""
    VIAJERO
  }

  enum BookingStatus {
    """Reserva creada, pendiente de confirmación del propietario"""
    PENDING
    """Reserva confirmada"""
    CONFIRMED
    """Reserva cancelada"""
    CANCELLED
  }

  """
  Cuenta de usuario del sistema.
  """
  type User {
    """Identificador único del usuario"""
    id: ID!
    """Nombre completo del usuario"""
    name: String!
    """Correo electrónico (único)"""
    email: String!
    """Rol del usuario (PROPIETARIO o VIAJERO)"""
    role: Role!
    """Fecha de creación"""
    createdAt: String
    """Fecha de última actualización"""
    updatedAt: String
  }

  """
  Propiedad publicada por un propietario.
  """
  type Property {
    """Identificador único de la propiedad"""
    id: ID!
    """Título o nombre comercial"""
    title: String!
    """Descripción opcional"""
    description: String
    """Identificador del dueño"""
    ownerId: ID!
    """Capacidad máxima de huéspedes"""
    maxGuests: Int!
    """Precio base por noche"""
    basePricePerNight: Float!
    """Precio total calculado para el rango solicitado (solo en searchAvailableProperties)"""
    totalPrice: Float
    """Relación hacia el dueño"""
    owner: User
    """Fecha de creación"""
    createdAt: String
    """Fecha de última actualización"""
    updatedAt: String
  }

  """
  Rango de fechas bloqueadas por el propietario (no reservables).
  """
  type BlockedDate {
    id: ID!
    propertyId: ID!
    property: Property
    """Fecha de inicio (YYYY-MM-DD)"""
    startDate: String!
    """Fecha de fin (YYYY-MM-DD)"""
    endDate: String!
    createdAt: String
    updatedAt: String
  }

  """
  Reserva de una propiedad realizada por un viajero.
  """
  type Booking {
    id: ID!
    propertyId: ID!
    property: Property
    userId: ID!
    traveler: User
    startDate: String!
    endDate: String!
    guests: Int!
    totalPrice: Float!
    status: BookingStatus!
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    """Ping de salud para monitoreo"""
    _health: String!
    """Cuenta del usuario autenticado (requiere Authorization Bearer)"""
    account: User

    """
    Lista paginada de propiedades del propietario autenticado.
    Args: page (default 1), pageSize (default 10, max 100).
    """
    myProperties(page: Int, pageSize: Int): [Property!]!
    """Obtiene una propiedad por ID (pública)"""
    property(id: ID!): Property

    """
    Busca propiedades disponibles para un rango de fechas y número de huéspedes.
    Filtra internamente reservas confirmadas y bloqueos que solapen el rango.
    Args: start/end en formato YYYY-MM-DD, guests > 0, paginación opcional.
    """
    searchAvailableProperties(
      start: String!
      end: String!
      guests: Int!
      page: Int
      pageSize: Int
    ): [Property!]!
  }

  type Mutation {
    """Crea un usuario y devuelve token + usuario"""
    register(
      name: String!
      email: String!
      password: String!
      role: Role!
    ): AuthPayload!

    """Login de usuario; devuelve token + usuario"""
    login(
      email: String!
      password: String!
    ): AuthPayload!

    """Crea una nueva propiedad (solo PROPIETARIO autenticado)"""
    createProperty(
      title: String!
      description: String
      maxGuests: Int!
      basePricePerNight: Float!
    ): Property!

    """Actualiza una propiedad propia (solo PROPIETARIO autenticado)"""
    updateProperty(
      id: ID!
      title: String
      description: String
      maxGuests: Int
      basePricePerNight: Float
    ): Property!

    """Elimina una propiedad propia (solo PROPIETARIO autenticado)"""
    deleteProperty(id: ID!): Boolean!

    """Bloquea fechas en una propiedad propia (solo PROPIETARIO autenticado)"""
    createBlockedDate(
      propertyId: ID!
      startDate: String!
      endDate: String!
    ): BlockedDate!

    """Crea una reserva como VIAJERO autenticado"""
    createBooking(
      propertyId: ID!
      startDate: String!
      endDate: String!
      guests: Int!
    ): Booking!

    """Actualiza el estado de una reserva como PROPIETARIO dueño"""
    updateBookingStatus(
      id: ID!
      status: BookingStatus!
    ): Booking!
  }
`;
