import { Router } from 'express';
import * as resenaController from '../controllers/resena.controller';
import { authenticateJWT, optionalAuthenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

router.get('/', optionalAuthenticateJWT, resenaController.getResenas);
router.get('/:id', resenaController.getResenaById);
router.post('/', authenticateJWT, resenaController.createResena);
router.put('/:id', authenticateJWT, resenaController.updateResena);
router.delete('/:id', authenticateJWT, resenaController.deleteResena);

// Admin-only routes for moderation
router.put('/:id/approve', authenticateJWT, requireAdmin, resenaController.approveResena);
router.put('/:id/reject', authenticateJWT, requireAdmin, resenaController.rejectResena);

export { router as resenaRoutes };
