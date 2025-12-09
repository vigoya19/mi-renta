# mi-renta

Aplicación GraphQL para gestionar propiedades, reservas y bloqueos entre propietarios y viajeros.

## Pila
- Node.js 12.22.12 (TypeScript 3.9, Apollo Server Express 3)
- GraphQL + Sequelize (MySQL)
- Jest + ts-jest (tests unitarios)

## Configuración rápida
1. Variables de entorno (`.env`):
   - `NODE_ENV` (development/production)
   - `PORT`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET`
2. Seleccionar versión de Node 12 con nvm (recomendado):
   ```bash
   nvm use 12.22.12
   ```
3. Instalar dependencias:
   ```bash
   npm install
   ```
   > Si estás sin internet, instala previamente `graphql-voyager` cuando tengas conexión.
4. Levantar en desarrollo:
   ```bash
   npm run dev
   ```
5. Tests:
   ```bash
   npm test
   ```
6. Build (puede fallar con TS 3.9 y typings modernos; recomendado actualizar TS si quieres compilar):
   ```bash
   npm run build
   ```

## Base de datos
- Sequelize configurado en `src/db/index.ts`. En `development` ejecuta `sequelize.sync()`; en otros entornos usa migraciones.
- Scripts de migración/seed:
  ```bash
  npm run db:migrate
  npm run db:migrate:undo
  npm run db:seed
  npm run db:seed:undo
  ```

## API GraphQL
- Endpoint: `http://localhost:4000/graphql`
- Documentación interactiva: abre el endpoint en el navegador y usa la pestaña **Docs** del sandbox.
- Esquema descrito en `src/graphql/typeDefs.ts` con descripciones de tipos, queries y mutations.
  - Queries principales: `_health`, `account`, `myProperties`, `property`, `searchAvailableProperties`.
  - Mutations principales: `register`, `login`, `create/update/deleteProperty`, `createBlockedDate`, `createBooking`, `updateBookingStatus`.
  - Argumentos de fechas en formato `YYYY-MM-DD`; paginación con `page`/`pageSize`.
- Errores:
  - Validaciones: `UserInputError` (`BAD_USER_INPUT`) con `extensions.validationErrors`.
  - Auth: `UNAUTHENTICATED` / `FORBIDDEN`.
  - Conflictos de solapes: código `CONFLICT`.
  - Recursos no encontrados: `NOT_FOUND`.

## Vista del esquema (GraphQL Voyager)
- Rutas:
  - Query: `http://localhost:4000/voyager`
  - Mutations: `http://localhost:4000/voyager-mutation`
  (requiere `graphql-voyager` instalado y conexión a npm para descargarlo).
- Se monta en `src/app.ts` apuntando al endpoint `/graphql` como origen.

## Tablas y relaciones (MySQL / Sequelize)
- **Users**

| Columna       | Tipo              | Notas                    |
| ------------- | ----------------- | ------------------------ |
| id            | INT PK            | autoincrement            |
| name          | VARCHAR(100)      |                          |
| email         | VARCHAR(150)      | único                    |
| passwordHash  | VARCHAR(255)      |                          |
| role          | ENUM(PROPIETARIO, VIAJERO) |                |
| createdAt     | DATETIME          |                          |
| updatedAt     | DATETIME          |                          |

- **Properties**

| Columna           | Tipo              | Notas                                |
| ----------------- | ----------------- | ------------------------------------ |
| id                | INT PK            | autoincrement                        |
| title             | VARCHAR(150)      |                                      |
| description       | TEXT NULL         |                                      |
| ownerId           | INT FK            | -> Users.id                          |
| maxGuests         | INT               |                                      |
| basePricePerNight | DECIMAL(10,2)     |                                      |
| createdAt         | DATETIME          |                                      |
| updatedAt         | DATETIME          |                                      |

- **Bookings**

| Columna    | Tipo                 | Notas                                |
| ---------- | -------------------- | ------------------------------------ |
| id         | INT PK               | autoincrement                        |
| propertyId | INT FK               | -> Properties.id                     |
| userId     | INT FK               | -> Users.id (viajero)                |
| startDate  | DATE                 |                                      |
| endDate    | DATE                 |                                      |
| guests     | INT                  |                                      |
| totalPrice | DECIMAL(10,2)        |                                      |
| status     | ENUM(PENDING, CONFIRMED, CANCELLED) |                       |
| createdAt  | DATETIME             |                                      |
| updatedAt  | DATETIME             |                                      |

- **BlockedDates**

| Columna    | Tipo      | Notas                                |
| ---------- | --------- | ------------------------------------ |
| id         | INT PK    | autoincrement                        |
| propertyId | INT FK    | -> Properties.id                     |
| startDate  | DATE      |                                      |
| endDate    | DATE      |                                      |
| createdAt  | DATETIME  |                                      |
| updatedAt  | DATETIME  |                                      |

Relaciones:
- `User (PROPIETARIO) 1..N Property`
- `Property 1..N Booking`
- `User (VIAJERO) 1..N Booking`
- `Property 1..N BlockedDate`

## Ejemplos de Queries/Mutations (flujo típico)

1) **Registro y login (obtén token)**
```graphql
mutation Register {
  register(name: "Alice", email: "alice@example.com", password: "Secret123", role: PROPIETARIO) {
    token
    user { id name role }
  }
}

mutation Login {
  login(email: "alice@example.com", password: "Secret123") {
    token
    user { id name role }
  }
}
```
Usa `Authorization: Bearer <token>` en las siguientes operaciones.

2) **Crear propiedad (propietario)**
```graphql
mutation {
  createProperty(
    title: "Casa en la playa",
    description: "Vista al mar",
    maxGuests: 6,
    basePricePerNight: 120.5
  ) {
    id
    title
  }
}
```

3) **Listar mis propiedades (paginado)**
```graphql
query {
  myProperties(page: 1, pageSize: 10) {
    id
    title
    maxGuests
    basePricePerNight
  }
}
```

4) **Bloquear fechas (propietario)**
```graphql
mutation {
  createBlockedDate(
    propertyId: 1,
    startDate: "2024-08-01",
    endDate: "2024-08-05"
  ) {
    id
    startDate
    endDate
  }
}
```

5) **Buscar propiedades disponibles (viajero)**
```graphql
query {
  searchAvailableProperties(
    start: "2024-08-10",
    end: "2024-08-15",
    guests: 4,
    page: 1,
    pageSize: 10
  ) {
    id
    title
    maxGuests
    basePricePerNight
  }
}
```

6) **Crear reserva (viajero)**
```graphql
mutation {
  createBooking(
    propertyId: 1,
    startDate: "2024-08-10",
    endDate: "2024-08-15",
    guests: 4
  ) {
    id
    status
    totalPrice
  }
}
```

7) **Confirmar/cancelar reserva (propietario dueño)**
```graphql
mutation {
  updateBookingStatus(id: 1, status: CONFIRMED) {
    id
    status
  }
}
```

## Diagramas (alto nivel)
- **Relacional**: Users (1) — (N) Properties; Properties (1) — (N) Bookings; Users (viajeros) (1) — (N) Bookings; Properties (1) — (N) BlockedDates.
- **Flujo típico**:
  1. Registro/Login → token JWT.
  2. Propietario crea propiedades → puede bloquear fechas.
  3. Viajero busca disponibilidad → crea reserva (PENDING).
  4. Propietario confirma o cancela reserva.
  5. Consultas de cuenta/mis propiedades disponibles via queries.

> Usa Voyager (`/voyager` y `/voyager-mutation`) para visualizar el esquema y las relaciones entre tipos; es el equivalente visual a Swagger/diagrama.

## Notas
- El proyecto usa TypeScript 3.9. Si quieres `tsc --noEmit` sin errores de typings modernos, considera actualizar TS y los tipos de @types/express/sequelize o fijar versiones compatibles.
- Fechas se calculan en UTC (`diffInDays`, `rangesOverlap`) para evitar problemas de TZ/DST.

## Versiones y dependencias clave
- Node.js: 12.22.12 (usa `nvm use 12.22.12` antes de instalar/ejecutar).
- TypeScript: 3.9.10
- Apollo Server Express: 3.13.0
- GraphQL: 16.12.0
- Express: 4.18.2
- Sequelize: 6.37.7
- MySQL driver: mysql2 3.15.3
- Auth: jsonwebtoken 9.0.3, bcryptjs 3.0.3
- Validación: class-validator 0.14.0, class-transformer 0.5.1
- Test: jest 27.5.1, ts-jest 27.1.5
- Doc visual (opcional): graphql-voyager 1.0.0-rc.31 (requiere instalación con conexión a npm)
