import User from '../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ourfoodappjwtsecret';

interface AuthResponse {
  token: string;
  userType: string;
}

export const signUp = async (username: string, password: string): Promise<AuthResponse> => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('Username already exists');
  }

  const user = new User({ username, password, type: 'user' });
  await user.save();

  const token = jwt.sign({ userId: user._id, userType: user.type }, JWT_SECRET, { expiresIn: '1d' });
  return { token, userType: user.type };
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
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