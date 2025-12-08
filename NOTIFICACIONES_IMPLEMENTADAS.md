# 🔔 Sistema de Notificaciones - Implementado

**Fecha:** 7 de Diciembre de 2025  
**Estado:** ✅ BACKEND COMPLETO | 🔨 FRONTEND EN PROGRESO

---

## ✅ Lo que se implementó

### Backend (100% Completo)

#### 1. Entidad Notificación
**Archivo:** `Backend/src/entities/notificacion.entity.ts`

```typescript
export enum TipoNotificacion {
  NUEVA_RESENA           // Alguien reseñó un libro que te gusta
  NUEVA_REACCION         // Alguien reaccionó a tu reseña
  NUEVO_SEGUIDOR         // Alguien te empezó a seguir
  ACTIVIDAD_SEGUIDO      // Un usuario que sigues hizo algo
  RESPUESTA_RESENA       // Alguien respondió a tu reseña
  LIBRO_FAVORITO         // Actividad en libro de tus favoritos
}
```

**Campos:**
- `id` - Identificador único
- `usuario` - Relación con Usuario (a quién va la notificación)
- `tipo` - Enum de tipos de notificación
- `mensaje` - Texto de la notificación
- `leida` - Boolean (false por defecto)
- `data` - JSON con datos adicionales
- `url` - URL opcional para redirigir
- `createdAt` - Fecha de creación

#### 2. Servicio de Notificaciones
**Archivo:** `Backend/src/services/notificacion.service.ts`

**Métodos Principales:**
- ✅ `crearNotificacion()` - Crear notificación genérica
- ✅ `obtenerNotificaciones(usuarioId, limit)` - Obtener últimas notificaciones
- ✅ `contarNoLeidas(usuarioId)` - Contar notificaciones no leídas
- ✅ `marcarComoLeida(id, usuarioId)` - Marcar una como leída
- ✅ `marcarTodasComoLeidas(usuarioId)` - Marcar todas como leídas
- ✅ `eliminarNotificacion(id, usuarioId)` - Eliminar notificación
- ✅ `limpiarNotificacionesAntiguas()` - Limpiar +30 días

**Métodos Auxiliares:**
- ✅ `notificarNuevoSeguidor()` - "X comenzó a seguirte"
- ✅ `notificarNuevaReaccion()` - "X reaccionó 👍 a tu reseña"
- ✅ `notificarActividadSeguido()` - "X publicó una reseña de..."
- ✅ `notificarRespuestaResena()` - "X respondió a tu reseña"

#### 3. Controlador
**Archivo:** `Backend/src/controllers/notificacion.controller.ts`

**Endpoints Implementados:**
- `GET /api/notificaciones` - Obtener notificaciones (autenticado)
- `GET /api/notificaciones/count` - Contar no leídas (autenticado)
- `PATCH /api/notificaciones/:id/leida` - Marcar como leída
- `PATCH /api/notificaciones/marcar-todas-leidas` - Marcar todas
- `DELETE /api/notificaciones/:id` - Eliminar notificación

#### 4. Rutas
**Archivo:** `Backend/src/routes/notificacion.routes.ts`
- ✅ Todas las rutas protegidas con `authenticateJWT`
- ✅ Registradas en `app.ts` como `/api/notificaciones`

#### 5. Migración de Base de Datos
**Archivo:** `Backend/migrations/Migration20251207155739_add_notificaciones.ts`
- ✅ Tabla `notificacion` creada (ya existía)
- ✅ Índice en `usuario_id` para consultas rápidas
- ✅ Foreign key a tabla `usuario`

#### 6. Integración Automática
**Archivo:** `Backend/src/controllers/seguimiento.controller.ts`

**Modificado:** Cuando un usuario sigue a otro, automáticamente:
```typescript
await notificacionService.notificarNuevoSeguidor(
  usuarioSeguidoId,
  nombreSeguidor,
  seguidorId
);
```

---

### Frontend (80% Completo)

#### 1. Servicio de Notificaciones
**Archivo:** `Frontend/src/services/notificacionService.ts`

**Funciones Implementadas:**
- ✅ `obtenerNotificaciones(limit)` - Fetch notificaciones del usuario
- ✅ `contarNoLeidas()` - Obtener contador de no leídas
- ✅ `marcarComoLeida(id)` - Marcar una como leída
- ✅ `marcarTodasComoLeidas()` - Marcar todas
- ✅ `eliminarNotificacion(id)` - Eliminar una notificación
- ✅ `useNotificacionPolling(intervalMs)` - Hook para polling automático

**Interfaz TypeScript:**
```typescript
interface Notificacion {
  id: number;
  tipo: 'NUEVA_RESENA' | 'NUEVA_REACCION' | ...;
  mensaje: string;
  leida: boolean;
  data?: any;
  url?: string;
  createdAt: string;
}
```

#### 2. Componente NotificationBell (PENDIENTE)
**Archivo:** `Frontend/src/componentes/NotificationBell.tsx`

**Funcionalidades a Implementar:**
- 🔨 Icono de campana con badge de contador
- 🔨 Dropdown con lista de notificaciones
- 🔨 Marcar como leída al hacer click
- 🔨 Botón "Marcar todas como leídas"
- 🔨 Link a la URL de cada notificación
- 🔨 Polling automático cada 30 segundos
- 🔨 Animaciones con Framer Motion
- 🔨 Dark mode support

#### 3. Integración en Header (PENDIENTE)
**Archivo:** `Frontend/src/componentes/Header.tsx`

**Cambios a Realizar:**
- 🔨 Importar NotificationBell component
- 🔨 Agregar al lado del icono de usuario
- 🔨 Solo mostrar si usuario está autenticado

---

## 🚀 Cómo Funciona

### Flujo Backend

1. **Usuario A sigue a Usuario B**
   ```
   POST /api/seguimientos
   ↓
   seguimiento.controller.ts → followUser()
   ↓
   Crea Seguimiento en BD
   ↓
   notificacionService.notificarNuevoSeguidor(B, "A", idA)
   ↓
   Crea Notificacion en BD para Usuario B
   ```

2. **Usuario B consulta notificaciones**
   ```
   GET /api/notificaciones
   ↓
   notificacion.controller.ts → obtenerNotificaciones()
   ↓
   notificacionService.obtenerNotificaciones(idB, 20)
   ↓
   Retorna últimas 20 notificaciones de B
   ```

3. **Usuario B marca como leída**
   ```
   PATCH /api/notificaciones/:id/leida
   ↓
   notificacionService.marcarComoLeida(id, idB)
   ↓
   UPDATE notificacion SET leida = true WHERE id = :id
   ```

### Flujo Frontend (Cuando esté completo)

1. **Polling Automático**
   ```
   useEffect(() => {
     const interval = setInterval(async () => {
       const count = await contarNoLeidas();
       setBadgeCount(count);
     }, 30000); // Cada 30 segundos
     
     return () => clearInterval(interval);
   }, []);
   ```

2. **Usuario hace click en campana**
   ```
   onClick campana
   ↓
   const notifs = await obtenerNotificaciones(20);
   ↓
   Muestra dropdown con lista
   ```

3. **Usuario hace click en notificación**
   ```
   onClick notificacion
   ↓
   await marcarComoLeida(notif.id);
   ↓
   router.push(notif.url);
   ```

---

## 📊 Estado Actual

### Backend ✅ FUNCIONAL
- ✅ Base de datos lista
- ✅ Endpoints funcionando
- ✅ Autenticación configurada
- ✅ Integración en seguimiento
- ⚠️ Falta integrar en: reacciones, reseñas

### Frontend 🔨 EN PROGRESO
- ✅ Servicio listo
- 🔨 Componente NotificationBell pendiente
- 🔨 Integración en Header pendiente

---

## 🎯 Próximos Pasos

### 1. Crear Componente NotificationBell (30 min)

```tsx
// Frontend/src/componentes/NotificationBell.tsx
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { contarNoLeidas, obtenerNotificaciones } from '../services/notificacionService';

export const NotificationBell = () => {
  const [count, setCount] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Cargar contador inicial
    fetchCount();
    
    // Polling cada 30 segundos
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCount = async () => {
    const newCount = await contarNoLeidas();
    setCount(newCount);
  };

  const handleOpen = async () => {
    if (!isOpen) {
      const notifs = await obtenerNotificaciones(20);
      setNotificaciones(notifs);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative">
        <Bell size={24} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Lista de notificaciones */}
        </div>
      )}
    </div>
  );
};
```

### 2. Integrar en Header (5 min)

```tsx
// Frontend/src/componentes/Header.tsx
import { NotificationBell } from './NotificationBell';

// Dentro del header, cerca del icono de usuario:
{isAuthenticated && <NotificationBell />}
```

### 3. Integrar Notificaciones en Otros Controladores (OPCIONAL)

**reaccion.controller.ts:**
```typescript
// Al crear reacción
await notificacionService.notificarNuevaReaccion(
  autorResenaId,
  nombreUsuario,
  tipoReaccion,
  resenaId,
  libroTitulo
);
```

**resena.controller.ts:**
```typescript
// Al crear reseña
const seguidores = await getSeguidores(usuarioId);
for (const seguidor of seguidores) {
  await notificacionService.notificarActividadSeguido(
    seguidor.id,
    nombreUsuario,
    libroTitulo,
    libroId
  );
}
```

---

## 🧪 Testing

### Test Manual Backend

```bash
# 1. Seguir a un usuario
POST http://localhost:3000/api/seguimientos
Headers: Authorization: Bearer TOKEN
Body: { "seguidoId": 2 }

# 2. Ver notificaciones del usuario seguido
GET http://localhost:3000/api/notificaciones
Headers: Authorization: Bearer TOKEN_USUARIO_2

# 3. Contar no leídas
GET http://localhost:3000/api/notificaciones/count
Headers: Authorization: Bearer TOKEN_USUARIO_2

# 4. Marcar como leída
PATCH http://localhost:3000/api/notificaciones/1/leida
Headers: Authorization: Bearer TOKEN_USUARIO_2
```

---

## 💡 Mejoras Futuras (OPCIONAL)

1. **WebSockets para Notificaciones en Tiempo Real**
   - Socket.io en backend
   - Emit evento cuando se crea notificación
   - Frontend escucha y actualiza sin polling

2. **Preferencias de Notificaciones**
   - Permitir al usuario configurar qué notificaciones quiere recibir
   - Tabla `preferencias_notificacion` en BD

3. **Emails de Notificaciones**
   - Integrar con sistema de correos existente
   - Enviar resumen diario/semanal de notificaciones

4. **Notificaciones Push**
   - Service Workers
   - Push API del navegador
   - Notificaciones desktop

---

## 📝 Resumen

### ✅ Completado
- Backend 100% funcional
- Base de datos lista
- Endpoints configurados
- Servicio frontend implementado
- Integración en seguimiento

### 🔨 Pendiente
- Componente NotificationBell (30 min)
- Integración en Header (5 min)
- Integración en reacciones (15 min)
- Integración en reseñas (15 min)

### ⏱️ Tiempo Estimado Restante
**1-1.5 horas** para sistema completo y funcional

---

**¿Quieres que continúe con el componente NotificationBell?** 🔔
