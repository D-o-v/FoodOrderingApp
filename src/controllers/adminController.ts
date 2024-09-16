import { Request, Response } from 'express';
import { setDeliveryPrice, setUserType,getDeliveryPrice,getAllUsers } from '../services/adminServices';

export const setDeliveryPriceController = async (req: Request, res: Response): Promise<void> => {
  try {
    await setDeliveryPrice(req.body.price);
    res.status(200).json({ message: 'Delivery price updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
export const getDeliveryPriceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const deliveryPrice =await getDeliveryPrice();
    res.status(200).json({deliveryPrice: deliveryPrice});
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
export const getAllUsersController = async (req: Request,res: Response): Promise<void> => {
  try {
    const allUsers =await getAllUsers();
    res.status(200).json(allUsers);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const setUserTypeController = async (req: Request, res: Response): Promise<void> => {
  try {
    await setUserType(req.body.username, req.body.type);
    res.status(200).json({ message: 'User type updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};