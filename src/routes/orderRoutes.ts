import { Router } from 'express';
import { createOrderController, getUserOrdersByDateController, getAllOrdersByDateController, editOrderController, deleteOrderController, cancelOrderController, replicateOrderController } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createOrderController);
router.get('/date/:date', authMiddleware, getAllOrdersByDateController);
router.get('/user/:username/:date', authMiddleware, getUserOrdersByDateController);
router.patch('/:orderId', authMiddleware, editOrderController);
router.delete('/:orderId', authMiddleware, deleteOrderController);
router.patch('/:orderId/cancel', authMiddleware, cancelOrderController);
router.post('/:orderId/replicate', authMiddleware, replicateOrderController);


export default router;