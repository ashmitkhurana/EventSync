import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MailIcon, LockIcon, UserIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [signupError, setSignupError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<SignupFormData>();
  
  const password = watch('password');
  
  const onSubmit = async (data: SignupFormData) => {
    setSignupError(null);
    try {
      const result = await signup(data.name, data.email, data.password);
      if (result.success) {
        navigate('/');
      } else {
        setSignupError(result.error || 'Failed to create an account. Please try again.');
      }
    } catch (error) {
      setSignupError('An unexpected error occurred. Please try again later.');
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
        <p className="text-gray-600 dark:text-gray-300">
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