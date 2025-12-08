// src/types/property.ts

// Args para Query.property(id: ID!)
export interface PropertyByIdArgs {
  id: string;
}

// Args para Query.searchAvailableProperties(start, end, guests)
export interface SearchAvailablePropertiesArgs {
  start: string;
  end: string;
  guests: number;
}

// Args para Mutation.createProperty
export interface CreatePropertyArgs {
  title: string;
  description?: string;
  maxGuests: number;
  basePricePerNight: number;
}

// Args para Mutation.updateProperty
export interface UpdatePropertyArgs {
  id: string;
  title?: string;
  description?: string;
  maxGuests?: number;
  basePricePerNight?: number;
}

// Args para Mutation.deleteProperty
export interface DeletePropertyArgs {
  id: string;
}