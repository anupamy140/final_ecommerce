// src/components/shared/ImageWithLoader.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export const ImageWithLoader = ({ src, alt, className }: { src: string; alt: string; className: string; }) => {
    const [isLoading, setIsLoading] = useState(true);
    return (
        <div className={cn("relative overflow-hidden", className)}>
            <AnimatePresence>{isLoading && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />}</AnimatePresence>
            <img 
                src={src} 
                alt={alt} 
                className={cn("w-full h-full object-cover transition-opacity duration-300", isLoading ? 'opacity-0' : 'opacity-100')} 
                onLoad={() => setIsLoading(false)} 
                onError={(e: any) => { e.target.src = `https://placehold.co/600x800/e2e8f0/334155?text=Image+Not+Found`; setIsLoading(false) }}
            />
        </div>
    );
};