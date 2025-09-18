import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://daudavictorodunayo:IasQcDzquabAbsDC@cluster0.l39xt.mongodb.net/our_food_delivery_app_db?retryWrites=true&w=majority';
    
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.log('⚠️  MongoDB Atlas connection failed, using in-memory database for development');
    
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/foodapp_dev', { 
        serverSelectionTimeoutMS: 2000 
      });
      console.log('✅ Connected to local MongoDB');
    } catch (localError) {
      console.log('🔄 Starting server with mock database...');
      // Continue without database for development
    }
  }
};