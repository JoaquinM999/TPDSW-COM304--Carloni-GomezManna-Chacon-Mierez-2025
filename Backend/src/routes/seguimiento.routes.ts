// src/routes/seguimiento.routes.ts
import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { followUser, unfollowUser, getSeguidores, getSeguidos, getFollowCounts } from '../controllers/seguimiento.controller';

const router = Router();

router.post('/follow', authenticateJWT, followUser);
router.delete('/unfollow/:seguidoId', authenticateJWT, unfollowUser);
router.get('/seguidores/:usuarioId', getSeguidores);
router.get('/seguidos', authenticateJWT, getSeguidos);
router.get('/counts/:userId', getFollowCounts);

export { router as seguimientoRoutes };
