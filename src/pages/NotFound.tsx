import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound: React.FC = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page not found
        </motion.h1>

        <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300 mb-8">
          Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or never existed.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button icon={<Home size={16} />} iconPosition="left">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;