import { Router } from 'express';
import { obtenerLibros } from '../controllers/googleBooks.controller';

const router = Router();

router.get('/buscar', obtenerLibros);

export default router;
