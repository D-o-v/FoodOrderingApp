import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'ourfoodappjwtsecret';

interface DecodedToken {
  userId: string;
  userType: string;
}

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        userType: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'No token, authorization denied' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = {
      userId: decoded.userId,
      userType: decoded.userType
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.userType !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

export const checkRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.userType)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    next();
  };
};



export const signUp = async (username: string, password: string): Promise<{ token: string, userType: string }> => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('Username already exists');
  }

  const user = new User({ username, password, type: 'user' });
  await user.save();

  const token = jwt.sign({ userId: user._id, userType: user.type }, JWT_SECRET, { expiresIn: '1d' });
  return { token, userType: user.type };
};

export const login = async (username: string, password: string): Promise<{ token: string, userType: string }> => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // If user doesn't have a type, set it to 'user'
  if (!user.type) {
    user.type = 'user';
    await user.save();
  }

  const token = jwt.sign({ userId: user._id, userType: user.type }, JWT_SECRET, { expiresIn: '1d' });
  return { token, userType: user.type };
};


// export const signUp = async (username: string, password: string): Promise<string> => {
//   const existingUser = await User.findOne({ username });
//   if (existingUser) {
//     throw new Error('Username already exists');
//   }

//   const user = new User({ username, password, type: 'user' });
//   await user.save();

//   return jwt.sign({ userId: user._id, userType: user.type }, JWT_SECRET, { expiresIn: '1d' });
// };

// export const login = async (username: string, password: string): Promise<string> => {
//   const user = await User.findOne({ username });
//   if (!user) {
//     throw new Error('Invalid credentials');
//   }

//   const isMatch = await user.comparePassword(password);
//   if (!isMatch) {
//     throw new Error('Invalid credentials');
//   }

//   // If user doesn't have a type, set it to 'user'
//   if (!user.type) {
//     user.type = 'user';
//     await user.save();
//   }
  
//   if(user.username=="odun"){
//     user.type = 'admin';
//     await user.save();
//   }

//   return jwt.sign({ userId: user._id, userType: user.type }, JWT_SECRET, { expiresIn: '1d' });
// };
























// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import User from '../models/User';

// const JWT_SECRET = process.env.JWT_SECRET || 'ourfoodappjwtsecret';

// interface DecodedToken {
//   userId: string;
//   userType: string;
// }

// export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     res.status(401).json({ error: 'No token, authorization denied' });
//     return;
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
//     req.user = {
//       userId: decoded.userId,
//       userType: decoded.userType
//     };
//     next();
//   } catch (error) {
//     res.status(401).json({ error: 'Token is not valid' });
//   }
// };

// export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
//   if (!req.user || req.user.userType !== 'admin') {
//     res.status(403).json({ error: 'Admin access required' });
//     return;
//   }
//   next();
// };

// export const checkRole = (...allowedRoles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     if (!req.user || !allowedRoles.includes(req.user.userType)) {
//       res.status(403).json({ error: 'Access denied' });
//       return;
//     }
//     next();
//   };
// };


// export const signUp = async (username: string, password: string): Promise<string> => {
//   const existingUser = await User.findOne({ username });
//   if (existingUser) {
//     throw new Error('Username already exists');
//   }

//   const user = new User({ username, password, type: 'user' });
//   await user.save();

//   return jwt.sign({ userId: user._id, userType: user.type }, JWT_SECRET, { expiresIn: '1d' });
// };

// export const login = async (username: string, password: string): Promise<string> => {
//   const user = await User.findOne({ username });
//   if (!user) {
//     throw new Error('Invalid credentials');
//   }

//   const isMatch = await user.comparePassword(password);
//   if (!isMatch) {
//     throw new Error('Invalid credentials');
//   }

//   // If user doesn't have a type, set it to 'user'
//   if (!user.type) {
//     user.type = 'user';
//     await user.save();
//   }

//   return jwt.sign({ userId: user._id, userType: user.type }, JWT_SECRET, { expiresIn: '1d' });
// };

