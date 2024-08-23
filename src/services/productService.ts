import Product, { IProduct } from '../models/Product';

export const createProduct = async (name: string, price: number): Promise<IProduct> => {
  const product = new Product({ name, price });
  return product.save();
};

export const getAllProducts = async (): Promise<IProduct[]> => {
  return Product.find();
};