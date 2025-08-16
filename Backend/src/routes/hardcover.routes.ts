import { Router } from 'express';
import { trendingBooksController } from '../controllers/hardcoverController';

const router = Router();

router.get('/trending', trendingBooksController);

export default router;
