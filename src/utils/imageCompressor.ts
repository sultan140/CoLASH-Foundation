/**
 * Client-side High-Resolution WebP / JPEG Image Compressor
 * Preserves visual clarity and aspect ratio while reducing file sizes by up to 80%
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/webp' | 'image/jpeg';
}

export const compressImageFile = (
  file: File,
  options: CompressionOptions = {}
): Promise<{ dataUrl: string; originalSize: number; compressedSize: number; format: string }> => {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    format = 'image/webp'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within max dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
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
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Apply smooth bilinear rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL(format, quality);
          // Fallback if browser doesn't support target format
          if (!dataUrl.startsWith(`data:${format}`)) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Calculate approximate size in bytes from base64 string
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSize = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl,
          originalSize: file.size,
          compressedSize,
          format: dataUrl.split(';')[0].replace('data:', '')
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
