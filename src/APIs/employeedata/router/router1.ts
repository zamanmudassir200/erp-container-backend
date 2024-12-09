import { Router } from 'express';
import {
  registerEmployee,
  loginEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
  UserPasswordResetEmail,
  userPasswordReset,
  // sendVerificationEmail,

  // sendWelcomeEmail,
} from '../controller';

const router = Router();

router.route('/register').post(registerEmployee);
router.route('/login').post(loginEmployee);
router.route('/').get(getAllEmployees);
router.route('/:id').get(getEmployeeById);
router.route('/:id').get(getEmployeeById);
router.route('/:id').put(updateEmployeeById);
router.route('/:id').delete(deleteEmployeeById);

router.route('/reset').post(UserPasswordResetEmail);
router.route('/resetpassword/:id').post(userPasswordReset);

// router.route("/sendwelcomeemail").post(sendWelcomeEmail);

// router.route("/register").post(upload.single("profile"), registerEmployee);

export default router;
