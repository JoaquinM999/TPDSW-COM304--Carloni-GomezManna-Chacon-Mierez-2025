import { Router } from 'express';
import { obtenerLibros, obtenerSugerencias } from '../controllers/googleBooks.controller';

const router = Router();

router.get('/buscar', obtenerLibros);
router.get('/sugerencias', obtenerSugerencias);

export default router;
