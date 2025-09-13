import { Router } from 'express';
import { searchAuthors } from '../controllers/openLibrary.controller';

const router = Router();

router.get('/authors/search', searchAuthors);

export { router as openLibraryRoutes };
