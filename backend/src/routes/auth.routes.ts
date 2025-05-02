import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  signup,
  login,
  logout,
  getCurrentUser,
} from '../controllers/auth.controller';
import { protect } from '../middleware/authMiddleware';
import { Request } from 'express';

const router = Router();

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const avatarDir = path.join(uploadDir, 'avatars');
const resumeDir = path.join(uploadDir, 'resumes');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}
if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    if (file.fieldname === 'avatar') {
      cb(null, avatarDir);
    } else if (file.fieldname === 'resume') {
      cb(null, resumeDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File upload limits and validation
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: function (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) {
    if (file.fieldname === 'avatar') {
      // Accept only certain image formats
      const filetypes = /jpeg|jpg|png|gif/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error('Only .png, .jpg, .jpeg, and .gif formats are allowed for avatars'));
    } else if (file.fieldname === 'resume') {
      // Accept only document formats
      const filetypes = /pdf|doc|docx/;
      const mimetype = /application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error('Only .pdf, .doc, and .docx formats are allowed for resumes'));
    } else {
      cb(null, true);
    }
  }
});

// Validation middleware
const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/signup', 
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]), 
  signupValidation, 
  signup
);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);

export default router; 