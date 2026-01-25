# 📚 Documentación API del Backend

**Base URL:** `https://biblioteca-api.onrender.com` (en producción)  
**Local:** `http://localhost:3000`

---

## 🔐 Autenticación

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <token>
```

### Roles de Usuario
| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Usuario** | Usuario normal | CRUD propio, crear reseñas, listas, favoritos |
| **Moderador** | Moderador de contenido | Aprobar/rechazar reseñas, ver estadísticas |
| **Admin** | Administrador | Acceso total al sistema |

---

## 📝 Endpoints de Autenticación

### POST /api/auth/register
Registro de nuevo usuario.

**Request:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "password": "Password123!"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@email.com",
    "tipo": "USUARIO"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

### POST /api/auth/login
Inicio de sesión.

**Request:**
```json
{
  "email": "demo@biblioteca.com",
  "password": "Demo123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "nombre": "Demo",
    "apellido": "Usuario",
    "email": "demo@biblioteca.com",
    "tipo": "USUARIO"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

### POST /api/auth/refresh-token
Renovar token de acceso.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

**Response (200):**
```json
{
  "token": "nuevo_token",
  "refreshToken": "nuevo_refresh_token"
}
```

---

### POST /api/auth/request-password-reset
Solicitar recuperación de contraseña.

**Request:**
```json
{
  "email": "usuario@email.com"
}
```

**Response (200):**
```json
{
  "message": "Se ha enviado un email con las instrucciones"
}
```

---

### POST /api/auth/reset-password
Restablecer contraseña con token.

**Request:**
```json
{
  "token": "token_recibido_email",
  "nuevaPassword": "NuevaPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Contraseña actualizada correctamente"
}
```

---

## 📚 Endpoints de Libros

### GET /api/libros
Obtener todos los libros (con paginación).

**Query Parameters:**
- `limit` (opcional): Número de libros por página (default: 20)
- `offset` (opcional): Desplazamiento

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "El Señor de los Anillos",
      "sinopsis": "En la Tierra Media...",
      "autor": { "id": 1, "nombre": "J.R.R. Tolkien" },
      "ratingPromedio": 4.8,
      "portada": "https://example.com/portada.jpg"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

### GET /api/libros/search
Buscar libros por término.

**Query Parameters:**
- `q`: Término de búsqueda
- `limit` (opcional)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "El Señor de los Anillos",
      "autor": { "nombre": "J.R.R. Tolkien" }
    }
  ],
  "total": 1
}
```

---

### GET /api/libros/categoria/:categoriaId
Obtener libros por categoría.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "El Señor de los Anillos",
      "ratingPromedio": 4.8
    }
  ]
}
```

---

### GET /api/libros/estrellas
Filtrar libros por rating mínimo.

**Query Parameters:**
- `min`: Rating mínimo (1-5)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "El Señor de los Anillos",
      "ratingPromedio": 4.8
    }
  ]
}
```

---

### GET /api/libros/nuevos
Obtener nuevos lanzamientos.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Nuevo Libro",
      "fechaPublicacion": "2025-01-15",
      "portada": "url"
    }
  ]
}
```

---

### GET /api/libros/:id
Obtener libro por ID.

**Response (200):**
```json
{
  "id": 1,
  "titulo": "El Señor de los Anillos",
  "sinopsis": "En la Tierra Media...",
  "autor": { "id": 1, "nombre": "J.R.R. Tolkien" },
  "categoria": { "id": 1, "nombre": "Fantasía" },
  "ratingPromedio": 4.8,
  "totalResenas": 150,
  "resenas": []
}
```

---

### GET /api/libros/slug/:slug
Obtener libro por slug.

**Response (200):** Mismo formato que GET /:id

---

### GET /api/libros/:id/reviews
Obtener reseñas de un libro.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "contenido": "Excelente libro...",
      "estrellas": 5,
      "usuario": { "nombre": "Juan", "avatar": "url" },
      "fecha": "2025-01-10"
    }
  ]
}
```

---

### POST /api/libros
Crear nuevo libro (Admin).

**Request:**
```json
{
  "titulo": "Nuevo Libro",
  "sinopsis": "Sinopsis del libro",
  "autorId": 1,
  "categoriaId": 1,
  "editorialId": 1
}
```

**Response (201):**
```json
{
  "id": 1,
  "titulo": "Nuevo Libro",
  "message": "Libro creado exitosamente"
}
```

---

### PUT /api/libros/:id
Actualizar libro (Admin).

**Request:** Mismo formato que POST, campos opcionales.

**Response (200):**
```json
{
  "message": "Libro actualizado exitosamente"
}
```

---

### DELETE /api/libros/:id
Eliminar libro (Admin).

**Response (200):**
```json
{
  "message": "Libro eliminado exitosamente"
}
```

---

## 👤 Endpoints de Usuarios

### GET /api/usuario/me
Obtener usuario actual autenticado.

**Response (200):**
```json
{
  "id": 1,
  "nombre": "Demo",
  "apellido": "Usuario",
  "email": "demo@biblioteca.com",
  "tipo": "USUARIO",
  "avatar": "url",
  "fechaRegistro": "2025-01-01"
}
```

---

### PUT /api/usuario/me
Actualizar perfil propio.

**Request:**
```json
{
  "nombre": "Nuevo Nombre",
  "apellido": "Nuevo Apellido",
  "avatar": "nueva_url"
}
```

**Response (200):**
```json
{
  "message": "Perfil actualizado correctamente"
}
```

---

### GET /api/usuario/perfil/:userId
Obtener perfil público de usuario.

**Response (200):**
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "avatar": "url",
  "biografia": "Amante de los libros",
  "totalResenas": 25,
  "totalListas": 5
}
```

---

### GET /api/usuario/
Obtener todos los usuarios (Admin).

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@email.com",
      "tipo": "USUARIO"
    }
  ],
  "total": 50
}
```

---

## ✍️ Endpoints de Reseñas

### GET /api/resena
Obtener todas las reseñas (con filtros opcionales).

**Query Parameters:**
- `libroId`: Filtrar por libro
- `usuarioId`: Filtrar por usuario
- `aprobada`: true/false (pendiente)
- `limit`, `offset`: Paginación

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "contenido": "Excelente libro...",
      "estrellas": 5,
      "aprobada": true,
      "usuario": { "id": 1, "nombre": "Juan" },
      "libro": { "id": 1, "titulo": "El Señor de los Anillos" },
      "fecha": "2025-01-10"
    }
  ],
  "total": 100
}
```

---

### GET /api/resena/populares
Obtener reseñas más populares/mejores valoradas.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "contenido": "...",
      "estrellas": 5,
      "likes": 25
    }
  ]
}
```

---

### GET /api/resena/:id
Obtener reseña por ID.

**Response (200):**
```json
{
  "id": 1,
  "contenido": "Excelente libro...",
  "estrellas": 5,
  "aprobada": true,
  "rechazada": false,
  "motivoRechazo": null,
  "usuario": { "id": 1, "nombre": "Juan" },
  "libro": { "id": 1, "titulo": "El Señor de los Anillos" },
  "respuestas": [],
  "fecha": "2025-01-10"
}
```

---

### POST /api/resena
Crear nueva reseña.

**Request:**
```json
{
  "libroId": 1,
  "contenido": "Excelente libro, muy recomendable...",
  "estrellas": 5
}
```

**Response (201):**
```json
{
  "id": 1,
  "message": "Reseña creada exitosamente. Pendiente de aprobación.",
  "resena": {
    "id": 1,
    "contenido": "...",
    "estrellas": 5,
    "aprobada": false
  }
}
```

---

### PUT /api/resena/:id
Actualizar reseña propia.

**Request:** Campos a actualizar.

**Response (200):**
```json
{
  "message": "Reseña actualizada"
}
```

---

### DELETE /api/resena/:id
Eliminar reseña propia.

**Response (200):**
```json
{
  "message": "Reseña eliminada"
}
```

---

### POST /api/resena/:id/responder
Responder a una reseña.

**Request:**
```json
{
  "contenido": "Totalmente de acuerdo..."
}
```

**Response (201):**
```json
{
  "id": 2,
  "message": "Respuesta publicada"
}
```

---

### PUT /api/resena/:id/approve
Aprobar reseña (Admin/Moderador).

**Response (200):**
```json
{
  "message": "Reseña aprobada exitosamente"
}
```

---

### PUT /api/resena/:id/reject
Rechazar reseña (Admin/Moderador).

**Request:**
```json
{
  "motivoRechazo": "Contenido inapropiado"
}
```

**Response (200):**
```json
{
  "message": "Reseña rechazada"
}
```

---

### GET /api/resena/admin/moderation/stats
Estadísticas de moderación (Admin).

**Response (200):**
```json
{
  "pendientes": 5,
  "aprobadasHoy": 10,
  "rechazadasHoy": 2,
  "total": 100
}
```

---

## 📋 Endpoints de Listas

### GET /api/lista
Obtener listas propias.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Mis Favoritos",
      "tipo": "FAVORITOS",
      "publica": true,
      "libros": [
        { "id": 1, "titulo": "El Señor de los Anillos" }
      ]
    }
  ]
}
```

---

### GET /api/lista/:id
Obtener lista por ID.

**Response (200):**
```json
{
  "id": 1,
  "nombre": "Mis Favoritos",
  "descripcion": "Los mejores libros que he leído",
  "tipo": "FAVORITOS",
  "publica": true,
  "libros": [],
  "fechaCreacion": "2025-01-01"
}
```

---

### POST /api/lista
Crear nueva lista.

**Request:**
```json
{
  "nombre": "Libros de Fantasía",
  "descripcion": "Mejor literatura fantástica",
  "tipo": "PERSONAL",
  "publica": true
}
```

**Response (201):**
```json
{
  "id": 1,
  "message": "Lista creada exitosamente"
}
```

---

### PUT /api/lista/:id
Actualizar lista.

**Request:** Campos a actualizar.

**Response (200):**
```json
{
  "message": "Lista actualizada"
}
```

---

### PUT /api/lista/:id/reordenar
Reordenar libros en lista.

**Request:**
```json
{
  "libroIds": [2, 1, 3]
}
```

**Response (200):**
```json
{
  "message": "Lista reordenada"
}
```

---

### DELETE /api/lista/:id
Eliminar lista.

**Response (200):**
```json
{
  "message": "Lista eliminada"
}
```

---

### GET /api/contenido-lista/:listaId
Obtener contenido de una lista.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "libro": { "id": 1, "titulo": "El Señor de los Anillos" },
      "orden": 0,
      "fechaAgregado": "2025-01-01"
    }
  ]
}
```

---

### POST /api/contenido-lista
Agregar libro a lista.

**Request:**
```json
{
  "listaId": 1,
  "libroId": 1
}
```

**Response (201):**
```json
{
  "message": "Libro agregado a la lista"
}
```

---

### DELETE /api/contenido-lista/:listaId/:libroId
Quitar libro de lista.

**Response (200):**
```json
{
  "message": "Libro eliminado de la lista"
}
```

---

## ❤️ Endpoints de Favoritos

### GET /api/favoritos/mis-favoritos
Obtener libros favoritos.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "libro": {
        "id": 1,
        "titulo": "El Señor de los Anillos",
        "autor": { "nombre": "J.R.R. Tolkien" }
      },
      "fechaAgregado": "2025-01-01"
    }
  ]
}
```

---

### POST /api/favoritos
Agregar a favoritos.

**Request:**
```json
{
  "libroId": 1
}
```

**Response (201):**
```json
{
  "message": "Libro agregado a favoritos"
}
```

---

### DELETE /api/favoritos/:favoritoId
Quitar de favoritos.

**Response (200):**
```json
{
  "message": "Eliminado de favoritos"
}
```

---

## 👍 Endpoints de Reacciones

### GET /api/reaccion/resena/:resenaId
Obtener reacciones de una reseña.

**Response (200):**
```json
{
  "data": [
    {
      "tipo": "LIKE",
      "cantidad": 10
    },
    {
      "tipo": "HELPFUL",
      "cantidad": 5
    }
  ],
  "miReaccion": "LIKE"
}
```

---

### POST /api/reaccion
Agregar/actualizar reacción.

**Request:**
```json
{
  "resenaId": 1,
  "tipo": "LIKE"
}
```

**Response (201):**
```json
{
  "message": "Reacción registrada"
}
```

---

### DELETE /api/reaccion/:usuarioId/:resenaId
Eliminar reacción.

**Response (200):**
```json
{
  "message": "Reacción eliminada"
}
```

---

## 👥 Endpoints de Seguimiento

### POST /api/seguimiento/follow
Seguir a un usuario.

**Request:**
```json
{
  "seguidoId": 2
}
```

**Response (201):**
```json
{
  "message": "Ahora sigues a este usuario"
}
```

---

### DELETE /api/seguimiento/unfollow/:seguidoId
Dejar de seguir.

**Response (200):**
```json
{
  "message": "Has dejado de seguir a este usuario"
}
```

---

### GET /api/seguimiento/seguidos
Obtener usuarios que sigues.

**Response (200):**
```json
{
  "data": [
    {
      "id": 2,
      "nombre": "Maria",
      "avatar": "url"
    }
  ]
}
```

---

### GET /api/seguimiento/seguidores/:usuarioId
Obtener seguidores de un usuario.

**Response (200):**
```json
{
  "data": [
    {
      "id": 3,
      "nombre": "Pedro",
      "avatar": "url"
    }
  ]
}
```

---

### GET /api/seguimiento/counts/:userId
Obtener counts de seguimiento.

**Response (200):**
```json
{
  "seguidores": 15,
  "seguidos": 20
}
```

---

### GET /api/seguimiento/is-following/:seguidoId
Verificar si sigues a un usuario.

**Response (200):**
```json
{
  "siguiendo": true
}
```

---

## 🔔 Endpoints de Notificaciones

### GET /api/notificacion
Obtener notificaciones del usuario.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "tipo": "RESENA_APROBADA",
      "mensaje": "Tu reseña ha sido aprobada",
      "leida": false,
      "fecha": "2025-01-10"
    }
  ],
  "totalNoLeidas": 3
}
```

---

### GET /api/notificacion/count
Contar notificaciones no leídas.

**Response (200):**
```json
{
  "count": 3
}
```

---

### PATCH /api/notificacion/:id/leida
Marcar notificación como leída.

**Response (200):**
```json
{
  "message": "Notificación marcada como leída"
}
```

---

### PATCH /api/notificacion/marcar-todas-leidas
Marcar todas como leídas.

**Response (200):**
```json
{
  "message": "Todas las notificaciones marcadas como leídas"
}
```

---

### DELETE /api/notificacion/:id
Eliminar notificación.

**Response (200):**
```json
{
  "message": "Notificación eliminada"
}
```

---

## 📊 Endpoints de Votaciones

### POST /api/votacion
Votar por un libro.

**Request:**
```json
{
  "libroId": 1
}
```

**Response (201):**
```json
{
  "message": "Voto registrado",
  "totalVotos": 150
}
```

---

### DELETE /api/votacion/:libroId
Eliminar voto.

**Response (200):**
```json
{
  "message": "Voto eliminado"
}
```

---

### GET /api/votacion/estadisticas/:libroId
Obtener estadísticas de votación.

**Response (200):**
```json
{
  "totalVotos": 150,
  "promedio": 4.2,
  "distribucion": {
    "1": 5,
    "2": 10,
    "3": 20,
    "4": 45,
    "5": 70
  }
}
```

---

### GET /api/votacion/top
Obtener libros más votados.

**Response (200):**
```json
{
  "data": [
    {
      "libro": { "id": 1, "titulo": "El Señor de los Anillos" },
      "totalVotos": 150
    }
  ]
}
```

---

## 📰 Endpoints de Newsletter

### POST /api/newsletter/subscribe
Suscribirse al newsletter.

**Request:**
```json
{
  "email": "usuario@email.com"
}
```

**Response (201):**
```json
{
  "message": "Suscripto al newsletter"
}
```

---

### POST /api/newsletter/unsubscribe
Desuscribirse.

**Request:**
```json
{
  "email": "usuario@email.com"
}
```

**Response (200):**
```json
{
  "message": "Desuscripto del newsletter"
}
```

---

### GET /api/newsletter/subscriptions
Obtener suscripciones (Admin).

**Response (200):**
```json
{
  "data": [
    { "email": "usuario@email.com", "fecha": "2025-01-01" }
  ]
}
```

---

## 👨‍💼 Endpoints de Admin

### GET /api/stats
Estadísticas generales del sistema.

**Response (200):**
```json
{
  "totalUsuarios": 250,
  "totalLibros": 1500,
  "totalResenas": 3000,
  "totalListas": 150
}
```

---

### GET /api/stats/detailed
Estadísticas detalladas.

**Response (200):**
```json
{
  "usuariosActivos": 180,
  "resenasUltimaSemana": 50,
  "librosAgregadosEsteMes": 20,
  "actividadPorDia": []
}
```

---

## 🌐 Endpoints Externos

### GET /api/google-books/buscar
Buscar libros en Google Books.

**Query Parameters:**
- `q`: Término de búsqueda

**Response (200):**
```json
{
  "data": [
    {
      "externalId": "google_books_id",
      "titulo": "El Señor de los Anillos",
      "autores": ["J.R.R. Tolkien"],
      "portada": "url",
      "sinopsis": "..."
    }
  ]
}
```

---

### GET /api/external-author/search-author
Buscar autores externos.

**Query Parameters:**
- `q`: Término de búsqueda

**Response (200):**
```json
{
  "data": [
    {
      "id": "external_id",
      "nombre": "J.R.R. Tolkien",
      "biografia": "...",
      "foto": "url"
    }
  ]
}
```

---

## ❌ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - No tiene permisos |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Error de validación |
| 500 | Internal Server Error - Error del servidor |

---

**Última actualización:** 25 de Enero de 2026

