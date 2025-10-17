import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { getListas, getListaById, createLista, updateLista, deleteLista } from '../controllers/lista.controller';

const router = Router();

router.get('/', authenticateJWT, getListas);
router.get('/:id', authenticateJWT, getListaById);
router.post('/', authenticateJWT, createLista);
router.put('/:id', authenticateJWT, updateLista);
router.delete('/:id', authenticateJWT, deleteLista);

export { router as listaRoutes };
