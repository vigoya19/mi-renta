import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  enum Role {
    PROPIETARIO
    VIAJERO
  }

  enum BookingStatus {
    PENDING
    CONFIRMED
    CANCELLED
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    createdAt: String
    updatedAt: String
  }

  type Property {
    id: ID!
    title: String!
    description: String
    ownerId: ID!
    maxGuests: Int!
    basePricePerNight: Float!
    owner: User
    createdAt: String
    updatedAt: String
  }

  type BlockedDate {
    id: ID!
    propertyId: ID!
    property: Property
    startDate: String!
    endDate: String!
    createdAt: String
    updatedAt: String
  }

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
    _health: String!
    account: User

    myProperties(page: Int, pageSize: Int): [Property!]!
    property(id: ID!): Property

    searchAvailableProperties(
      start: String!
      end: String!
      guests: Int!
      page: Int
      pageSize: Int
    ): [Property!]!
  }

  type Mutation {
    register(
      name: String!
      email: String!
      password: String!
      role: Role!
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!

    createProperty(
      title: String!
      description: String
      maxGuests: Int!
      basePricePerNight: Float!
    ): Property!

    updateProperty(
      id: ID!
      title: String
      description: String
      maxGuests: Int
      basePricePerNight: Float
    ): Property!

    deleteProperty(id: ID!): Boolean!

    createBlockedDate(
      propertyId: ID!
      startDate: String!
      endDate: String!
    ): BlockedDate!

    createBooking(
      propertyId: ID!
      startDate: String!
      endDate: String!
      guests: Int!
    ): Booking!

    updateBookingStatus(
      id: ID!
      status: BookingStatus!
    ): Booking!
  }
`;
