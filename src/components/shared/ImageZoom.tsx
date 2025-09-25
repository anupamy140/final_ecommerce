// src/components/shared/ImageZoom.tsx
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export const ImageZoom = ({ src, alt }: { src: string; alt: string; }) => {
    const [showZoom, setShowZoom] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef<HTMLImageElement>(null);
    const lensSize = 150;
    const zoomLevel = 2.5;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imgRef.current) return;
        const { left, top, width, height } = imgRef.current.getBoundingClientRect();
        let x = e.clientX - left;
        let y = e.clientY - top;
        if (x > width - (lensSize / 2)) x = width - (lensSize / 2);
        if (x < (lensSize / 2)) x = (lensSize / 2);
        if (y > height - (lensSize / 2)) y = height - (lensSize / 2);
        if (y < (lensSize / 2)) y = (lensSize / 2);
        setMousePos({ x, y });
    };

    const lensX = mousePos.x - (lensSize / 2);
    const lensY = mousePos.y - (lensSize / 2);
    const bgPosX = -(mousePos.x * zoomLevel - lensSize * 1.25);
    const bgPosY = -(mousePos.y * zoomLevel - lensSize * 1.25);

    return (
        <div
            className="relative w-full aspect-square"
            onMouseEnter={() => !isLoading && setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={handleMouseMove}
        >
            <AnimatePresence>{isLoading && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />}</AnimatePresence>
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={cn("w-full h-full object-cover rounded-xl transition-opacity duration-300", isLoading ? 'opacity-0' : 'opacity-100')}
                onLoad={() => setIsLoading(false)}
            />
            <AnimatePresence>
                {showZoom && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute pointer-events-none rounded-lg border-2 border-white bg-white/20 backdrop-blur-sm"
                            style={{ width: lensSize, height: lensSize, top: lensY, left: lensX }}
                        />
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute top-0 left-[105%] h-full w-full pointer-events-none hidden md:block bg-no-repeat border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900"
                            style={{
                                backgroundImage: `url(${src})`,
                                backgroundSize: `${(imgRef.current?.width || 0) * zoomLevel}px ${(imgRef.current?.height || 0) * zoomLevel}px`,
                                backgroundPosition: `${bgPosX}px ${bgPosY}px`,
                            }}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};