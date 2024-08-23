// import mongoose from 'mongoose';

// export const connectDB = async (): Promise<void> => {
//   try {
//     await mongoose.connect('mongodb+srv://daudavictorodunayo:IasQcDzquabAbsDC@cluster0.l39xt.mongodb.net/our_food_delivery_app_db?retryWrites=true&w=majority&appName=Cluster0');
//     console.log('MongoDB connected');
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// };

import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI ||'mongodb+srv://daudavictorodunayo:IasQcDzquabAbsDC@cluster0.l39xt.mongodb.net/our_food_delivery_app_db?retryWrites=true&w=majority&appName=Cluster0';
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Rethrow the error to be caught in server.ts ok
  }
};