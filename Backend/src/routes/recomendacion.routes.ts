// src/routes/recomendacion.routes.ts
import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { getRecomendaciones } from '../controllers/recomendacion.controller';

const router = Router();

router.get('/', authenticateJWT, getRecomendaciones);

export { router as recomendacionRoutes };
