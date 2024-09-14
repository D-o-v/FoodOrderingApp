import { Request, Response } from 'express';
import { createOrder, getOrdersByDate, getAllOrders, updateOrderStatus,getOrdersByUser } from '../services/orderService';

interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

export const createOrderController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { products, total } = req.body;
    if (req.user) {
      const userId = req.user.id;
      const order = await createOrder(userId, products, total);
      res.status(201).json(order);
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrdersByDateController = async (req: Request, res: Response): Promise<void> => {
  try {
    const date = new Date(req.params.date);
    const orders = await getOrdersByDate(date);
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllOrdersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await getAllOrders();
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatusController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const updatedOrder = await updateOrderStatus(orderId, status);
    if (updatedOrder) {
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersByUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const username = req.params.username;
    const orders = await getOrdersByUser(username);
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};













// import { Request, Response } from 'express';
// import { createOrder, getOrdersByDate } from '../services/orderService';

// interface CustomRequest extends Request {
//     user?: {
//       id: string;
//     };
//   }
// export const createOrderController = async (req: CustomRequest, res: Response): Promise<void> => {
//   try {
//     const { products, total } = req.body;
//     if(req.user){
//     const userId = req?.user.id ; // Assuming you have user info in req.user after authentication
//     const order = await createOrder(userId, products, total);
//     res.status(201).json(order);}
//   } catch (error:any) {
//     res.status(400).json({ error: error.message });
//   }
// };

// export const getOrdersByDateController = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const date = new Date(req.params.date);
//     const orders = await getOrdersByDate(date);
//     res.status(200).json(orders);
//   } catch (error:any) {
//     res.status(500).json({ error: error.message });
//   }
// };