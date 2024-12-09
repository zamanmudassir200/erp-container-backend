import express from 'express';
import {
  login,
  logout,
  signup,
  forgotPassword,
  resetPassword,
  checkAuth,
} from '../Controllers/auth.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = express.Router();

// Define routes with appropriate TypeScript typings
router.get('/check-auth', verifyToken, checkAuth);

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// router.post("/verify-email", verifyEmail);
router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:id/:token', resetPassword);

export default router;
