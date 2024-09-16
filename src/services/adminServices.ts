import DeliveryPrice from '../models/deliveryPrice';
import User, { IUser } from '../models/User';

export const setDeliveryPrice = async (price: number): Promise<void> => {
  await DeliveryPrice.findOneAndUpdate({}, { price }, { upsert: true });
};

export const getDeliveryPrice = async (): Promise<number> => {
  const deliveryPrice = await DeliveryPrice.findOne();
  return deliveryPrice ? deliveryPrice.price : 0;
};
export const getAllUsers = async (): Promise<IUser[]> => {
  return User.find().select(['-password','-__v']);
};

export const setUserType = async (username: string, type: string): Promise<void> => {
  await User.findOneAndUpdate({ username }, { type });
};