# TeamFlow API - respuestas actuales

Documento generado a partir de los controladores y servicios implementados en `apps/api/src`. Describe la forma actual de las respuestas; no representa un contrato versionado ni una especificación futura.

## Información general

- **Base URL local:** `http://localhost:3001/api`
- **Documentación Swagger:** `http://localhost:3001/api/docs`
- **Formato:** JSON, excepto las respuestas indicadas como texto.
- **Fechas:** los campos `DateTime` de Prisma se serializan como strings ISO 8601 en HTTP.
- **Autenticación:** las rutas protegidas esperan `Authorization: Bearer <accessToken>`.
- **Validación global:** `ValidationPipe` usa `whitelist`, `forbidNonWhitelisted` y `transform`.

## Formato de errores

NestJS devuelve normalmente un objeto con esta forma:

```json
{
  "statusCode": 404,
  "message": "Proyecto no encontrado",
  "error": "Not Found"
}
```

Para errores de validación, `message` puede ser un arreglo:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

Errores comunes:

| HTTP | Cuándo aparece |
| --- | --- |
| `400 Bad Request` | Body inválido, campos desconocidos o validación fallida |
| `401 Unauthorized` | Token ausente/inválido o credenciales inválidas |
| `403 Forbidden` | Usuario fuera de la organización o rol insuficiente |
| `404 Not Found` | Organización, proyecto, tarea, usuario o miembro inexistente |
| `409 Conflict` | Email/slug duplicado, miembro ya agregado o intento de eliminar al propietario |

## Salud y bienvenida

### `GET /`

Respuesta `200`:

```json
{
  "message": "TeamFlow API"
}
```

### `GET /health/database`

Ejecuta `SELECT 1` y responde `200` si la base de datos está disponible:

```json
{
  "status": "ok",
  "database": "connected"
}
```

Si la consulta falla, NestJS devuelve un error del servidor y no se produce la respuesta anterior.

## Autenticación

### `POST /auth/register`

Respuesta `201`:

```json
{
  "id": "cm...",
  "email": "user@example.com",
  "name": "Johan Navarro"
}
```

La contraseña no se incluye en la respuesta.

Errores específicos:

- `409`: `"Usuario ya existe"`.
- `400`: email inválido, nombre menor de 3 o mayor de 50 caracteres, o contraseña menor de 8 caracteres.

### `POST /auth/login`

Respuesta `200`:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

Errores específicos:

- `401`: `"Credenciales inválidas"`.
- `400`: body que no cumple el DTO de login.

### `POST /auth/refresh`

Respuesta `200`:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

El refresh token anterior se reemplaza por uno nuevo.

Errores específicos:

- `401`: `"Refresh token inválido"` si está expirado, no es de tipo refresh, no coincide con el hash almacenado o el usuario no existe.

### `POST /auth/logout`

Respuesta `200`:

```json
{
  "message": "Sesión cerrada correctamente"
}
```

El endpoint invalida el refresh token almacenado. Requiere un body con `refreshToken`.

### `GET /auth/me`

Requiere access token. Respuesta `200`:

```json
{
  "id": "cm...",
  "email": "user@example.com",
  "name": "Johan Navarro"
}
```

## Usuarios

### `GET /users`

Respuesta `200`: arreglo de usuarios públicos:

```json
[
  {
    "id": "cm...",
    "email": "user@example.com",
    "name": "Johan Navarro",
    "createdAt": "2026-09-15T12:00:00.000Z"
  }
]
```

### `POST /users`

Respuesta `201`: usuario público con el mismo formato de cada elemento de `GET /users`:

```json
{
  "id": "cm...",
  "email": "user@example.com",
  "name": "Johan Navarro",
  "createdAt": "2026-09-15T12:00:00.000Z"
}
```

> Observación del estado actual: este endpoint de administración de usuarios no tiene `JwtAuthGuard` en el controlador.

## Organizaciones

### `POST /organizations`

Requiere autenticación. Respuesta `201`:

```json
{
  "id": "cm...",
  "name": "Mi organización",
  "slug": "mi-organizacion",
  "createdAt": "2026-09-15T12:00:00.000Z",
  "updatedAt": "2026-09-15T12:00:00.000Z"
}
```

Al crearla, el usuario autenticado se agrega como `OWNER`.

### `GET /organizations`

Requiere autenticación. Respuesta `200`: arreglo de organizaciones donde el usuario es miembro:

```json
[
  {
    "id": "cm...",
    "name": "Mi organización",
    "slug": "mi-organizacion",
    "createdAt": "2026-09-15T12:00:00.000Z",
    "updatedAt": "2026-09-15T12:00:00.000Z"
  }
]
```

### `GET /organizations/:id`

Requiere autenticación. Devuelve una organización individual con el mismo shape anterior.

Errores específicos:

- `404`: `"No se encuentra la organizacion"`.

### `PATCH /organizations/:id`

Requiere autenticación y rol `OWNER` o `ADMIN`. Devuelve la organización actualizada con el mismo shape anterior.

Errores específicos:

- `404`: `"No se encuentra la organizacion"`.
- `409`: `"La organizacion ya existe"` cuando el nuevo slug entra en conflicto.

### `DELETE /organizations/:id`

Requiere autenticación y rol `OWNER` o `ADMIN`. Respuesta `200` como texto JSON:

```json
"Organizacion eliminada exitosamente"
```

## Miembros de organización

Ruta base: `/organizations/:organizationId/members`. Todas las operaciones requieren pertenencia a la organización; agregar, modificar roles y eliminar requieren `OWNER` o `ADMIN`.

### `GET /organizations/:organizationId/members`

Respuesta `200`:

```json
[
  {
    "id": "cm...",
    "userId": "cm...",
    "organizationId": "cm...",
    "role": "MEMBER",
    "createdAt": "2026-09-15T12:00:00.000Z",
    "user": {
      "id": "cm...",
      "email": "user@example.com",
      "name": "Johan Navarro",
      "createdAt": "2026-09-15T12:00:00.000Z"
    }
  }
]
```

### `POST /organizations/:organizationId/members`

Respuesta `201`: un miembro con el mismo shape de cada elemento de la lista. El rol inicial es `MEMBER`.

Errores específicos:

- `404`: `"Usuario no encontrado"`.
- `409`: `"El usuario ya es miembro de esta organización"`.

### `PATCH /organizations/:organizationId/members/:memberId/role`

Respuesta `200`: miembro actualizado con su objeto `user` incluido.

Errores específicos:

- `404`: `"Miembro no encontrado"`.
- `403`: `"El rol del propietario de la organización no se puede cambiar"`.

### `DELETE /organizations/:organizationId/members/:memberId`

Respuesta `200`:

```json
{
  "message": "Miembro eliminado correctamente"
}
```

Errores específicos:

- `404`: `"Miembro no encontrado"`.
- `409`: `"No se puede eliminar al propietario"`.

## Proyectos

Ruta base: `/organizations/:organizationId/projects`. Las consultas requieren JWT y pertenencia; crear, actualizar y eliminar requieren `OWNER` o `ADMIN`.

### `POST /organizations/:organizationId/projects`

Respuesta `201`:

```json
{
  "id": "cm...",
  "name": "Lanzamiento",
  "description": "Proyecto principal",
  "organizationId": "cm...",
  "createdAt": "2026-09-15T12:00:00.000Z",
  "updatedAt": "2026-09-15T12:00:00.000Z"
}
```

### `GET /organizations/:organizationId/projects`

Respuesta `200`: arreglo de proyectos con el mismo shape.

### `GET /organizations/:organizationId/projects/:projectId`

Respuesta `200`: proyecto individual con el mismo shape.

### `PATCH /organizations/:organizationId/projects/:projectId`

Respuesta `200`: proyecto actualizado con el mismo shape.

### `DELETE /organizations/:organizationId/projects/:projectId`

Respuesta `200`:

```json
{
  "message": "Proyecto eliminado exitosamente"
}
```

Errores comunes de proyecto:

- `404`: `"Organizacion no encontrada"` al crear contra una organización inexistente.
- `404`: `"Proyecto no encontrado"` al consultar, actualizar o eliminar un proyecto que no pertenece a la organización indicada.

## Tareas

Ruta base: `/organizations/:organizationId/projects/:projectId/tasks`.

- Consultar tareas requiere JWT y pertenencia a la organización.
- Crear y actualizar permite los roles `OWNER`, `ADMIN` y `MEMBER`.
- Eliminar requiere `OWNER` o `ADMIN`.

### Respuesta de tarea

Las operaciones de creación, consulta y actualización devuelven:

```json
{
  "id": "cm...",
  "title": "Preparar release",
  "description": "Validar la versión final",
  "status": "TODO",
  "priority": "HIGH",
  "projectId": "cm...",
  "assigneeId": "cm...",
  "dueDate": "2026-09-30T00:00:00.000Z",
  "createdAt": "2026-09-15T12:00:00.000Z",
  "updatedAt": "2026-09-15T12:00:00.000Z",
  "assignee": {
    "id": "cm...",
    "name": "Johan Navarro",
    "email": "user@example.com"
  }
}
```

Cuando no hay responsable, `assigneeId` y `assignee` son `null`.

### `POST /organizations/:organizationId/projects/:projectId/tasks`

Respuesta `201`: tarea creada con el shape anterior. La operación crea además un evento outbox `task.created`; la respuesta no incluye el evento.

Errores específicos:

- `404`: `"Proyecto no encontrado"`.
- `403`: `"Usuario no es miembro de la organización"` si el responsable no pertenece a la organización.

### `GET /organizations/:organizationId/projects/:projectId/tasks`

Respuesta `200`: arreglo de tareas con el shape anterior, ordenado por `createdAt` descendente.

### `GET /organizations/:organizationId/projects/:projectId/tasks/:taskId`

Respuesta `200`: tarea individual con el shape anterior.

### `PATCH /organizations/:organizationId/projects/:projectId/tasks/:taskId`

Respuesta `200`: tarea actualizada con el shape anterior.

### `PATCH /organizations/:organizationId/projects/:projectId/tasks/:taskId/status`

Respuesta `200`: tarea actualizada con el shape anterior; solo cambia `status`.

### `DELETE /organizations/:organizationId/projects/:projectId/tasks/:taskId`

Respuesta `200`:

```json
{
  "message": "Tarea eliminada correctamente"
}
```

Errores comunes de tarea:

- `404`: `"Proyecto no encontrado"` o `"Tarea no encontrada"`.
- `403`: `"Usuario no es miembro de la organización"` al asignar un usuario externo.

## Outbox

### `GET /outbox/status`

Devuelve el estado agregado del publicador de eventos:

```json
{
  "status": {
    "pending": 2,
    "published": 15,
    "failed": 1
  }
}
```

- `pending`: eventos sin publicar y sin intentos.
- `published`: eventos con `publishedAt`.
- `failed`: eventos sin publicar con uno o más intentos.

## Notas de compatibilidad

1. Los nombres y mensajes están documentados tal como aparecen actualmente en el código, incluyendo diferencias de idioma y acentuación.
2. No todos los endpoints tienen decoradores Swagger detallados para sus modelos de respuesta; los shapes de este documento se derivan de los `select`, `include` y retornos de los servicios.
3. El endpoint de creación directa de usuarios retorna un usuario sin excluir la contraseña en el input, pero el `select` garantiza que la contraseña no se envíe en la respuesta.
4. Si se cambia el schema Prisma o los `select/include` de un servicio, este documento debe actualizarse junto con el cambio.
