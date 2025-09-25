// src/components/ui/Dialog.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Dialog = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50" onClick={onClose} />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ ease: "easeOut", duration: 0.2 }} className="relative z-10">
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
);