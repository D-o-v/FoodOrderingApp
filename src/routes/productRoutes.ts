import { Router } from 'express';
import { createProductController, getAllProductsController } from '../controllers/productController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createProductController);
router.get('/', getAllProductsController);

export default router;