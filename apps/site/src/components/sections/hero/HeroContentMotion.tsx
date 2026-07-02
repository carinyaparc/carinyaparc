'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function HeroContentMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center"
    >
      {children}
    </motion.div>
  );
}
