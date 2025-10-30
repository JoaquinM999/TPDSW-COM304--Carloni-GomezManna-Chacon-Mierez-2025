// src/routes/libro.routes.ts
import { Router } from 'express';
import {
  getLibros, getLibroById, createLibro, updateLibro, deleteLibro,
  getLibrosByCategoria, getLibrosByEstrellasMinimas, getReviewsByBookIdController, searchLibros,
  getListasForLibro, getNuevosLanzamientos // 💡 1. Importa la nueva función del controlador
} from '../controllers/libro.controller';
import { authenticateJWT } from '../middleware/auth.middleware'; // 💡 2. Importa el middleware de autenticación

const router = Router();

router.get('/', getLibros);
router.get('/search', searchLibros);
router.get('/nuevos', getNuevosLanzamientos); // Debe ir ANTES de /:id
router.get('/categoria/:categoriaId', getLibrosByCategoria);
router.get('/estrellas', getLibrosByEstrellasMinimas);

// ✅ 3. AÑADE ESTA LÍNEA AQUÍ
router.get('/:externalId/listas', authenticateJWT, getListasForLibro);

router.get('/:id/reviews', getReviewsByBookIdController);
router.get('/:id', getLibroById);
router.post('/', createLibro);
router.put('/:id', updateLibro);
router.delete('/:id', deleteLibro);

export { router as libroRoutes };