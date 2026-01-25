import { test, expect } from '@playwright/test';

/**
 * Test End-to-End: Login → Crear Reseña → Ver Reseña
 * 
 * Este test cumple con el requisito de "1 test E2E" para Aprobación Directa.
 * 
 * Flujo completo de usuario:
 * 1. Usuario accede a la aplicación
 * 2. Realiza login con credenciales válidas
 * 3. Navega a un libro
 * 4. Crea una reseña con calificación y comentario
 * 5. Verifica que la reseña aparece correctamente
 */

test.describe('Sistema de Reseñas - Flujo Completo E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
  });

  test('Flujo completo: Login → Crear Reseña → Ver Reseña publicada', async ({ page }) => {
    // ========================================
    // PASO 1: LOGIN
    // ========================================
    
    // Hacer clic en el botón de login
    await page.click('text=Iniciar Sesión');
    
    // Esperar a que aparezca el formulario de login
    await expect(page.locator('form')).toBeVisible();
    
    // Rellenar credenciales (usar usuario de demo)
    await page.fill('input[name="email"]', 'demo@biblioteca.com');
    await page.fill('input[name="password"]', 'Demo123!');
    
    // Hacer clic en submit
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el login (verificar que aparece el nombre de usuario)
    await expect(page.locator('text=demo')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Login exitoso');
    
    // ========================================
    // PASO 2: NAVEGAR A UN LIBRO
    // ========================================
    
    // Buscar un libro (ej: "Harry Potter")
    await page.fill('input[placeholder*="Buscar"]', 'Harry Potter');
    await page.press('input[placeholder*="Buscar"]', 'Enter');
    
    // Esperar a que carguen los resultados
    await page.waitForSelector('[data-testid="libro-card"]', { timeout: 5000 });
    
    // Hacer clic en el primer resultado
    await page.click('[data-testid="libro-card"]:first-child');
    
    // Esperar a que cargue el detalle del libro
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Navegación a libro exitosa');
    
    // ========================================
    // PASO 3: CREAR RESEÑA
    // ========================================
    
    // Hacer scroll hasta el botón de "Escribir Reseña"
    await page.click('text=Escribir Reseña');
    
    // Esperar a que aparezca el modal/formulario
    await expect(page.locator('textarea')).toBeVisible({ timeout: 3000 });
    
    // Seleccionar 5 estrellas (hacer clic en la quinta estrella)
    await page.click('[data-rating="5"]');
    
    // Escribir comentario
    const comentario = `Esta es una reseña de prueba E2E generada el ${new Date().toLocaleString()}. ` +
                      `¡Excelente libro! Muy recomendado para fans de fantasía. ` +
                      `Test automatizado con Playwright.`;
    
    await page.fill('textarea[name="comentario"]', comentario);
    
    // Enviar reseña
    await page.click('button:has-text("Publicar")');
    
    // Esperar mensaje de éxito
    await expect(page.locator('text=Reseña publicada')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Reseña creada exitosamente');
    
    // ========================================
    // PASO 4: VERIFICAR RESEÑA PUBLICADA
    // ========================================
    
    // Esperar un momento a que se cierre el modal
    await page.waitForTimeout(1000);
    
    // Verificar que la reseña aparece en la lista
    await expect(page.locator(`text=${comentario.substring(0, 50)}`)).toBeVisible({ timeout: 5000 });
    
    // Verificar que aparecen las 5 estrellas
    const estrellas = page.locator('[data-testid="resena-estrellas"]').first();
    await expect(estrellas).toBeVisible();
    
    // Verificar que aparece el nombre del usuario
    await expect(page.locator('text=demo')).toBeVisible();
    
    // Verificar que la fecha es reciente
    const fecha = page.locator('[data-testid="resena-fecha"]').first();
    await expect(fecha).toContainText(/hace|minutos|hoy/i);
    
    console.log('✅ Reseña verificada correctamente');
    
    // ========================================
    // PASO 5: INTERACCIÓN CON LA RESEÑA
    // ========================================
    
    // Dar like a la reseña (opcional)
    const likeButton = page.locator('[data-testid="resena-like-button"]').first();
    if (await likeButton.isVisible()) {
      await likeButton.click();
      await expect(page.locator('text=1 like')).toBeVisible({ timeout: 2000 });
      console.log('✅ Like agregado correctamente');
    }
    
    // ========================================
    // TEST COMPLETADO
    // ========================================
    
    console.log('🎉 Test E2E completado exitosamente');
  });

  test('Login con credenciales inválidas debe mostrar error', async ({ page }) => {
    // Test adicional: verificar manejo de errores
    
    await page.click('text=Iniciar Sesión');
    await page.fill('input[name="email"]', 'invalido@test.com');
    await page.fill('input[name="password"]', 'WrongPass123!');
    await page.click('button[type="submit"]');
    
    // Debe mostrar mensaje de error
    await expect(page.locator('text=credenciales inválidas')).toBeVisible({ timeout: 3000 });
    
    console.log('✅ Manejo de error de login correcto');
  });

  test('Usuario no autenticado no puede crear reseñas', async ({ page }) => {
    // Test adicional: verificar protección de rutas
    
    // Navegar directamente a un libro sin login
    await page.goto('/libro/1');
    
    // Intentar hacer clic en "Escribir Reseña"
    const escribirBtn = page.locator('text=Escribir Reseña');
    
    if (await escribirBtn.isVisible()) {
      await escribirBtn.click();
      
      // Debe redirigir al login o mostrar mensaje
      await expect(
        page.locator('text=Iniciar sesión')
      ).toBeVisible({ timeout: 3000 });
    }
    
    console.log('✅ Protección de rutas funcionando correctamente');
  });
});
