import { Router } from 'express';
import { createProductController, getAllProductsController, updateProductController, deleteProductController } from '../controllers/productController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createProductController);
router.get('/', getAllProductsController);
router.put('/:id', authMiddleware, updateProductController);
router.delete('/:id', authMiddleware, deleteProductController);

export default router;