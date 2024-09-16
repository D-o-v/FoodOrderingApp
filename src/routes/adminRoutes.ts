import { Router } from 'express';
import { setDeliveryPriceController, setUserTypeController,getDeliveryPriceController,getAllUsersController} from '../controllers/adminController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

router.post('/delivery-price', authMiddleware, adminOnly, setDeliveryPriceController);
router.get('/delivery-price', authMiddleware, getDeliveryPriceController);
router.post('/set-user-type', authMiddleware, adminOnly, setUserTypeController);
router.get('/users', authMiddleware, adminOnly,getAllUsersController);

export default router;