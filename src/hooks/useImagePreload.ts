import { useEffect, useState } from 'react';
import { imageCache } from '../utils/imageCache';

export const useImagePreload = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        await imageCache.preloadAllAssets();
        setLoadedCount(imageCache.getCacheSize());
      } catch (error) {
        console.warn('Image preloading failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    preloadImages();
  }, []);

  return { isLoading, loadedCount };
};

export const useImageCache = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        await imageCache.preloadImage(src);
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load image');
      }
    };

    loadImage();
  }, [src]);

  return { isLoaded, error, cachedImage: imageCache.getCachedImage(src) };
};