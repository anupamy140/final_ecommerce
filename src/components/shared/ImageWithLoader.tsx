import { useState } from 'react';
import { cn } from '../../lib/utils';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export const ImageWithLoader = ({ src, alt, className, loading = 'lazy', fetchPriority = 'auto' }: ImageWithLoaderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-gray-200 dark:bg-gray-800", className)}>
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={cn("w-full h-full object-cover transition-opacity duration-500", isLoaded ? 'opacity-100' : 'opacity-0')}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/600x600?text=Error`; }}
      />
    </div>
  );
};