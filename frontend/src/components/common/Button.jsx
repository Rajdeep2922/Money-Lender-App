import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    icon: Icon,
    type = 'button',
    disabled = false
}) => {
    const baseStyles = "inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:from-teal-600 hover:to-cyan-600",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40",
        ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </motion.button>
    );
};

export default Button;
