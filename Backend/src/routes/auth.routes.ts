// src/routes/auth.routes.ts
import { Router } from 'express';
import { loginUser, refreshTokenUser, registerUser } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshTokenUser);

export { router as authRoutes };
