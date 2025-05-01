import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { MailIcon, LockIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<{ message: string; code?: string } | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        navigate('/');
      } else {
        setLoginError({ message: result.error || 'An error occurred', code: result.code });
      }
    } catch {
      setLoginError({ message: 'An unexpected error occurred. Please try again later.' });
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
          Welcome back
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your credentials to sign in to your account
        </p>
      </div>
      
      <AnimatePresence mode="wait">
        {loginError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-error-50 text-error-600 dark:bg-error-900/50 dark:text-error-300 rounded-lg flex items-start"
          >
            <AlertCircle size={20} className="mr-3 flex-shrink-0 mt-0.5" />
            <span>{loginError.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>
          
          <Link to="/forgot-password" className="text-sm font-medium text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300">
            Forgot password?
          </Link>
        </div>
        
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
        >
          Sign in
        </Button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className="font-medium text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;