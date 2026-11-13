import React, { useState } from 'react';

/**
 * Image Quality & Optimization Utilities for CoLASH Foundation Platform
 * Ensures crisp resolution, device-independent clarity, and safe storage limits.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * High-fidelity client-side image compression using HTML5 Canvas.
 * Prevents blurry downscaling while preventing localStorage quota exceeded errors.
 */
export async function optimizeAndCompressImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  const {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.88,
    mimeType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: mimeType === 'image/png' });
        if (!ctx) {
          return resolve(readerEvent.target?.result as string);
        }

        // Apply high-quality bicubic downsampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw background white for transparent JPEGs
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const optimizedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(optimizedDataUrl);
        } catch {
          // Fallback to original if toDataURL fails
          resolve(readerEvent.target?.result as string);
        }
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Default high-resolution fallback assets
 */
export const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=85';
export const FALLBACK_PROJECT = '/src/assets/images/education_support_project_1792170806647.jpg';
export const FALLBACK_DOC = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=85';

/**
 * Returns safe image URL with fallback protection
 */
export function getSafeImageUrl(url?: string | null, fallbackType: 'avatar' | 'project' | 'doc' = 'avatar'): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    if (fallbackType === 'project') return FALLBACK_PROJECT;
    if (fallbackType === 'doc') return FALLBACK_DOC;
    return FALLBACK_AVATAR;
  }
  return url;
}

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'avatar' | 'project' | 'doc';
  containerClassName?: string;
}

/**
 * Production-grade responsive Image component with error recovery and lazy loading
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = 'Image',
  fallbackType = 'avatar',
  className = '',
  containerClassName = '',
  loading = 'lazy',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => getSafeImageUrl(src, fallbackType));
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sync if src prop changes
  React.useEffect(() => {
    setImgSrc(getSafeImageUrl(src, fallbackType));
    setHasError(false);
  }, [src, fallbackType]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallbackType === 'project') setImgSrc(FALLBACK_PROJECT);
      else if (fallbackType === 'doc') setImgSrc(FALLBACK_DOC);
      else setImgSrc(FALLBACK_AVATAR);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-90'}`}
      {...props}
    />
  );
};
