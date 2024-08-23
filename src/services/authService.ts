import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'ourfoodappjwtsecret';

export const signUp = async (username: string, password: string): Promise<string> => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('Username already exists');
  }
  const user = new User({ username, password });
  await user.save();
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
};

export const login = async (username: string, password: string): Promise<string> => {
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid username or password');
  }
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
};