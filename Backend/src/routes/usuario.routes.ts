import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { getUsers, getUserById, updateUser, getCurrentUser, updateCurrentUser, deleteAllUsers, checkUserExists } from '../controllers/usuario.controller';

const router = Router();

router.post('/check-exists', checkUserExists); // Public endpoint for registration validation
router.get('/', authenticateJWT, getUsers);
router.get('/me', authenticateJWT, getCurrentUser);
router.put('/me', authenticateJWT, updateCurrentUser);
router.get('/:id', authenticateJWT, getUserById);
router.put('/:id', authenticateJWT, updateUser);
router.delete('/all', authenticateJWT, deleteAllUsers);

export { router as usuarioRoutes };
