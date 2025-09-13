import { Router } from 'express';
import { trendingBooksController, buscarLibroHardcoverController } from '../controllers/hardcoverController';

const router = Router();

router.get('/trending', trendingBooksController);
router.get('/buscar', buscarLibroHardcoverController);

export default router;
