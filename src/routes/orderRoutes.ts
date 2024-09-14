import { Router } from 'express';
import { createOrderController, getOrdersByDateController ,getOrdersByUserController} from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createOrderController);
router.get('/date/:date', authMiddleware, getOrdersByDateController);
router.get('/user/:username/:date', authMiddleware, getOrdersByUserController);

export default router;