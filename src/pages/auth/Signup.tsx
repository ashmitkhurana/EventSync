import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MailIcon, LockIcon, UserIcon, AlertCircle, PhoneIcon, BookOpenIcon, FileTextIcon, ImageIcon, InfoIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  education?: string;
  bio?: string;
  avatar?: FileList;
  resume?: FileList;
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const Signup: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [signupError, setSignupError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<SignupFormData>();
  
  const password = watch('password');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
        setError('avatar', { 
          type: 'validate', 
          message: 'Please upload a valid image file (JPEG, PNG, or GIF)' 
        });
        return;
      }
      
      // Validate file size
      if (file.size > MAX_AVATAR_SIZE) {
        setError('avatar', { 
          type: 'validate', 
          message: 'Avatar image must be less than 2MB' 
        });
        return;
      }
      
      clearErrors('avatar');
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
        setError('resume', { 
          type: 'validate', 
          message: 'Please upload a valid document (PDF, DOC, or DOCX)' 
        });
        return;
      }
      
      // Validate file size
      if (file.size > MAX_RESUME_SIZE) {
        setError('resume', { 
          type: 'validate', 
          message: 'Resume must be less than 5MB' 
        });
        return;
      }
      
      clearErrors('resume');
      setResumeFileName(file.name);
    }
  };
  
  const onSubmit = async (data: SignupFormData) => {
    console.log('Form submitted with data:', { ...data, password: '[REDACTED]' });
    setSignupError(null);
    
    try {
      console.log('Calling signup function...');
      
      // Prepare optional fields
      const options: {
        education?: string;
        bio?: string;
        avatar?: File;
        resume?: File;
      } = {};
      
      // Add optional fields if provided
      if (data.education) {
        options.education = data.education;
      }
      
      if (data.bio) {
        options.bio = data.bio;
      }
      
      // Add avatar file if uploaded
      if (data.avatar && data.avatar.length > 0) {
        options.avatar = data.avatar[0];
      }
      
      // Add resume file if uploaded
      if (data.resume && data.resume.length > 0) {
        options.resume = data.resume[0];
      }
      
      const result = await signup(
        data.name, 
        data.email, 
        data.phone, 
        data.password, 
        options
      );
      
      console.log('Signup result:', { success: result.success, error: result.error });
      
      if (result.success) {
        console.log('Signup successful, navigating to home...');
        navigate('/');
      } else {
        console.error('Signup failed:', result.error);
        setSignupError(result.error || 'Failed to create an account. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      if (error instanceof Error) {
        setSignupError(`Error: ${error.message}`);
      } else {
        setSignupError('An unexpected error occurred. Please try again later.');
      }
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create your account
        </h1>
        <p className="text-gray-600 dark:text-white">
          Join EventSync to discover and create amazing events
        </p>
      </div>
      
      {signupError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-error-50 text-error-600 dark:bg-error-900/30 dark:text-error-400 rounded-lg flex items-start"
        >
          <AlertCircle size={20} className="mr-3 flex-shrink-0 mt-0.5" />
          <span>{signupError}</span>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Required Fields */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Required Information</h3>
          
          <Input
            label="Full name"
            leftIcon={<UserIcon size={18} />}
            error={errors.name?.message}
            {...register('name', { 
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              }
            })}
          />
          
          <Input
            label="Email address"
            leftIcon={<MailIcon size={18} />}
            type="email"
            error={errors.email?.message}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          
          <Input
            label="Phone number"
            leftIcon={<PhoneIcon size={18} />}
            type="tel"
            error={errors.phone?.message}
            {...register('phone', { 
              required: 'Phone number is required',
              pattern: {
                value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                message: 'Invalid phone number format'
              }
            })}
          />
          
          <Input
            label="Password"
            leftIcon={<LockIcon size={18} />}
            type="password"
            error={errors.password?.message}
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
              }
            })}
          />
          
          <Input
            label="Confirm password"
            leftIcon={<LockIcon size={18} />}
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />
        </div>
        
        {/* Optional Fields */}
        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white pt-4">Optional Information</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="file"
                  id="avatar"
                  className="sr-only"
                  accept={ALLOWED_AVATAR_TYPES.join(',')}
                  onChange={handleAvatarChange}
                  {...register('avatar')}
                />
                <label 
                  htmlFor="avatar"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <ImageIcon size={18} className="mr-2" />
                  Select Image
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Max: 2MB (JPEG, PNG, GIF)
                </div>
              </div>
              
              {avatarPreview && (
                <div className="h-16 w-16 rounded-full overflow-hidden">
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
            {errors.avatar && (
              <span className="text-sm text-error-600 dark:text-error-400">{errors.avatar.message}</span>
            )}
          </div>
          
          <Input
            label="Education"
            leftIcon={<BookOpenIcon size={18} />}
            placeholder="e.g. Bachelor's in Computer Science"
            error={errors.education?.message}
            {...register('education')}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <div className="mt-1">
              <textarea
                rows={4}
                placeholder="Tell others about yourself..."
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                {...register('bio')}
              ></textarea>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Resume
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="file"
                  id="resume"
                  className="sr-only"
                  accept={ALLOWED_RESUME_TYPES.join(',')}
                  onChange={handleResumeChange}
                  {...register('resume')}
                />
                <label 
                  htmlFor="resume"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <FileTextIcon size={18} className="mr-2" />
                  Upload Resume
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Max: 5MB (PDF, DOC, DOCX)
                </div>
              </div>
              
              {resumeFileName && (
                <div className="flex items-center space-x-2">
                  <FileTextIcon size={16} className="text-primary-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                    {resumeFileName}
                  </span>
                </div>
              )}
            </div>
            {errors.resume && (
              <span className="text-sm text-error-600 dark:text-error-400">{errors.resume.message}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            I agree to the{' '}
            <Link to="/terms" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              Privacy Policy
            </Link>
          </label>
        </div>
        
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
        >
          Create account
        </Button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;