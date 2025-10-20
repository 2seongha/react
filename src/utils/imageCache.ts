import * as images from '../assets/images';

class ImageCache {
  private cache: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  preloadImage(src: string): Promise<HTMLImageElement> {
    // 이미 캐시에 있으면 반환
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src)!);
    }

    // 이미 로딩 중이면 기존 Promise 반환
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // 새로운 이미지 로드
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)));
  }

  async preloadAllAssets(): Promise<void> {
    const imageSources = Object.values(images);
    
    try {
      // 배치로 나누어 로드 (브라우저 부담 줄이기)
      const batchSize = 10;
      for (let i = 0; i < imageSources.length; i += batchSize) {
        const batch = imageSources.slice(i, i + batchSize);
        await this.preloadImages(batch);
      }
      console.log(`All ${imageSources.length} images preloaded successfully`);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }

  getCachedImage(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null;
  }

  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const imageCache = new ImageCache();