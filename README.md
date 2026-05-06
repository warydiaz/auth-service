# auth-service

Microservicio centralizado de autenticación y autorización para una plataforma compuesta por múltiples microservicios. Gestiona identidades, emite tokens JWT firmados y resuelve permisos granulares mediante RBAC.

## Tabla de contenidos

- [Visión general](#visión-general)
- [Stack técnico](#stack-técnico)
- [Arquitectura](#arquitectura)
- [Modelo de permisos](#modelo-de-permisos)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
- [Tests](#tests)
- [Documentación de la API](#documentación-de-la-api)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Convenciones de Git](#convenciones-de-git)
- [Roadmap](#roadmap)
- [Licencia](#licencia)

## Visión general

`auth-service` es el componente responsable de:

- Gestionar el ciclo de vida de los usuarios (registro, login, recuperación de password, verificación de email).
- Emitir y rotar tokens JWT (access + refresh) firmados con RS256.
- Definir y administrar roles y permisos granulares siguiendo el formato `area:action` (por ejemplo `orders:read`, `payments:refund`).
- Exponer una clave pública (JWKS) para que cualquier microservicio consumidor valide tokens localmente sin acoplarse a este servicio.
- Auditar eventos críticos (logins, cambios de password, asignación de roles).

Los microservicios consumidores (`orders`, `payments`, `notifications`, etc.) validan los tokens emitidos por `auth-service` y aplican autorización con base en los permisos incluidos en el payload.

## Stack técnico

- **Runtime**: Node.js 20+
- **Framework**: NestJS con Fastify
- **Lenguaje**: TypeScript (modo estricto)
- **Base de datos**: MongoDB
- **Autenticación**: JWT (RS256)
- **Hash de passwords**: argon2id
- **Tests**: Vitest
- **Validación**: class-validator / zod
- **Documentación API**: OpenAPI / Swagger
- **Containerización**: Docker + docker-compose

## Arquitectura

El proyecto sigue **arquitectura hexagonal** (Ports & Adapters), separando claramente:

- **Domain**: entidades, value objects, reglas de negocio puras. No depende de NestJS ni de la base de datos.
- **Application**: casos de uso, puertos (interfaces), orquestación.
- **Infrastructure**: adaptadores concretos (repositorios MongoDB, hash de passwords, JWT, email).
- **Interfaces**: controladores HTTP, DTOs, guards, decorators.

Esta separación permite testear el dominio sin levantar la app completa y reemplazar adaptadores (por ejemplo, cambiar de MongoDB a PostgreSQL) sin tocar la lógica de negocio.

## Modelo de permisos

Se aplica RBAC clásico con permisos granulares por área:

```
User ──< UserRole >── Role ──< RolePermission >── Permission
```

- **User**: identidad global con email único.
- **Role**: agrupación nombrada de permisos (`orders-admin`, `payments-viewer`, etc.).
- **Permission**: acción granular con namespace `area:action`.

Los permisos efectivos del usuario se resuelven al emitir el JWT y se incluyen en el payload, de modo que cada microservicio valida localmente sin consultar a `auth-service` en cada request.

## Requisitos previos

- Node.js 20 o superior
- pnpm 9 o superior
- Docker y docker-compose
- Git

## Instalación

```bash
git clone <url-del-repo>
cd auth-service
pnpm install
cp .env.example .env
```

Levantar la base de datos:

```bash
docker-compose up -d
```

## Variables de entorno

Las variables se cargan vía `ConfigModule` con validación al arranque. Todas las variables requeridas están documentadas en `.env.example`.

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto HTTP del servicio | `3000` |
| `MONGO_URI` | Connection string de MongoDB | `mongodb://localhost:27017/auth` |
| `JWT_PRIVATE_KEY` | Clave privada RS256 para firmar tokens | (PEM) |
| `JWT_PUBLIC_KEY` | Clave pública RS256 para validar | (PEM) |
| `JWT_ACCESS_TTL` | Duración del access token | `15m` |
| `JWT_REFRESH_TTL` | Duración del refresh token | `7d` |
| `BCRYPT_ROUNDS` | Costo de hash (si se usa bcrypt) | `12` |

## Ejecución

```bash
# Desarrollo con hot reload
pnpm start:dev

# Producción
pnpm build
pnpm start:prod
```

Verificar que el servicio está arriba:

```bash
curl http://localhost:3000/health
```

## Tests

```bash
# Tests unitarios
pnpm test

# Tests con cobertura
pnpm test:cov

# Tests en modo watch
pnpm test:watch

# Tests end-to-end
pnpm test:e2e
```

Cobertura mínima requerida: **80%** sobre código nuevo.

## Documentación de la API

Una vez levantado el servicio, la documentación interactiva está disponible en:

```
http://localhost:3000/docs
```

La especificación OpenAPI en formato JSON:

```
http://localhost:3000/docs-json
```

La clave pública para validar tokens (JWKS):

```
http://localhost:3000/.well-known/jwks.json
```

## Estructura del proyecto

```
src/
├── domain/                 # Entidades, value objects, errores de dominio
│   ├── user/
│   ├── role/
│   ├── permission/
│   └── shared/
├── application/            # Casos de uso, puertos
│   ├── user/
│   ├── auth/
│   └── ports/
├── infrastructure/         # Adaptadores concretos
│   ├── persistence/        # Repositorios MongoDB
│   ├── crypto/             # Hash, JWT
│   ├── email/              # Envío de emails
│   └── config/
└── interfaces/             # Capa HTTP
    ├── http/
    │   ├── controllers/
    │   ├── dtos/
    │   ├── guards/
    │   └── decorators/
    └── main.ts
test/
docker-compose.yml
Dockerfile
.env.example
```

## Convenciones de Git

### Estrategia de ramas

- `main`: rama estable, siempre desplegable. No recibe commits directos.
- `feat/<nombre>`: nuevas funcionalidades.
- `fix/<nombre>`: correcciones de bugs.
- `chore/<nombre>`: tareas de mantenimiento, dependencias, configuración.
- `docs/<nombre>`: cambios solo de documentación.
- `refactor/<nombre>`: refactorizaciones sin cambio funcional.

Cada requerimiento se desarrolla en su propia rama, basada en `main`, y se integra mediante Pull Request con squash merge.

### Conventional Commits

Los mensajes de commit siguen [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add password reset flow
fix: prevent refresh token reuse across families
chore: update dependencies
docs: document RBAC model in README
test: add integration tests for login flow
refactor: extract token issuer to dedicated service
```

Cada Pull Request debe incluir el ID del requerimiento (`RF-XX`) en el título o descripción.

### Definition of Done

Para mergear a `main`:

- [ ] Código revisado vía Pull Request
- [ ] Tests unitarios y de integración pasando
- [ ] Cobertura mínima del 80% sobre código nuevo
- [ ] Lint y formato sin errores
- [ ] Endpoints documentados en Swagger
- [ ] Variables nuevas documentadas en `.env.example`
- [ ] README actualizado si corresponde

## Roadmap

El desarrollo se organiza en fases. Cada fase es independientemente desplegable.

### Fase 1 — Núcleo (MVP)

- [ ] RF-01 — Setup inicial del proyecto
- [ ] RF-02 — Entidad User y registro
- [ ] RF-03 — Login y emisión de access token JWT
- [ ] RF-04 — Refresh tokens con rotación
- [ ] RF-05 — Logout y revocación
- [ ] RF-06 — Endpoint `/me`

### Fase 2 — Autorización (RBAC)

- [ ] RF-07 — Entidades Role y Permission
- [ ] RF-08 — CRUD de roles
- [ ] RF-09 — CRUD de permisos
- [ ] RF-10 — Asignación de roles a usuarios
- [ ] RF-11 — Guards y decorators de permisos

### Fase 3 — Seguridad y operación

- [ ] RF-12 — Verificación de email
- [ ] RF-13 — Recuperación de password
- [ ] RF-14 — Cambio de password autenticado
- [ ] RF-15 — Rate limiting y bloqueo por intentos fallidos
- [ ] RF-16 — Auditoría de eventos
- [ ] RF-17 — Sesiones activas
- [ ] RF-18 — Documentación Swagger / OpenAPI

### Fase 4 — Mejoras opcionales

- [ ] RF-19 — Two-Factor Authentication (TOTP)
- [ ] RF-20 — Token introspection endpoint
- [ ] RF-21 — Lista de revocación (token blacklist)

## Licencia

Por definir.