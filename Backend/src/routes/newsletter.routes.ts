import { Router } from 'express';
import { subscribe, unsubscribe, getAllSubscriptions } from '../controllers/newsletter.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/newsletter/subscribe
 * Suscribirse a la newsletter
 */
router.post('/subscribe', subscribe);

/**
 * POST /api/newsletter/unsubscribe
 * Cancelar suscripción a la newsletter
 */
router.post('/unsubscribe', unsubscribe);

/**
 * GET /api/newsletter/subscriptions
 * Obtener todas las suscripciones (solo admin)
 */
router.get('/subscriptions', authenticateJWT, getAllSubscriptions);

export default router;
