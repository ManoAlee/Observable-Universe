import React from 'react';
import { motion } from 'framer-motion';

interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

interface BentoItemProps {
    children: React.ReactNode;
    span?: number; // 1 to 4
    rowSpan?: number; // 1 to 4
    className?: string;
    delay?: number;
}

export function BentoGrid({ children, className = '' }: BentoGridProps) {
    return (
        <div className={`grid grid-cols-4 gap-4 p-4 w-full h-full pointer-events-none ${className}`}>
            {children}
        </div>
    );
}

export function BentoItem({ children, span = 1, rowSpan = 1, className = '', delay = 0 }: BentoItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 120,
                damping: 15,
                delay: delay * 0.1
            }}
            className={`
            pointer-events-auto
            col-span-${span} 
            row-span-${rowSpan} 
            bg-black/40 
            backdrop-blur-xl 
            border border-white/10 
            rounded-2xl 
            p-4 
            shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] 
            hover:border-white/30 
            transition-colors
            flex flex-col
            ${className}
        `}
            style={{ gridColumn: `span ${span}`, gridRow: `span ${rowSpan}` }}
        >
            {children}
        </motion.div>
    );
}
