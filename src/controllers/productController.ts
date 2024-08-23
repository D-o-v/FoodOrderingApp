import { Request, Response } from 'express';
import { createProduct, getAllProducts } from '../services/productService';

interface CustomRequest extends Request {
    user?: {
      id: string;
    };
  }
export const createProductController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { name, price } = req.body;
    const product = await createProduct(name, price);
    res.status(201).json(product);
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllProductsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};