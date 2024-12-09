import express from 'express';
import {
  createClient,
  loginClientController,
  resetPassword,
  updatePassword,
  verify_token,
} from './controllers/clientControllers';
import authenticate from '../../middlewares/authenticate';

const router = express.Router();
router.route('/verify_token').post(authenticate, verify_token);
// Register route
router.route('/register').post(createClient);

// Login route
router.route('/login').post(loginClientController); // Login with username

// Password reset routes
router.route('/reset-password').post(resetPassword);
router.route('/update-password').post(updatePassword);

export default router;
