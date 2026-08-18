# TeamFlow — Project Prompt

## 1. Contexto

Estamos construyendo TeamFlow, una plataforma SaaS de gestión de equipos, proyectos y tareas.

El objetivo principal no es solamente crear una aplicación funcional, sino utilizar el proyecto como vehículo de aprendizaje para evolucionar desde una arquitectura Fullstack tradicional basada en Next.js/Supabase/Vercel hacia una arquitectura backend más cercana a producción.

El proyecto debe enseñar y aplicar:

- Docker
- Docker Compose
- Monorepos
- NestJS
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- Workers
- REST APIs
- JWT authentication
- RBAC
- Testing
- CI/CD
- Deploy
- Observability
- Arquitectura modular

No introducir microservicios inicialmente. TeamFlow comenzará como un monolito modular con procesos independientes para workers. Posteriormente podrá evolucionar hacia microservicios.

---

## 2. Objetivo funcional

TeamFlow permite a usuarios:

- Registrarse
- Iniciar sesión
- Gestionar su perfil
- Crear organizaciones
- Invitar miembros
- Gestionar roles
- Crear proyectos
- Crear y gestionar tareas
- Asignar tareas
- Cambiar estados
- Definir prioridades
- Añadir comentarios
- Adjuntar archivos
- Recibir notificaciones
- Consultar actividad
- Recibir emails relacionados con eventos importantes

La aplicación debe sentirse como un producto SaaS real y no como un CRUD académico.

---

## 3. Stack tecnológico

### Frontend

- Next.js
- React
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query

### Backend

- NestJS
- TypeScript
- REST API
- Prisma
- PostgreSQL
- JWT
- Argon2 o bcrypt
- Swagger/OpenAPI

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL
- Redis
- MinIO
- Mailpit

### Background processing

- BullMQ
- Redis
- Worker independiente

### Testing

- Jest
- Supertest
- Playwright

### DevOps

- GitHub Actions
- Docker images
- VPS
- Reverse proxy
- HTTPS

### Monorepo

- pnpm
- Turborepo

---

## 4. Arquitectura inicial

La arquitectura inicial debe ser:

```text
                    ┌──────────────┐
                    │   Next.js    │
                    │     Web      │
                    └──────┬───────┘
                           │
                         HTTP
                           │
                    ┌──────▼───────┐
                    │    NestJS    │
                    │     API      │
                    └───┬──────┬───┘
                        │      │
              ┌─────────┘      └─────────┐
              ▼                           ▼
       ┌──────────────┐            ┌──────────────┐
       │ PostgreSQL   │            │    Redis     │
       └──────────────┘            └──────┬───────┘
                                          │
                                    ┌─────▼──────┐
                                    │   Worker   │
                                    │   BullMQ   │
                                    └────────────┘
```

Frontend, API y Worker serán aplicaciones independientes dentro del mismo monorepo.

---

## 5. Monorepo

La estructura esperada es:

```text
teamflow/
├── apps/
│   ├── web/
│   ├── api/
│   └── worker/
│
├── packages/
│   ├── database/
│   ├── types/
│   ├── config/
│   └── ui/
│
├── docker/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .env.example
├── .gitignore
└── README.md
```

### Responsabilidades

#### apps/web

Aplicación Next.js.

Responsable de:

- UI
- navegación
- formularios
- consumo de API
- gestión del estado del cliente
- autenticación del frontend

No debe acceder directamente a PostgreSQL.

#### apps/api

Aplicación NestJS.

Responsable de:

- autenticación
- autorización
- lógica de negocio
- validación
- REST API
- acceso a base de datos
- publicación de jobs
- generación de documentación OpenAPI

#### apps/worker

Proceso independiente.

Responsable de:

- consumir BullMQ
- procesar jobs
- enviar emails
- generar notificaciones
- procesamiento pesado
- tareas programadas

No debe servir tráfico HTTP público.

#### packages/database

Responsable de:

- Prisma schema
- Prisma Client
- migrations
- seed

#### packages/types

Tipos compartidos cuando realmente sea necesario.

No duplicar automáticamente todos los DTOs del backend.

#### packages/config

Configuraciones compartidas y validación de variables de entorno cuando resulte apropiado.

#### packages/ui

Componentes UI reutilizables.

---

## 6. Principios arquitectónicos

### Principio 1 — Simplicidad

No crear abstracciones innecesarias.

No utilizar patrones únicamente porque son populares.

Cada abstracción debe resolver un problema real.

### Principio 2 — Separación de responsabilidades

Frontend, API, database y worker deben tener responsabilidades claras.

### Principio 3 — Backend como autoridad

La API es la autoridad sobre:

- autenticación
- autorización
- permisos
- reglas de negocio
- acceso a datos

Nunca confiar en restricciones implementadas únicamente en el frontend.

### Principio 4 — Validación

Los datos provenientes del cliente deben considerarse no confiables.

Todos los endpoints deben validar sus inputs.

### Principio 5 — Seguridad

Nunca almacenar passwords en texto plano.

Nunca hardcodear secretos.

Nunca exponer variables privadas al frontend.

### Principio 6 — Evolución incremental

No implementar funcionalidades avanzadas antes de necesitarlas.

Primero:

```text
Monolith
```

Después:

```text
Queues
Workers
```

Y solamente posteriormente:

```text
Microservices
```

---

## 7. Dominio

Las entidades principales son:

```text
User
Organization
OrganizationMember
Project
Task
Comment
Notification
Attachment
Activity
```

Relaciones principales:

```text
User
 │
 ├── OrganizationMember
 │          │
 │          ▼
 │      Organization
 │          │
 │          └── Project
 │                 │
 │                 └── Task
 │                       ├── Comment
 │                       ├── Attachment
 │                       └── Assignee
 │
 └── Notification
```

---

## 8. Roles

Cada organización tendrá:

```text
OWNER
ADMIN
MEMBER
```

Los permisos deben validarse en el backend.

Ejemplo:

### OWNER

- Gestionar organización
- Gestionar miembros
- Gestionar roles
- Gestionar proyectos
- Gestionar configuración

### ADMIN

- Gestionar proyectos
- Gestionar miembros
- Gestionar tareas

### MEMBER

- Consultar proyectos
- Crear tareas
- Editar tareas permitidas
- Comentar
- Gestionar sus propias tareas

---

## 9. Autenticación

Implementar autenticación propia.

Debe incluir progresivamente:

1. Registro
2. Login
3. Password hashing
4. Access tokens
5. Refresh tokens
6. Logout
7. Guards
8. Protección de endpoints
9. Email verification
10. Password reset

No utilizar Supabase Auth.

---

## 10. API

La API será REST.

Ejemplos:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

GET    /users/me

GET    /organizations
POST   /organizations
GET    /organizations/:id
PATCH  /organizations/:id

GET    /organizations/:id/members
POST   /organizations/:id/invitations

GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id

GET    /projects/:id/tasks
POST   /projects/:id/tasks

GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id

GET    /tasks/:id/comments
POST   /tasks/:id/comments

GET    /notifications
PATCH  /notifications/:id/read
```

La API debe documentarse mediante Swagger/OpenAPI.

---

## 11. PostgreSQL

PostgreSQL será la base de datos principal.

Prisma será el ORM.

No utilizar Supabase como backend.

Las migrations deben estar versionadas.

Debe existir un seed para crear datos de desarrollo.

---

## 12. Redis

Redis tendrá inicialmente estas responsabilidades:

- Cache
- Rate limiting
- BullMQ
- comunicación indirecta con workers

No utilizar Redis como sustituto de PostgreSQL.

Los datos críticos de negocio deben permanecer en PostgreSQL.

---

## 13. BullMQ

Los jobs deben utilizar colas explícitas.

Ejemplos:

```text
email
notifications
reports
files
```

Un job debe ser:

- identificable
- reintentable
- idempotente cuando sea necesario
- observable
- tolerante a errores

Ejemplo:

```text
Task assigned
      │
      ▼
NestJS
      │
      ▼
notification queue
      │
      ▼
Redis
      │
      ▼
Worker
      │
      ├── Create notification
      └── Send email
```

---

## 14. MinIO

MinIO será utilizado en desarrollo como almacenamiento compatible con S3.

Los archivos no deben almacenarse directamente en PostgreSQL.

PostgreSQL almacenará metadata como:

```text
filename
mimeType
size
storageKey
createdAt
```

El contenido del archivo estará en object storage.

---

## 15. Mailpit

Mailpit será utilizado durante desarrollo.

No enviar emails reales desde el entorno local.

El worker enviará emails mediante SMTP hacia Mailpit.

---

## 16. Docker

Todo el entorno local debe poder iniciarse con:

```bash
docker compose up
```

Los servicios principales serán:

```text
postgres
redis
minio
mailpit
```

Durante el desarrollo podremos decidir si Next.js/NestJS/Worker se ejecutan en el host o también dentro de Docker.

La configuración debe permitir posteriormente ejecutar todo el stack de forma containerizada.

---

## 17. Variables de entorno

Nunca commitear secretos.

Debe existir:

```text
.env.example
```

Ejemplos de variables:

```text
DATABASE_URL
REDIS_URL
JWT_SECRET
JWT_REFRESH_SECRET
S3_ENDPOINT
S3_ACCESS_KEY
S3_SECRET_KEY
SMTP_HOST
SMTP_PORT
```

Los nombres definitivos pueden cambiar durante la implementación si existe una razón técnica.

---

## 18. Testing

Implementar progresivamente:

### Unit

Para lógica aislada.

### Integration

Para interacción con PostgreSQL, Redis y otros componentes.

### E2E

Para flujos completos.

Ejemplo:

```text
Register
→ Login
→ Create organization
→ Create project
→ Create task
→ Assign task
→ Verify notification
```

---

## 19. CI/CD

GitHub Actions debe ejecutar como mínimo:

```text
Install dependencies
      ↓
Lint
      ↓
Typecheck
      ↓
Unit tests
      ↓
Integration tests
      ↓
Build
```

Posteriormente:

```text
Build Docker image
      ↓
Push image
      ↓
Deploy
```

---

## 20. Observabilidad

Añadir progresivamente:

- structured logging
- request IDs
- health checks
- error tracking
- métricas
- logs de workers
- estado de queues

La observabilidad debe introducirse después de tener el flujo principal funcionando.

---

## 21. Seguridad

Implementar:

- password hashing
- JWT
- refresh token rotation
- CORS
- Helmet
- rate limiting
- DTO/input validation
- RBAC
- autorización por organización
- protección de uploads
- límites de tamaño
- manejo seguro de secretos
- errores sin filtrar información sensible

---

## 22. UI

La interfaz debe ser limpia y profesional.

Inspiración conceptual:

- Linear
- Vercel
- Notion
- Jira

No copiar diseños.

Pantallas mínimas:

```text
/login
/register
/dashboard
/organizations/:id
/organizations/:id/projects
/organizations/:id/projects/:projectId
/tasks/:id
/organizations/:id/settings
```

El proyecto debe tener:

- sidebar
- navegación
- dashboard
- project list
- task board
- task detail
- notifications
- settings

---

## 23. Fases de desarrollo

### Fase 0

Setup del monorepo.

### Fase 1

Docker + PostgreSQL + Redis.

### Fase 2

Prisma + database schema.

### Fase 3

NestJS + API base.

### Fase 4

Authentication.

### Fase 5

Organizations + RBAC.

### Fase 6

Projects + Tasks.

### Fase 7

Comments + Activity.

### Fase 8

Redis + caching + rate limiting.

### Fase 9

BullMQ + Worker.

### Fase 10

Notifications + Emails.

### Fase 11

MinIO + Attachments.

### Fase 12

Next.js frontend completo.

### Fase 13

Testing.

### Fase 14

CI/CD.

### Fase 15

Production deployment.

### Fase 16

Observability y hardening.

---

## 24. Reglas para el desarrollo

No implementar varias fases simultáneamente.

Cada fase debe terminar funcionando antes de avanzar.

Para cada feature:

1. Explicar qué problema resuelve.
2. Explicar la arquitectura.
3. Implementar.
4. Ejecutar.
5. Probar.
6. Verificar errores.
7. Hacer commit.
8. Continuar.

Cuando se introduzca una tecnología nueva, explicar:

- qué es
- por qué la usamos
- qué problema resuelve
- qué alternativas existen
- por qué no las utilizamos en este proyecto

No entregar código innecesariamente complejo.

Priorizar comprensión sobre velocidad.

---

## 25. Objetivo educativo

Al terminar TeamFlow, el desarrollador debe poder explicar y utilizar correctamente:

```text
Next.js
NestJS
REST
PostgreSQL
Prisma
Redis
BullMQ
Workers
Docker
Docker Compose
Monorepos
JWT
RBAC
Object Storage
Testing
CI/CD
Deployment
Observability
```

Y debe entender cómo evolucionar la arquitectura:

```text
Fullstack application
        ↓
Modular monolith
        ↓
Background workers
        ↓
Async processing
        ↓
Distributed services
        ↓
Microservices
```

---

## 26. Definition of Done

TeamFlow se considera terminado cuando:

- El proyecto puede ejecutarse localmente.
- El stack principal está dockerizado.
- Existe una API NestJS funcional.
- Existe un frontend Next.js funcional.
- PostgreSQL funciona mediante Prisma.
- Redis funciona.
- Existe un worker BullMQ.
- Existe autenticación.
- Existe RBAC.
- Existen organizaciones y miembros.
- Existen proyectos y tareas.
- Existen comentarios.
- Existen notificaciones.
- Existen jobs asíncronos.
- Los emails funcionan mediante Mailpit.
- Los archivos funcionan mediante MinIO.
- Existen tests.
- Existe CI.
- Existe documentación.
- Existe deploy.
- Existe documentación de arquitectura.

---

## 27. Filosofía

TeamFlow no debe construirse como un simple proyecto para mostrar tecnologías.

Cada decisión debe responder:

> ¿Qué problema estamos resolviendo?

La complejidad debe introducirse únicamente cuando aporta valor.

El objetivo final es desarrollar criterio de ingeniería, no solamente conocer herramientas.