import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface JwtPayload {
  userId: string;
}
// Augment Express Request type
interface RequestWithUser extends Request {
  user?: {
    id: string;
  }
}

export const protect = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    // Add user to request object
    req.user = {
      id: user._id.toString(),
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
}; 