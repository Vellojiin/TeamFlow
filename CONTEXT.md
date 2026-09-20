# TeamFlow - contexto actual

> Documento de contexto técnico generado a partir del estado visible del repositorio el 11 de septiembre de 2026. Describe el código fuente y la configuración presentes en ese momento; no sustituye la documentación operativa ni garantiza que el worktree esté limpio.

## 1. Propósito

TeamFlow es un SaaS en desarrollo para gestionar equipos, organizaciones, proyectos y tareas. El producto busca centralizar la coordinación del trabajo, la asignación de tareas y el seguimiento de actividad.

## 2. Estructura del repositorio

El repositorio es un monorepo administrado con pnpm y Turborepo:

```text
apps/
  api/       API HTTP con NestJS
  web/       Frontend con Next.js App Router
  worker/    Consumidor de trabajos BullMQ
packages/
  database/  Prisma, cliente PostgreSQL y módulo NestJS
  events/    Tipos y nombres de eventos compartidos
  queue/     Nombres y tipos de colas/trabajos
```

También existen `.github/`, `.agents/`, `docker-compose.yml`, `pnpm-lock.yaml` y archivos de configuración del workspace. `node_modules/`, `.next/` y `dist/` son artefactos generados y no forman parte del contexto funcional.

## 3. Stack y ejecución

- Node.js/TypeScript.
- pnpm `10.32.1` y Turborepo.
- API: NestJS 11, Passport/JWT, Swagger, class-validator y Prisma.
- Frontend: Next.js `16.3.1`, React 19, Tailwind CSS 4.
- Persistencia: PostgreSQL 17 mediante Prisma 7 y `@prisma/adapter-pg`.
- Mensajería/procesamiento: Redis 8, BullMQ 6 y un worker NestJS.
- Desarrollo local: Docker Compose para PostgreSQL y Redis.
- El README raíz también menciona MinIO y Mailpit como parte del stack previsto, pero no hay servicios para ellos en el `docker-compose.yml` actual.

Scripts de raíz:

```text
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Estos comandos delegan en las tareas equivalentes de Turborepo. Los paquetes tienen además scripts específicos para desarrollo, compilación y Prisma.

## 4. Variables de entorno e infraestructura local

`.env.example` define variables para PostgreSQL, Redis y JWT:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`
- `REDIS_PORT`
- `DATABASE_URL`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`

Los valores reales viven en `.env` y no se documentan aquí. El Compose actual expone PostgreSQL en `${POSTGRES_PORT}` y Redis en `${REDIS_PORT}`, con volúmenes persistentes `postgres_data` y `redis_data`.

La API carga el `.env` de la raíz, escucha por defecto en el puerto `3001`, usa el prefijo global `/api` y publica Swagger en `/api/docs`. El frontend utiliza `NEXT_PUBLIC_API_URL` y, si no existe, apunta a `http://localhost:3001/api`.

## 5. API NestJS

### Módulos

`apps/api/src/app.module.ts` compone los módulos de base de datos, usuarios, autenticación, organizaciones, miembros, proyectos, tareas, cola, outbox y activity log.

La aplicación habilita:

- `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`.
- Swagger con autenticación Bearer.
- Guards JWT, acceso a organización y roles para proteger operaciones.

### Rutas observables

Todas las rutas llevan el prefijo `/api`.

| Área | Rutas |
| --- | --- |
| Salud | `GET /`, `GET /health/database` |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Usuarios | `GET /users`, `POST /users` |
| Organizaciones | `POST /organizations`, `GET /organizations`, `GET/PATCH/DELETE /organizations/:id` |
| Miembros | `GET/POST /organizations/:organizationId/members`, `PATCH /organizations/:organizationId/members/:memberId/role`, `DELETE /organizations/:organizationId/members/:memberId` |
| Proyectos | `POST/GET /organizations/:organizationId/projects`, `GET/PATCH/DELETE /organizations/:organizationId/projects/:projectId` |
| Tareas | `POST/GET /organizations/:organizationId/projects/:projectId/tasks`, `GET/PATCH/DELETE /organizations/:organizationId/projects/:projectId/tasks/:taskId`, `PATCH /organizations/:organizationId/projects/:projectId/tasks/:taskId/status` |
| Outbox | `GET /outbox/status` |

Las operaciones están protegidas según organización y rol cuando corresponde.

### Autenticación

El registro normaliza el email, almacena la contraseña con Argon2 y devuelve datos públicos del usuario. El login emite access token y refresh token JWT. El refresh token se guarda únicamente como hash SHA-256 junto con su expiración; refresh y logout invalidan/verifican ese valor. `GET /api/auth/me` requiere `JwtAuthGuard`.

## 6. Modelo de datos

El schema Prisma está en `packages/database/prisma/schema.prisma`. Las entidades principales son:

- `User`: identidad, contraseña hasheada, refresh token, membresías, tareas asignadas y actividad.
- `Organization`: organización con `slug` único, proyectos y miembros.
- `OrganizationMember`: relación usuario-organización con roles `OWNER`, `ADMIN` o `MEMBER`.
- `Project`: proyecto perteneciente a una organización y contenedor de tareas.
- `Task`: título, descripción, estado (`TODO`, `IN_PROGRESS`, `DONE`), prioridad (`LOW`, `MEDIUM`, `HIGH`), proyecto, asignado y fecha límite.
- `ActivityLog`: eventos de actividad asociados opcionalmente con usuario, organización, proyecto y tarea; `eventId` es único para permitir idempotencia.
- `OutboxEvent`: evento pendiente/publicado con payload, intentos, errores y timestamps.

Las migraciones cubren el schema inicial, proyectos, tareas, activity logs, identificadores de eventos, outbox/observabilidad y refresh tokens. `packages/database/prisma/seed.ts` requiere `DATABASE_URL`.

## 7. Eventos, cola y worker

`packages/events` define el evento `task.created` y su payload `TaskCreatedEvent`. `packages/queue` define la cola `task-queue` y los tipos de trabajos.

La API publica trabajos relacionados con tareas mediante BullMQ y el worker (`apps/worker`) consume `task.created`. El procesador busca la tarea en PostgreSQL y crea un `ActivityLog` de tipo `TASK_CREATED`. El `eventId` único permite tratar duplicados como operación idempotente. El worker registra trabajos completados/fallidos y cierra el worker durante el apagado del módulo.

## 8. Frontend actual

El frontend usa App Router y una identidad visual con Montserrat, Tailwind, paleta azul/mint y modo oscuro.

Rutas presentes:

- `/`: landing page con branding, enlaces a registro/login y selector de tema.
- `/login`: página placeholder que actualmente solo renderiza `Hola`.
- `/register`: contiene únicamente la directiva de cliente; no hay formulario implementado.
- `/dashboard`: archivo presente pero sin contenido funcional visible.

Hay modelos de dominio para usuario, organización, proyecto y tarea. `src/core/api-client.ts` centraliza `fetch`, errores HTTP y el token Bearer. `auth-storage.ts` reserva la clave `teamflow_access_token` en `localStorage`.

La integración de autenticación del frontend todavía está incompleta: existe un contrato `UserRepository` y un `authService.ts` inicial, pero el servicio no implementa todavía las operaciones de registro/login/me de forma utilizable.

## 9. Pruebas y calidad

La API contiene pruebas unitarias para autenticación, tareas y outbox/procesamiento de eventos. Los paquetes y apps exponen comandos de typecheck/build; el frontend no muestra pruebas automatizadas propias en la estructura actual.

Los README de `apps/api` y `apps/web` siguen siendo plantillas generadas por NestJS/Create Next App y no describen completamente el sistema real. El README raíz sí identifica el producto y el stack, pero solo indica que está en desarrollo.

## 10. Estado del worktree al generar este documento

El branch estaba basado en `feat` y tenía cambios sin commit:

- Modificación de `apps/web/app/page.tsx` para usar el color `mint` en el nombre de marca.
- Eliminación de `apps/web/src/lib/api.ts`, reemplazado en el trabajo actual por `apps/web/src/core/api-client.ts`.
- Archivos nuevos relacionados con dashboard, registro y la infraestructura/dominio de autenticación del frontend.

Estos cambios se documentan como estado de trabajo, no como funcionalidades terminadas. `CONTEXT.md` no debe interpretarse como evidencia de que el flujo de autenticación del frontend o el dashboard estén completos.

## 11. Próximos puntos visibles

1. Completar las pantallas de login, registro y dashboard.
2. Terminar el repositorio/servicio de autenticación del frontend y conectar almacenamiento, refresh token y manejo de errores.
3. Alinear los modelos de dominio del frontend con el schema real (por ejemplo, prioridad de tareas).
4. Reemplazar los README de plantilla por instrucciones reales de desarrollo, migraciones y operación.
5. Añadir o documentar pruebas de integración para los flujos HTTP y la interacción API-Redis-worker.
6. Confirmar en CI que build, lint, typecheck y tests se ejecutan correctamente para todos los paquetes del workspace.
