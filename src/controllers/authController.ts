import { Request, Response } from 'express';
import { signUp, login } from '../services/authService';

export const signUpController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("req.body",req.body)
    const { username, password } = req.body;
    const token = await signUp(username, password);
    res.status(201).json({ token });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
};

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const token = await login(username, password);
    res.status(200).json({ token });
  } catch (error:any) {
    res.status(401).json({ error: error.message });
  }
};