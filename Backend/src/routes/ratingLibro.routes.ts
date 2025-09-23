// src/routes/ratingLibro.routes.ts
import { Router } from 'express';
import {
  getRatingLibros,
  getRatingLibroById,
  getRatingLibroByLibroId,
  createOrUpdateRatingLibro,
  deleteRatingLibro
} from '../controllers/ratingLibro.controller';

const router = Router();

router.get('/', getRatingLibros);
router.get('/:id', getRatingLibroById);
router.get('/libro/:libroId', getRatingLibroByLibroId);
router.post('/', createOrUpdateRatingLibro);
router.delete('/:id', deleteRatingLibro);

export { router as ratingLibroRoutes };
