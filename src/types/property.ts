export interface PropertyByIdArgs {
  id: string;
}

export interface SearchAvailablePropertiesArgs {
  start: string;
  end: string;
  guests: number;
  page?: number;
  pageSize?: number;
}

export interface CreatePropertyArgs {
  title: string;
  description?: string;
  maxGuests: number;
  basePricePerNight: number;
}

export interface UpdatePropertyArgs {
  id: string;
  title?: string;
  description?: string;
  maxGuests?: number;
  basePricePerNight?: number;
}

export interface DeletePropertyArgs {
  id: string;
}

export interface MyPropertiesArgs {
  page?: number;
  pageSize?: number;
}
