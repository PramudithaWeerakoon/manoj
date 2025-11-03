/**
 * Image optimization utilities
 */

import sharp from 'sharp';

/**
 * Optimizes an image buffer for web delivery
 * @param imageBuffer Original image buffer
 * @param options Optimization options
 * @returns Optimized image buffer
 */
export async function optimizeImage(
  imageBuffer: Buffer, 
  options: {
    width?: number;
    height?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'avif';
    quality?: number;
  } = {}
) {
  const {
    width = 1920,
    height = null,
    format = 'webp',
    quality = 80
  } = options;

  try {
    let sharpInstance = sharp(imageBuffer)
      .resize(width, height, { 
        fit: 'inside', 
        withoutEnlargement: true 
      });
    
    // Apply format-specific optimization
    switch (format) {
      case 'webp':
        return await sharpInstance.webp({ quality }).toBuffer();
      case 'jpeg':
        return await sharpInstance.jpeg({ quality, progressive: true }).toBuffer();
      case 'png':
        return await sharpInstance.png({ quality, progressive: true }).toBuffer();
      case 'avif':
        return await sharpInstance.avif({ quality }).toBuffer();
      default:
        return await sharpInstance.webp({ quality }).toBuffer();
    }
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Return original buffer if optimization fails
    return imageBuffer;
  }
}

/**
 * Generates a placeholder blur data URL for an image
 * @param imageBuffer Image buffer
 * @returns Base64 data URL string
 */
export async function generateBlurPlaceholder(imageBuffer: Buffer): Promise<string> {
  try {
    const placeholder = await sharp(imageBuffer)
      .resize(10, 10, { fit: 'inside' })
      .blur(2)
      .webp({ quality: 20 })
      .toBuffer();
    
    return `data:image/webp;base64,${placeholder.toString('base64')}`;
  } catch (error) {
    console.error('Failed to generate blur placeholder:', error);
    // Return a simple transparent placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEUQJKXeKhBQAAAABJRU5ErkJggg==';
  }
}