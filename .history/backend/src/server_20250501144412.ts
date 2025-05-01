import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';

dotenv.config();

console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('Environment:', process.env.NODE_ENV);

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Routes
app.use('/api', authRoutes);
app.use('/api', eventRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  const status = (err as any).status || 500;
  const message = err.message || 'Something went wrong';
  res.status(status).json({
    success: false,
    status,
    message,
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;

// MongoDB connection options
const mongooseOptions = {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.set('debug', true); // Enable mongoose debug mode

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsync', mongooseOptions)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB. Error details:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    process.exit(1);
  }); 