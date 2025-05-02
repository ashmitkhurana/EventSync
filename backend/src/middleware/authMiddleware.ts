import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export const protect = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    let token;

    // First check for token in cookies
    if (req.cookies.token) {
      token = req.cookies.token;
    }
    // Fall back to Authorization header if no cookie
    else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      req.user = { id: decoded.userId };
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}; 