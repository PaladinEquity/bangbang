'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  maxWidth?: string;
  padding?: string;
  id?: string;
}

/**
 * A responsive container component with Awwwards-style animations
 * Use this component to wrap content sections for consistent responsive behavior
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  animate = true,
  maxWidth = 'max-w-7xl',
  padding = 'px-2 sm:px-4 md:px-6 lg:px-8',
  id,
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.1,
      },
    },
  };

  if (animate) {
    return (
      <motion.div
        id={id}
        className={`w-full mx-auto ${maxWidth} ${padding} ${className}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div id={id} className={`w-full mx-auto ${maxWidth} ${padding} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;