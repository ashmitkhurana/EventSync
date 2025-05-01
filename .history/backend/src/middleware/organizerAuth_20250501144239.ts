import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export const isOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Organizer role required.',
      });
    }

    next();
  } catch (error) {
    console.error('Organizer auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization check',
    });
  }
}; 