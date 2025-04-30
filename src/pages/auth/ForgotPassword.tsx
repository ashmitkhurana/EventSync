import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MailIcon, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const { resetPassword, isLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<ForgotPasswordFormData>();
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword(data.email);
      setEmail(data.email);
      setSubmitted(true);
    } catch (error) {
      // In a real app, handle specific error cases
      console.error('Error resetting password:', error);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!submitted ? (
        <>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Reset your password
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your email and we'll send you instructions to reset your password
            </p>
          </div>
          
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
            
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
            >
              Send reset instructions
            </Button>
            
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to sign in
              </Link>
            </div>
          </form>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto w-16 h-16 bg-success-50 dark:bg-success-900/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={32} className="text-success-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Check your email
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We've sent password reset instructions to:
            <br />
            <span className="font-medium">{email}</span>
          </p>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or 
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium ml-1"
              >
                try another email address
              </button>
            </p>
            
            <Link to="/login">
              <Button variant="outline" fullWidth>
                Back to sign in
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ForgotPassword;