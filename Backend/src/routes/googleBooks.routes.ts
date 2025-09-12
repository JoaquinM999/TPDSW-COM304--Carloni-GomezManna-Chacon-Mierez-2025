import { Router } from 'express';
import { obtenerLibros, obtenerLibroPorId } from '../controllers/googleBooks.controller';

const router = Router();

router.get('/buscar', obtenerLibros);
router.get('/:id', obtenerLibroPorId);

export default router;
