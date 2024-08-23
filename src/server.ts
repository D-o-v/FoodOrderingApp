import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(json({ 
  verify: (req: express.Request, res: express.Response, buf: Buffer, encoding: string) => {
    if (buf && buf.length) {
      try {
        JSON.parse(buf.toString());
      } catch(e:any) {
        console.error('Invalid JSON:', buf.toString());
        res.status(400).json({ error: 'Invalid JSON', details: e.message });
        throw new Error('Invalid JSON');
      }
    }
  }
}));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });










// import express from 'express';
// import { json } from 'body-parser';
// import cors from 'cors';
// import { connectDB } from './config/database';
// import authRoutes from './routes/authRoutes';
// import productRoutes from './routes/productRoutes';
// import orderRoutes from './routes/orderRoutes';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(json({ 
//   verify: (req, res, buf) => {
//     try {
//       JSON.parse(buf.toString());
//     } catch(e) {
//     //   res.status(400).json({ error: 'Invalid JSON' });
//       throw new Error('Invalid JSON');
//     }
//   }
// }));

// // Error handling middleware
// app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

// // Connect to MongoDB
// connectDB()
//   .then(() => {
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   })
//   .catch((error) => {
//     console.error('Failed to connect to MongoDB:', error);
//     process.exit(1);
//   });



















// import express from 'express';
// import { json } from 'body-parser';
// import cors from 'cors';
// import { connectDB } from './config/database';
// import authRoutes from './routes/authRoutes';
// import productRoutes from './routes/productRoutes';
// import orderRoutes from './routes/orderRoutes';
// import dotenv from 'dotenv';

// const app = express();

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(json());
// app.use(cors());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

// // Connect to MongoDB
// connectDB();
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));