'use client';

import { motion } from 'framer-motion';

const Skeleton = ({ className }) => {
    return (
        <motion.div
            className={`bg-gray-700 rounded-md ${className}`}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
    );
};

export default Skeleton;