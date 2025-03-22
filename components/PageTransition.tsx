'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  transitionType?: 'slide' | 'fade' | 'scale' | 'rotate';
  duration?: number;
}

const PageTransition = ({ 
  children, 
  transitionType = 'slide',
  duration = 0.5 
}: PageTransitionProps) => {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);

  // Update width on window resize for responsive animations
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define different animation variants
  const getAnimationVariants = () => {
    const isMobile = width < 768;
    const distance = isMobile ? 100 : 300;
    
    switch (transitionType) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'scale':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 }
        };
      case 'rotate':
        return {
          initial: { rotate: 5, opacity: 0, scale: 0.9 },
          animate: { rotate: 0, opacity: 1, scale: 1 },
          exit: { rotate: -5, opacity: 0, scale: 0.9 }
        };
      case 'slide':
      default:
        return {
          initial: { x: distance, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -distance, opacity: 0 }
        };
    }
  };

  const variants = getAnimationVariants();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ 
          type: 'spring', 
          stiffness: 100, 
          damping: 20,
          duration: duration
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;