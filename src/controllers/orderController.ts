import { Request, Response } from 'express';
import { createOrder, getOrdersByDate } from '../services/orderService';

interface CustomRequest extends Request {
    user?: {
      id: string;
    };
  }
export const createOrderController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { products, total } = req.body;
    if(req.user){
    const userId = req?.user.id ; // Assuming you have user info in req.user after authentication
    const order = await createOrder(userId, products, total);
    res.status(201).json(order);}
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrdersByDateController = async (req: Request, res: Response): Promise<void> => {
  try {
    const date = new Date(req.params.date);
    const orders = await getOrdersByDate(date);
    res.status(200).json(orders);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};