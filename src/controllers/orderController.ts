import { Request, Response } from 'express';
import { createOrder, getUserOrdersByDate, getAllOrders, updateOrderStatus, getOrdersByUser,getOrdersByDate,editOrder, deleteOrder, cancelOrder, replicateOrder } from '../services/orderService';

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const { username, products, total, date } = req.body;
    const order = await createOrder(username, products, total, date);
    res.status(201).json(order);
  } catch (error:any) {
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
};

export const getUserOrdersByDateController = async (req: Request, res: Response) => {
  try {
    const {username, date} = req.params;
    const orders = await getUserOrdersByDate(username,date);
    res.json(orders);
  } catch (error:any) {
    res.status(400).json({ message: 'Error fetching orders', error: error.message });
  }
};
export const getAllOrdersByDateController = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const orders = await getOrdersByDate(date);
    res.json(orders);
  } catch (error:any) {
    res.status(400).json({ message: 'Error fetching orders', error: error.message });
  }
};

export const getAllOrdersController = async (req: Request, res: Response) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (error:any) {
    res.status(400).json({ message: 'Error fetching all orders', error: error.message });
  }
};

export const updateOrderStatusController = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const updatedOrder = await updateOrderStatus(orderId, status);
    if (updatedOrder) {
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error:any) {
    res.status(400).json({ message: 'Error updating order status', error: error.message });
  }
};

export const getOrdersByUserController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const orders = await getOrdersByUser(username);
    res.json(orders);
  } catch (error:any) {
    res.status(400).json({ message: 'Error fetching user orders', error: error.message });
  }
};


export const editOrderController = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const updatedData = req.body;
    const updatedOrder = await editOrder(orderId, updatedData);
    if (updatedOrder) {
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error:any) {
    res.status(400).json({ message: 'Error editing order', error: error.message });
  }
};

export const deleteOrderController = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const result = await deleteOrder(orderId);
    if (result) {
      res.json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error:any) {
    res.status(400).json({ message: 'Error deleting order', error: error.message });
  }
};

export const cancelOrderController = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const cancelledOrder = await cancelOrder(orderId);
    if (cancelledOrder) {
      res.json(cancelledOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error:any) {
    res.status(400).json({ message: 'Error cancelling order', error: error.message });
  }
};

export const replicateOrderController = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { newDate } = req.body;
    const replicatedOrder = await replicateOrder(orderId, new Date(newDate));
    res.status(201).json(replicatedOrder);
  } catch (error:any) {
    res.status(400).json({ message: 'Error replicating order', error: error.message });
  }
};











// import { Request, Response } from 'express';
// import { createOrder, getOrdersByDate, getAllOrders, updateOrderStatus,getOrdersByUser } from '../services/orderService';

// interface CustomRequest extends Request {
//   user?: {
//     id: string;
//   };
// }

// export const createOrderController = async (req: CustomRequest, res: Response): Promise<void> => {
//   try {
//     const { products, total } = req.body;
//     if (req.user) {
//       const userId = req.user.id;
//       const order = await createOrder(userId, products, total);
//       res.status(201).json(order);
//     } else {
//       res.status(401).json({ error: 'Unauthorized' });
//     }
//   } catch (error: any) {
//     res.status(400).json({ error: error });
//   }
// };

// export const getOrdersByDateController = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const date = new Date(req.params.date);
//     const orders = await getOrdersByDate(date);
//     res.status(200).json(orders);
//   } catch (error: any) {
//     res.status(400).json({ error: error });
//   }
// };

// export const getAllOrdersController = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const orders = await getAllOrders();
//     res.status(200).json(orders);
//   } catch (error: any) {
//     res.status(400).json({ error: error });
//   }
// };

// export const updateOrderStatusController = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;
//     const updatedOrder = await updateOrderStatus(orderId, status);
//     if (updatedOrder) {
//       res.status(200).json(updatedOrder);
//     } else {
//       res.status(404).json({ error: 'Order not found' });
//     }
//   } catch (error: any) {
//     res.status(400).json({ error: error });
//   }
// };

// export const getOrdersByUserController = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const username = req.params.username;
//     const orders = await getOrdersByUser(username);
//     res.status(200).json(orders);
//   } catch (error: any) {
//     res.status(400).json({ error: error });
//   }
// };













// // import { Request, Response } from 'express';
// // import { createOrder, getOrdersByDate } from '../services/orderService';

// // interface CustomRequest extends Request {
// //     user?: {
// //       id: string;
// //     };
// //   }
// // export const createOrderController = async (req: CustomRequest, res: Response): Promise<void> => {
// //   try {
// //     const { products, total } = req.body;
// //     if(req.user){
// //     const userId = req?.user.id ; // Assuming you have user info in req.user after authentication
// //     const order = await createOrder(userId, products, total);
// //     res.status(201).json(order);}
// //   } catch (error:any) {
// //     res.status(400).json({ error: error });
// //   }
// // };

// // export const getOrdersByDateController = async (req: Request, res: Response): Promise<void> => {
// //   try {
// //     const date = new Date(req.params.date);
// //     const orders = await getOrdersByDate(date);
// //     res.status(200).json(orders);
// //   } catch (error:any) {
// //     res.status(400).json({ error: error });
// //   }
// // };