"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center">        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="mb-4"
        >
          <div className="relative h-16 w-16 mx-auto">
            <img 
              src="/radioo.png" 
              alt="Radioo Logo" 
              className="h-full w-full" 
              onError={(e) => {
                // Fallback to a styled text logo if image fails to load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-lg font-bold';
                  fallback.innerText = 'RM';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-lg text-muted-foreground"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}