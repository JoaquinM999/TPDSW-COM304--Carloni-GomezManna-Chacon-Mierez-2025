// src/routes/libro.routes.ts
import { Router } from 'express';
import {
  getLibros, getLibroById, createLibro, updateLibro, deleteLibro,
  getLibrosByCategoria, getLibrosByEstrellasMinimas, getReviewsByBookIdController
} from '../controllers/libro.controller';
import { validateLibro } from '../middleware/libroValidation.middleware';

const router = Router();

router.get('/', getLibros);
router.get('/:id', getLibroById);
router.post('/', validateLibro, createLibro);
router.put('/:id', validateLibro, updateLibro);
router.delete('/:id', deleteLibro);

router.get('/categoria/:categoriaId', getLibrosByCategoria);
router.get('/estrellas', getLibrosByEstrellasMinimas);
router.get('/:id/reviews', getReviewsByBookIdController);

export { router as libroRoutes };
