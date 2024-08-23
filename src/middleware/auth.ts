import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
    user?: {
      id: string;
    };
  }

const JWT_SECRET = process.env.JWT_SECRET || 'ourfoodappjwtsecret';

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'No token, authorization denied' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};