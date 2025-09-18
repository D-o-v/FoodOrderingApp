import Product, { IProduct } from '../models/Product';

export const createProduct = async (name: string, price: number): Promise<IProduct> => {
  const product = new Product({ name, price });
  return product.save();
};

export const getAllProducts = async (): Promise<IProduct[]> => {
  return Product.find();
};

export const updateProduct = async (id: string, name: string, price: number): Promise<IProduct | null> => {
  return Product.findByIdAndUpdate(id, { name, price }, { new: true });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await Product.findByIdAndDelete(id);
};