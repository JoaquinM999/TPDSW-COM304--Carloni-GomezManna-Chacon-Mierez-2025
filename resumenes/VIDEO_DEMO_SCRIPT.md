# 🎬 Script para Video Demo - DSW

**Proyecto:** Sistema de Gestión de Biblioteca  
**Duración:** 8-10 minutos  
**Requisito:** Aprobación Directa DSW  
**Fecha:** 25 de Enero de 2026

---

## 📋 Preparación Antes de Grabar

### Setup Técnico
- [ ] Backend corriendo (`npm run dev`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Usuarios de demo creados
- [ ] Datos de prueba cargados (libros, autores, sagas)
- [ ] Navegador en modo incógnito (para login limpio)
- [ ] Resolución de pantalla: 1920x1080
- [ ] Grabador de pantalla: OBS Studio / QuickTime / Loom

### Navegador Preparado
- [ ] Zoom al 100%
- [ ] Extensions desactivadas (excepto React DevTools si es necesario)
- [ ] Console limpia (F12 → Console → Clear)
- [ ] No hay errores en consola
- [ ] URLs preparadas en pestañas

### Audio
- [ ] Micrófono funciona correctamente
- [ ] Sin ruido de fondo
- [ ] Tono claro y profesional
- [ ] Velocidad moderada (no muy rápido)

---

## 🎯 Estructura del Video

### Timing Aproximado
1. Introducción: 1 min
2. Demo Usuario Normal: 2.5 min
3. Demo Moderador: 2 min
4. Demo Administrador: 1.5 min
5. Aspectos Técnicos: 2 min
6. Cierre: 1 min

**Total:** 10 minutos

---

## 📝 Script Detallado

### ESCENA 1: Introducción (1 min)

**[Pantalla: Home Page sin login]**

```
🎤 TEXTO:
"Hola, soy [Nombre] del equipo [Carloni, Gomez Manna, Chacon, Mierez].
Les presentamos nuestro Trabajo Práctico de Desarrollo de Software:
un Sistema de Gestión de Biblioteca con funcionalidades sociales.

El sistema permite a los usuarios:
- Gestionar su colección de libros leídos
- Escribir y compartir reseñas
- Crear listas personalizadas
- Interactuar con otros lectores
- Y administradores pueden moderar el contenido

El proyecto está desarrollado con:
- Backend: Node.js, TypeScript, MikroORM, PostgreSQL
- Frontend: React, TypeScript, TailwindCSS
- Testing: 756 tests automatizados con Vitest y Playwright

Vamos a explorar las principales funcionalidades desde 3 roles diferentes."
```

**Acciones:**
- Mostrar home page brevemente
- Hover sobre navegación
- Scroll suave mostrando libros destacados

---

### ESCENA 2: Usuario Normal (2.5 min)

#### 2.1 Login (15 seg)

**[Pantalla: Login Page]**

```
🎤 TEXTO:
"Comencemos iniciando sesión como usuario normal."
```

**Acciones:**
```
1. Click en "Iniciar Sesión" (navbar)
2. Escribir: demo@biblioteca.com
3. Escribir: Demo123!
4. Click en "Iniciar Sesión"
5. Mostrar redirección a home con nombre de usuario
```

**[Mostrar brevemente]:** Navbar actualizado con avatar y nombre

---

#### 2.2 Búsqueda y Detalle de Libro (30 seg)

**[Pantalla: Home Page logueado]**

```
🎤 TEXTO:
"Como usuario puedo buscar libros en el catálogo.
Voy a buscar 'El Señor de los Anillos'."
```

**Acciones:**
```
1. Click en barra de búsqueda
2. Escribir: "señor de los anillos"
3. Mostrar resultados filtrándose en tiempo real
4. Click en "El Señor de los Anillos: La Comunidad del Anillo"
5. Mostrar página de detalle completa:
   - Portada, título, autor
   - Sinopsis
   - Rating promedio
   - Reseñas de otros usuarios
```

---

#### 2.3 Crear Reseña (45 seg)

**[Pantalla: Detalle de Libro - Sección Reseñas]**

```
🎤 TEXTO:
"Voy a escribir una reseña de este libro.
El sistema me permite calificarlo con estrellas y escribir mi opinión."
```

**Acciones:**
```
1. Scroll hasta sección "Escribe tu reseña"
2. Click en 5 estrellas (mostrar hover effect)
3. Escribir en textarea:
   "Una obra maestra de la fantasía épica. Tolkien creó un mundo
    increíblemente detallado con personajes memorables. La comunidad
    del anillo es solo el comienzo de una aventura inolvidable.
    Altamente recomendado para cualquier amante de la fantasía."
4. Click en "Publicar Reseña"
5. Mostrar mensaje de éxito: "Reseña enviada para moderación"
6. Mostrar que la reseña aparece en la lista con badge "Pendiente"
```

**[Destacar]:** Sistema de moderación automática

---

#### 2.4 Interacción con Reseñas (30 seg)

**[Pantalla: Misma página - Otras reseñas]**

```
🎤 TEXTO:
"También puedo interactuar con reseñas de otros usuarios:
darles 'me gusta', responder, o marcarlas como útiles."
```

**Acciones:**
```
1. Scroll a reseña de otro usuario (ya aprobada)
2. Click en botón "Me gusta" (❤️) - mostrar contador incrementar
3. Click en "Responder"
4. Escribir: "Totalmente de acuerdo, excelente análisis!"
5. Click en "Publicar respuesta"
6. Mostrar respuesta anidada bajo reseña original
```

---

#### 2.5 Crear Lista Personalizada (30 seg)

**[Pantalla: Perfil de Usuario]**

```
🎤 TEXTO:
"Los usuarios pueden crear listas personalizadas para organizar sus libros.
Voy a crear una lista de 'Libros de Fantasía Épica'."
```

**Acciones:**
```
1. Click en avatar → "Mi Perfil"
2. Click en tab "Mis Listas"
3. Click en "Crear Lista"
4. Formulario:
   - Nombre: "Fantasía Épica Imprescindible"
   - Descripción: "Los mejores libros del género de fantasía épica"
   - Tipo: "Personal"
   - Pública: ✓ (checked)
5. Click en "Crear"
6. Click en "Agregar Libros"
7. Buscar y seleccionar:
   - El Señor de los Anillos
   - El Nombre del Viento
   - La Saga de Geralt de Rivia
8. Click en "Guardar"
9. Mostrar lista creada con 3 libros
```

---

### ESCENA 3: Moderador (2 min)

#### 3.1 Login como Moderador (10 seg)

**[Pantalla: Cerrar sesión → Login]**

```
🎤 TEXTO:
"Ahora veamos las funcionalidades del moderador."
```

**Acciones:**
```
1. Click en avatar → "Cerrar Sesión"
2. Login con:
   - moderador@biblioteca.com
   - Mod123!
```

---

#### 3.2 Panel de Moderación (50 seg)

**[Pantalla: Dashboard de Moderación]**

```
🎤 TEXTO:
"Los moderadores tienen acceso a un panel especial donde pueden
revisar todas las reseñas pendientes de aprobación."
```

**Acciones:**
```
1. Click en "Moderación" (navbar - solo visible para moderadores)
2. Mostrar dashboard:
   - Contador: "5 reseñas pendientes"
   - Tabla con reseñas para revisar
3. Click en primera reseña pendiente
4. Mostrar vista de detalle:
   - Contenido completo
   - Rating
   - Usuario que la escribió
   - Libro asociado
   - Botones: Aprobar / Rechazar / Ver contexto
```

---

#### 3.3 Aprobar/Rechazar Reseñas (60 seg)

**[Pantalla: Detalle de Reseña Pendiente]**

```
🎤 TEXTO:
"El moderador puede aprobar reseñas que cumplen las normas,
o rechazarlas con una razón específica."
```

**Acciones:**
```
1. Reseña 1 (buena calidad):
   - Leer contenido en voz alta (resumen breve)
   - Click en "Aprobar"
   - Mostrar mensaje: "Reseña aprobada exitosamente"
   - Mostrar que desaparece de lista de pendientes

2. Volver a lista de pendientes

3. Reseña 2 (spam o baja calidad):
   - Mostrar contenido: "asdgfdsfgds" o "Libro malo"
   - Click en "Rechazar"
   - Formulario de rechazo:
     - Razón: "Contenido de baja calidad / spam"
     - Comentario: "La reseña debe tener al menos 50 caracteres
                     y aportar valor a otros lectores."
   - Click en "Confirmar Rechazo"
   - Mostrar mensaje: "Reseña rechazada. Usuario notificado."

4. Mostrar contador actualizado: "3 reseñas pendientes"
```

---

### ESCENA 4: Administrador (1.5 min)

#### 4.1 Login como Admin (10 seg)

**[Pantalla: Cerrar sesión → Login]**

```
🎤 TEXTO:
"Finalmente, el rol de administrador tiene acceso completo al sistema."
```

**Acciones:**
```
1. Logout
2. Login con:
   - admin@biblioteca.com
   - Admin123!
```

---

#### 4.2 Panel de Administración (40 seg)

**[Pantalla: Dashboard Admin]**

```
🎤 TEXTO:
"El administrador puede gestionar todos los aspectos del sistema:
usuarios, libros, autores, sagas, y moderar contenido."
```

**Acciones:**
```
1. Click en "Admin" (navbar)
2. Mostrar dashboard con métricas:
   - Total usuarios: 247
   - Total libros: 1,532
   - Reseñas activas: 3,894
   - Listas creadas: 156
3. Mostrar menú lateral:
   - Gestión de Usuarios
   - Gestión de Libros
   - Gestión de Autores
   - Gestión de Sagas
   - Moderación Avanzada
   - Configuración del Sistema
```

---

#### 4.3 Gestionar Usuarios (40 seg)

**[Pantalla: Gestión de Usuarios]**

```
🎤 TEXTO:
"Vamos a ver la gestión de usuarios. El admin puede editar roles,
suspender cuentas, o eliminar usuarios si es necesario."
```

**Acciones:**
```
1. Click en "Gestión de Usuarios"
2. Mostrar tabla con usuarios:
   - Filtros: por rol, estado, fecha registro
   - Buscador
3. Buscar: "demo"
4. Click en usuario "demo@biblioteca.com"
5. Mostrar perfil completo:
   - Información personal
   - Rol actual
   - Fecha de registro
   - Estadísticas (reseñas, listas, likes)
6. Click en "Editar"
7. Cambiar rol de "Usuario" a "Moderador" (dropdown)
8. Click en "Guardar Cambios"
9. Mostrar mensaje: "Usuario actualizado exitosamente"
10. Volver a tabla y mostrar rol actualizado
```

---

### ESCENA 5: Aspectos Técnicos (2 min)

#### 5.1 Consola de Desarrollador (30 seg)

**[Pantalla: Cualquier página + DevTools abierto]**

```
🎤 TEXTO:
"Desde el punto de vista técnico, el sistema está construido
con las mejores prácticas de desarrollo."
```

**Acciones:**
```
1. Presionar F12 (abrir DevTools)
2. Tab "Console":
   - Mostrar que no hay errores
   - Mostrar logs limpios de las acciones
3. Tab "Network":
   - Hacer una acción (ej: crear reseña)
   - Mostrar requests a API:
     - POST /api/resenas (201 Created)
     - Response time: ~150ms
     - Headers: JWT token
4. Tab "Application" → "Local Storage":
   - Mostrar authToken almacenado
```

---

#### 5.2 Responsive Design (30 seg)

**[Pantalla: DevTools → Toggle Device Toolbar]**

```
🎤 TEXTO:
"La aplicación es completamente responsive, adaptándose a
diferentes tamaños de pantalla: desktop, tablet y móvil."
```

**Acciones:**
```
1. Click en "Toggle Device Toolbar" (Ctrl+Shift+M)
2. Cambiar entre dispositivos:
   - iPhone 12 Pro (390x844) - Mobile
   - iPad (768x1024) - Tablet
   - Responsive (1920x1080) - Desktop
3. Navegar por:
   - Home
   - Detalle de libro
   - Perfil
   - Mostrar cómo cambia el layout en cada breakpoint
4. Destacar:
   - Hamburger menu en mobile
   - Grid adaptativo de libros
   - Sidebar colapsable en tablet
```

---

#### 5.3 Testing (30 seg)

**[Pantalla: Terminal + VSCode]**

```
🎤 TEXTO:
"El proyecto cuenta con una suite de tests robusta:
756 tests unitarios y de integración, más tests E2E con Playwright."
```

**Acciones:**
```
1. Mostrar terminal con output de tests:
   ```
   ✓ Backend/src/__tests__ (620 tests) 12.5s
     ✓ services (245 tests)
     ✓ controllers (198 tests)
     ✓ repositories (177 tests)
   
   ✓ Frontend/src/__tests__ (136 tests) 8.2s
     ✓ components (89 tests)
     ✓ hooks (32 tests)
     ✓ services (15 tests)
   
   Test Files  89 passed (89)
        Tests  756 passed (756)
   ```

2. Mostrar archivo de test E2E:
   ```typescript
   // Frontend/e2e/resena-flow.spec.ts
   test('crear reseña completo', async ({ page }) => {
     await page.goto('/login');
     // ... test completo
   });
   ```

3. Mostrar coverage report (si está generado):
   - Backend: 87% coverage
   - Frontend: 82% coverage
```

---

#### 5.4 Arquitectura (30 seg)

**[Pantalla: VSCode - Estructura de carpetas]**

```
🎤 TEXTO:
"El proyecto sigue una arquitectura en capas limpia y mantenible."
```

**Acciones:**
```
1. Mostrar estructura del Backend:
   Backend/
   ├── src/
   │   ├── entities/       (Modelos de datos)
   │   ├── repositories/   (Acceso a datos)
   │   ├── services/       (Lógica de negocio)
   │   ├── controllers/    (Endpoints REST)
   │   ├── middleware/     (Auth, validación, errores)
   │   └── routes/         (Definición de rutas)

2. Mostrar estructura del Frontend:
   Frontend/
   ├── src/
   │   ├── componentes/    (UI components)
   │   ├── paginas/        (Pages/Views)
   │   ├── services/       (API calls)
   │   ├── hooks/          (Custom hooks)
   │   └── contexts/       (Estado global)

3. Destacar:
   - Separación de responsabilidades
   - Inyección de dependencias
   - Principios SOLID aplicados
```

---

### ESCENA 6: Cierre (1 min)

**[Pantalla: Home Page o Dashboard]**

```
🎤 TEXTO:
"En resumen, desarrollamos un sistema completo de gestión de biblioteca
que cumple con todos los requisitos de Desarrollo de Software:

Técnicamente:
- ✅ 9 de 9 requisitos backend para Regularidad
- ✅ 6 de 6 requisitos backend para Aprobación Directa
- ✅ 16 de 16 requisitos frontend para Regularidad
- ✅ 5 de 5 requisitos frontend para Aprobación Directa

Funcionalmente:
- ✅ 7 CRUDs completos (más de 4 requeridos)
- ✅ 8 listados con filtros
- ✅ 4 Casos de Uso Únicos (reseñas, listas, moderación, notificaciones)
- ✅ 756 tests automatizados (155x más que el mínimo)

El proyecto está deployado y funcionando en producción.

Documentación completa y código fuente disponible en nuestro repositorio.

Gracias por su atención."
```

**Acciones:**
```
1. Mostrar URLs finales:
   - Frontend: https://biblioteca-dsw.vercel.app
   - Backend: https://biblioteca-api.onrender.com
   - GitHub: github.com/usuario/TPDSW-...

2. Mostrar credenciales de demo en pantalla:
   Usuario: demo@biblioteca.com / Demo123!
   Moderador: moderador@biblioteca.com / Mod123!
   Admin: admin@biblioteca.com / Admin123!

3. Fade out suave
```

---

## 🎬 Consejos de Grabación

### DO's ✅
- Hablar claro y pausado
- Mostrar funcionalidades completas (inicio a fin)
- Destacar aspectos técnicos solicitados por DSW
- Usar transiciones suaves entre secciones
- Mostrar que no hay errores en consola
- Probar todas las acciones antes de grabar

### DON'Ts ❌
- No ir demasiado rápido
- No dejar la pantalla estática mucho tiempo
- No mostrar datos personales reales
- No grabar con errores en consola
- No improvisar (seguir el script)
- No grabar en una sola toma (editar después)

---

## 🛠️ Herramientas de Edición

### Grabar
- **OBS Studio** (gratis, multiplataforma)
- **QuickTime** (Mac, nativo)
- **Loom** (web, muy simple)
- **ShareX** (Windows, gratis)

### Editar
- **DaVinci Resolve** (gratis, profesional)
- **iMovie** (Mac, nativo)
- **Shotcut** (gratis, multiplataforma)
- **Camtasia** (pago, muy completo)

### Añadir Elementos
- Títulos/Subtítulos en cada sección
- Zoom in cuando sea necesario
- Resaltar cursor cuando sea relevante
- Música de fondo suave (opcional)
- Intro/Outro con nombres y URLs

---

## 📤 Entrega Final

### Formato del Video
- **Formato:** MP4 (H.264)
- **Resolución:** 1920x1080 (Full HD)
- **FPS:** 30
- **Bitrate:** 5-10 Mbps
- **Audio:** AAC, 128-192 kbps

### Dónde Subir
- **YouTube** (unlisted) → Compartir link
- **Google Drive** → Dar permisos de visualización
- **Vimeo** (privado con password)

### Incluir en README.md

```markdown
## 🎥 Video Demo

**Link:** [Ver Video Demo](https://youtube.com/watch?v=xxx)
**Duración:** 10 minutos
**Contenido:**
- Demostración de funcionalidades principales
- 3 roles: Usuario, Moderador, Administrador
- Aspectos técnicos (tests, arquitectura, responsive)
- Credenciales de prueba incluidas
```

---

## ✅ Checklist Pre-Grabación

- [ ] Script leído y practicado
- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo sin errores
- [ ] Usuarios demo creados y verificados
- [ ] Datos de prueba cargados
- [ ] Navegador limpio (no tabs innecesarias)
- [ ] Micrófono testeado
- [ ] Grabador de pantalla configurado
- [ ] Resolución 1920x1080
- [ ] Notificaciones del sistema desactivadas
- [ ] Modo "No Molestar" activado

---

## ✅ Checklist Post-Grabación

- [ ] Video renderizado en Full HD
- [ ] Audio sincronizado correctamente
- [ ] Transiciones suaves entre secciones
- [ ] Títulos/Subtítulos añadidos
- [ ] URLs y credenciales mostradas claramente
- [ ] Duración entre 8-12 minutos
- [ ] Subido a plataforma elegida
- [ ] Link incluido en README.md
- [ ] Link compartido con equipo
- [ ] Link incluido en entrega DSW

---

**Última actualización:** 25 de enero de 2026  
**Tiempo estimado de grabación:** 30-60 minutos  
**Tiempo estimado de edición:** 1-2 horas  
**Dificultad:** Media
