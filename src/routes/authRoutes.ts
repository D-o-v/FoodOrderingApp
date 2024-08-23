import { Router } from 'express';
import { loginController, signUpController } from '../controllers/authController';
const router = Router();

router.post('/signup', signUpController);
router.post('/login', loginController);

export default router;