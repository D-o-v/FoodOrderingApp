import Order, { IOrder } from '../models/Order';

export const createOrder = async (userId: string, products: Array<{ product: string, quantity: number }>, total: number): Promise<IOrder> => {
  const order = new Order({ user: userId, products, total });
  return order.save();
};

export const getOrdersByDate = async (date: Date): Promise<IOrder[]> => {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  return Order.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('user').populate('products.product');
};