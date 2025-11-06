# 📋 REQUISITOS PENDIENTES PARA APROBACIÓN - DSW 2025

**Fecha de última actualización:** 5 de Noviembre, 2025  
**Grupo:** COM304 - Carloni, Gomez Manna, Chacón, Mierez (4 integrantes)

---

## 🔴 CRÍTICO - REQUISITOS OBLIGATORIOS PARA APROBAR

### **BACKEND - Tests**

#### ✅ Configuración
- [x] Jest instalado y configurado
- [x] Scripts de test en package.json

#### ❌ Tests Faltantes (URGENTE)
- [ ] **Test unitario #1** - (Integrante: ________)
  - Ejemplo: Test de validación de usuario
  - Archivo: `Backend/src/__tests__/usuario.test.ts`
  
- [ ] **Test unitario #2** - (Integrante: ________)
  - Ejemplo: Test de creación de reseña
  - Archivo: `Backend/src/__tests__/resena.test.ts`
  
- [ ] **Test unitario #3** - (Integrante: ________)
  - Ejemplo: Test de favoritos
  - Archivo: `Backend/src/__tests__/favorito.test.ts`
  
- [ ] **Test unitario #4** - (Integrante: ________)
  - Ejemplo: Test de autenticación
  - Archivo: `Backend/src/__tests__/auth.test.ts`

- [ ] **Test de integración** (REQUERIDO)
  - Ejemplo: Test del flujo completo de crear reseña
  - Archivo: `Backend/src/__tests__/integration/resena.integration.test.ts`
  - Debe probar: API + Base de datos + Validaciones

---

### **FRONTEND - Tests**

#### ❌ Configuración de Testing (URGENTE)
- [ ] Instalar Vitest
  ```bash
  cd Frontend
  npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
  ```
- [ ] Configurar Vitest en `vite.config.ts`
- [ ] Agregar scripts de test en `package.json`

#### ❌ Tests Unitarios
- [ ] **Test de componente #1** (REQUERIDO mínimo)
  - Ejemplo: Test de componente de Reseña
  - Archivo: `Frontend/src/__tests__/componentes/Resena.test.tsx`
  - Verificar: Renderizado, props, eventos

#### ❌ Tests E2E (End-to-End)
- [ ] Instalar Playwright o Cypress
  ```bash
  cd Frontend
  npm install -D @playwright/test
  # O alternativamente
  npm install -D cypress
  ```
- [ ] **Test E2E #1** (REQUERIDO mínimo)
  - Ejemplo: Test del flujo de login completo
  - Archivo: `Frontend/e2e/login.spec.ts`
  - Flujo: Abrir app → Ir a login → Ingresar credenciales → Verificar dashboard

---

## 🟡 IMPORTANTE - Configuración de Ambientes

### **BACKEND - Variables de Entorno**

- [ ] Crear archivo `.env.example` en la raíz del proyecto
  ```env
  # Base de datos
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=usuario
  DB_PASSWORD=contraseña
  DB_NAME=nombre_db
  
  # JWT
  JWT_SECRET=tu_secret_key_aqui
  
  # APIs Externas
  GOOGLE_BOOKS_API_KEY=tu_api_key
  HARDCOVER_TOKEN=tu_token
  NEUTRINO_USER_ID=tu_user_id
  NEUTRINO_API_KEY=tu_api_key
  
  # Redis
  REDIS_URL=redis://localhost:6379
  CACHE_TTL=300
  
  # Ambiente
  NODE_ENV=development
  PORT=3000
  ```

- [ ] Documentar en README cómo configurar el `.env`
- [ ] Verificar que todas las variables tengan valores por defecto seguros

### **FRONTEND - Variables de Entorno**

- [ ] Crear archivo `.env.example` en Frontend/
  ```env
  VITE_API_URL=http://localhost:3000/api
  VITE_APP_NAME=BookCode
  VITE_ENV=development
  ```

- [ ] Configurar ambientes en Vite (dev/prod)
- [ ] Crear archivos `.env.development` y `.env.production`
- [ ] Actualizar código para usar `import.meta.env.VITE_*`

---

## ✅ VERIFICAR - Requisitos que parecen cumplidos

### **BACKEND**

- [x] Desarrollado en JavaScript/TypeScript ✅
- [x] Framework web (Express) ✅
- [x] API REST expuesta ✅
- [x] Base de datos persistente externa (MySQL) ✅
- [x] ORM/Mapper (MikroORM) ✅
- [x] Arquitectura por capas ✅
- [x] Login con autenticación (JWT) ✅
- [x] Al menos 2 niveles de acceso ✅
- [ ] **VERIFICAR:** Protección de rutas completa según nivel
- [ ] **VERIFICAR:** Validación de entrada en TODAS las rutas
- [ ] **VERIFICAR:** Manejo de errores consistente

### **FRONTEND**

- [x] Framework de Frontend (React + Vite) ✅
- [x] HTML5 ✅
- [x] CSS con framework (Tailwind) ✅
- [x] Mobile-first ✅
- [x] Responsive en 3 breakpoints ✅
- [x] Buenas prácticas UX/UI ✅
- [x] Manejo de eventos de usuario ✅
- [x] Manejo de errores ✅
- [x] Reactividad ante estado ✅
- [x] Props (Input/Output) ✅
- [x] Servicios implementados ✅
- [x] Modelos de datos (interfaces/types) ✅
- [ ] **VERIFICAR:** Protección de rutas por nivel de usuario
- [ ] **VERIFICAR:** Login implementado en frontend

---

## 📊 REQUISITOS FUNCIONALES

### **CRUDs Simples** (1 por integrante = 4)
- [x] CRUD Usuario ✅
- [x] CRUD Saga ✅
- [x] CRUD Reseña ✅
- [x] CRUD Autor ✅

### **CRUDs Dependientes** (1 cada 2 integrantes = 2)
- [x] Libro depende de Autor ✅
- [x] Saga depende de Libros ✅

### **Listados con Filtro** (1 cada 2 integrantes = 2)
- [x] Listado de libros por categoría ✅
- [x] Filtrado por calificación (estrellas) ✅

### **Casos de Uso** (2 relacionados mínimo)
- [x] Listas personalizadas (Leído, Ver más tarde, Pendientes) ✅
- [x] Sistema de reseñas con calificaciones ✅
- [x] Sistema de moderación automática de reseñas ✅
- [x] Reacciones a reseñas ✅
- [x] Recomendaciones personalizadas ✅

---

## 🎯 PLAN DE ACCIÓN SUGERIDO

### **Semana 1: Tests Backend**
1. **Día 1-2:** Cada integrante crea su test unitario
2. **Día 3-4:** Crear test de integración en conjunto
3. **Día 5:** Ejecutar todos los tests y corregir errores

### **Semana 2: Tests Frontend**
1. **Día 1-2:** Configurar Vitest y estructura de tests
2. **Día 3:** Crear test unitario de componente
3. **Día 4:** Configurar Playwright/Cypress
4. **Día 5:** Crear y ejecutar test E2E

### **Semana 3: Variables de Entorno y Verificación**
1. **Día 1:** Crear archivos .env.example
2. **Día 2:** Documentar configuración
3. **Día 3-4:** Verificar protección de rutas
4. **Día 5:** Testing general y correcciones finales

---

## 📝 NOTAS IMPORTANTES

### Tests Recomendados para Implementar:

**Backend:**
- Test de endpoints de autenticación (login/register)
- Test de validaciones de modelos
- Test de servicios (ej: filtro de malas palabras)
- Test de integración: Crear reseña → Moderar → Guardar

**Frontend:**
- Test de componente de tarjeta de libro
- Test de formulario de reseña
- Test E2E: Flujo completo de agregar un libro a favoritos
- Test E2E: Flujo de login y navegación

### Recursos Útiles:
- **Jest Documentation:** https://jestjs.io/
- **Vitest Documentation:** https://vitest.dev/
- **Testing Library:** https://testing-library.com/
- **Playwright:** https://playwright.dev/
- **Cypress:** https://www.cypress.io/

---

## ⚠️ RECORDATORIOS

1. **Los tests NO son opcionales para aprobar**
2. Cada test debe ser significativo (no solo `expect(true).toBe(true)`)
3. Los tests de integración deben probar el flujo completo
4. Los tests E2E deben simular interacción real de usuario
5. Documentar cómo ejecutar los tests en el README

---

## 🏁 CHECKLIST FINAL ANTES DE ENTREGAR

- [ ] Todos los tests pasan exitosamente
- [ ] Existe documentación de cómo ejecutar tests
- [ ] Los archivos `.env.example` están completos
- [ ] El README explica la configuración de ambiente
- [ ] La protección de rutas está verificada
- [ ] No hay credenciales hardcodeadas en el código
- [ ] El código está pusheado al repositorio
- [ ] Se probó el deploy en un ambiente limpio

---

**¡Éxito con el proyecto! 🚀**
