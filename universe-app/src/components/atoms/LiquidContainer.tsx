import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiquidContainerProps {
    children: React.ReactNode;
    delay?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    className?: string;
}

export default function LiquidContainer({ children, delay = 0, direction = 'up', className = '' }: LiquidContainerProps) {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
            x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
            scale: 0.95,
            filter: 'blur(10px)'
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20,
                mass: 1,
                delay: delay
            }
        },
        exit: {
            opacity: 0,
            filter: 'blur(10px)',
            scale: 0.95,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            className={`liquid-container ${className}`}
        >
            {children}
        </motion.div>
    );
}
