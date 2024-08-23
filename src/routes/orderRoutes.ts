import { Router } from 'express';
import { createOrderController, getOrdersByDateController } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createOrderController);
router.get('/date/:date', authMiddleware, getOrdersByDateController);

export default router;