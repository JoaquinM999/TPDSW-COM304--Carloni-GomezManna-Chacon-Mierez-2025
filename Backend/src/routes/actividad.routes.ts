// src/routes/actividad.routes.ts
import { Router } from 'express';
import {
  getActividades,
  getActividadById,
  getActividadesByUsuario,
  createActividad,
  deleteActividad
} from '../controllers/actividad.controller';

const router = Router();

router.get('/', getActividades);
router.get('/:id', getActividadById);
router.get('/usuario/:usuarioId', getActividadesByUsuario);
router.post('/', createActividad);
router.delete('/:id', deleteActividad);

export { router as actividadRoutes };
