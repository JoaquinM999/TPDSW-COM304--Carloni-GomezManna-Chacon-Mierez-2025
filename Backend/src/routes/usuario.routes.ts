import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { getUsers, getUserById, updateUser, deleteUser, getCurrentUser, updateCurrentUser } from '../controllers/usuario.controller';

const router = Router();

router.get('/', authenticateJWT, getUsers);
router.get('/me', authenticateJWT, getCurrentUser);
router.put('/me', authenticateJWT, updateCurrentUser);
router.get('/:id', authenticateJWT, getUserById);
router.put('/:id', authenticateJWT, updateUser);
router.delete('/:id', authenticateJWT, deleteUser);

export { router as usuarioRoutes };
