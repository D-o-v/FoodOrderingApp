import Order, { IOrder } from '../models/Order';
import User from '../models/User';


export const createOrder = async (userId: string, products: Array<{ product: string, quantity: number }>, total: number): Promise<IOrder> => {
  const order = new Order({ user: userId, products, total, status: 'pending payment' });
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

export const updateOrderStatus = async (orderId: string, status: string): Promise<IOrder | null> => {
  return Order.findByIdAndUpdate(orderId, { status }, { new: true });
};

export const getAllOrders = async (): Promise<IOrder[]> => {
  return Order.find().populate('user').populate('products.product');
};

export const getOrdersByUser = async (username: string): Promise<IOrder[]> => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('User not found');
  }
  return Order.find({ user: user._id })
    .populate('user')
    .populate('products.product');
};














// import Order, { IOrder } from '../models/Order';

// export const createOrder = async (userId: string, products: Array<{ product: string, quantity: number }>, total: number): Promise<IOrder> => {
//   const order = new Order({ user: userId, products, total });
//   return order.save();
// };

// export const getOrdersByDate = async (date: Date): Promise<IOrder[]> => {
//   const startOfDay = new Date(date.setHours(0, 0, 0, 0));
//   const endOfDay = new Date(date.setHours(23, 59, 59, 999));
//   return Order.find({
//     date: {
//       $gte: startOfDay,
//       $lte: endOfDay
//     }
//   }).populate('user').populate('products.product');
// };