// src/components/ui/Sheet.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Sheet = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; }) => (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40" onClick={onClose} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-950 shadow-xl flex flex-col">
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
);