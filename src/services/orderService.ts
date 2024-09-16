import Order, { IOrder } from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';
import { getDeliveryPrice } from './adminServices';

// export const createOrder = async (
//   username: string,
//   products: Array<{ product: string; quantity: number }>,
//   total: number,
//   date: string
// ): Promise<IOrder> => {
//   const user = await User.findOne({ username });
//   if (!user) {
//     throw new Error('User not found');
//   }

//   const order = new Order({
//     user: user._id,
//     products,
//     total,
//     date: new Date(date),
//     status: 'pending payment'
//   });
//   return order.save();
// };


export const createOrder = async (
  username: string,
  products: Array<{ product: string; quantity: number }>,
  frontendTotal: number,
  date: string
): Promise<IOrder> => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('User not found');
  }

  // Calculate total on the backend
  let backendTotal = 0;
  for (let item of products) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error('Product not found');
    }
    backendTotal += product.price * item.quantity;
  }

  // Add delivery price
  const deliveryPrice = await getDeliveryPrice();
  backendTotal += deliveryPrice;

  // Compare frontend and backend totals
  if (Math.abs(frontendTotal - backendTotal) > 0.01) {
    throw new Error('Total mismatch between frontend and backend calculations');
  }

  const order = new Order({
    user: user._id,
    products,
    total: backendTotal,
    date: new Date(date),
    status: 'pending payment'
  });
  return order.save();
};

export const getOrdersByDate = async (date: string): Promise<IOrder[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return Order.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('user').populate('products.product');
};
export const getUserOrdersByDate = async (username: string, date: string): Promise<IOrder[]> => {
  // Find the user by username
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('User not found');
  }

  // Set the start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Find the user's orders for that day
  return Order.find({
    user: user._id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  })
    .populate('user')
    .populate('products.product');
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


export const editOrder = async (orderId: string, updatedData: Partial<IOrder>): Promise<IOrder | null> => {
  const order = await Order.findById(orderId).populate('user');
  if (!order) return null;

  const user = await User.findById(order.user);
  if (!user) throw new Error('User not found');

  if ((order.status === 'processing' || order.status === 'completed' || order.status === 'in-transit' || order.status === 'cancelled') && user.type !== "admin") {
    throw new Error(`Cannot edit order that is ${order.status}.`);
  }

  Object.assign(order, updatedData);
  return await order.save();
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
  const order = await Order.findById(orderId).populate('user');
  if (!order) return false;

  const user = await User.findById(order.user);
  if (!user) throw new Error('User not found');

  if ((order.status === 'processing' || order.status === 'completed' || order.status === 'in-transit' || order.status === 'cancelled') && user.type !== "admin") {
    throw new Error(`Cannot delete order that is ${order.status}.`);
  }

  await Order.findByIdAndDelete(orderId);
  return true;
};

export const cancelOrder = async (orderId: string): Promise<IOrder | null> => {
  const order = await Order.findById(orderId).populate('user');
  if (!order) return null;

  const user = await User.findById(order.user);
  if (!user) throw new Error('User not found');

  if ((order.status === 'processing' || order.status === 'completed' || order.status === 'in-transit' || order.status === 'cancelled') && user.type !== "admin") {
    throw new Error(`Cannot cancel order that is ${order.status}.`);
  }

  order.status = 'cancelled';
  return await order.save();
};

export const replicateOrder = async (orderId: string, newDate: Date): Promise<IOrder> => {
  const originalOrder = await Order.findById(orderId);
  if (!originalOrder) throw new Error('Original order not found');

  const newOrder = new Order({
    user: originalOrder.user,
    products: originalOrder.products,
    total: originalOrder.total,
    date: newDate,
    status: 'pending payment'
  });

  return await newOrder.save();
};













// import Order, { IOrder } from '../models/Order';
// import User from '../models/User';

// export const createOrder = async (
//   username: string,
//   products: Array<{ product: string; quantity: number }>,
//   total: number,
//   date: string
// ): Promise<IOrder> => {
//   const user = await User.findOne({ username });
//   if (!user) {
//     throw new Error('User not found');
//   }

//   const order = new Order({
//     user: user._id,
//     products,
//     total,
//     date: new Date(date),
//     status: 'pending payment'
//   });
//   return order.save();
// };

// export const getOrdersByUserAndDate = async (username: string, date: string): Promise<IOrder[]> => {
//   const user = await User.findOne({ username });
//   if (!user) {
//     throw new Error('User not found');
//   }

//   const startOfDay = new Date(date);
//   startOfDay.setHours(0, 0, 0, 0);
//   const endOfDay = new Date(date);
//   endOfDay.setHours(23, 59, 59, 999);

//   return Order.find({
//     user: user._id,
//     date: {
//       $gte: startOfDay,
//       $lte: endOfDay
//     }
//   }).populate('user').populate('products.product');
// };

// export const updateOrderStatus = async (orderId: string, status: string): Promise<IOrder | null> => {
//   return Order.findByIdAndUpdate(orderId, { status }, { new: true });
// };

// export const getAllOrders = async (): Promise<IOrder[]> => {
//   return Order.find().populate('user').populate('products.product');
// };

// export const getOrdersByUser = async (username: string): Promise<IOrder[]> => {
//   const user = await User.findOne({ username });
//   if (!user) {
//     throw new Error('User not found');
//   }
//   return Order.find({ user: user._id })
//     .populate('user')
//     .populate('products.product');
// };                                                    









// // import Order, { IOrder } from '../models/Order';
// // import User from '../models/User';


// // export const createOrder = async (userId: string, products: Array<{ product: string, quantity: number }>, total: number): Promise<IOrder> => {
// //   const order = new Order({ user: userId, products, total, status: 'pending payment' });
// //   return order.save();
// // };

// // export const getOrdersByDate = async (date: Date): Promise<IOrder[]> => {
// //   const startOfDay = new Date(date.setHours(0, 0, 0, 0));
// //   const endOfDay = new Date(date.setHours(23, 59, 59, 999));
// //   return Order.find({
// //     date: {
// //       $gte: startOfDay,
// //       $lte: endOfDay
// //     }
// //   }).populate('user').populate('products.product');
// // };

// // export const updateOrderStatus = async (orderId: string, status: string): Promise<IOrder | null> => {
// //   return Order.findByIdAndUpdate(orderId, { status }, { new: true });
// // };

// // export const getAllOrders = async (): Promise<IOrder[]> => {
// //   return Order.find().populate('user').populate('products.product');
// // };

// // export const getOrdersByUser = async (username: string): Promise<IOrder[]> => {
// //   const user = await User.findOne({ username });
// //   if (!user) {
// //     throw new Error('User not found');
// //   }
// //   return Order.find({ user: user._id })
// //     .populate('user')
// //     .populate('products.product');
// // };
















// // import Order, { IOrder } from '../models/Order';

// // export const createOrder = async (userId: string, products: Array<{ product: string, quantity: number }>, total: number): Promise<IOrder> => {
// //   const order = new Order({ user: userId, products, total });
// //   return order.save();
// // };

// // export const getOrdersByDate = async (date: Date): Promise<IOrder[]> => {
// //   const startOfDay = new Date(date.setHours(0, 0, 0, 0));
// //   const endOfDay = new Date(date.setHours(23, 59, 59, 999));
// //   return Order.find({
// //     date: {
// //       $gte: startOfDay,
// //       $lte: endOfDay
// //     }
// //   }).populate('user').populate('products.product');
// // };