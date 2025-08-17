// 전역 requestAnimationFrame 기반 애니메이션 시스템

class AnimationFrameManager {
  private callbacks = new Set<() => void>();
  private rafId: number | null = null;
  private isRunning = false;

  constructor() {
    this.tick = this.tick.bind(this);
  }

  private tick() {
    // 모든 등록된 콜백 실행
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Animation callback error:', error);
      }
    });

    if (this.callbacks.size > 0) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.isRunning = false;
      this.rafId = null;
    }
  }

  // 애니메이션 콜백 등록
  subscribe(callback: () => void) {
    this.callbacks.add(callback);
    
    if (!this.isRunning) {
      this.isRunning = true;
      this.rafId = requestAnimationFrame(this.tick);
    }

    // 구독 해제 함수 반환
    return () => {
      this.callbacks.delete(callback);
    };
  }

  // 모든 애니메이션 중지
  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRunning = false;
    this.callbacks.clear();
  }

  // 현재 실행 중인 콜백 수
  get activeCallbacks() {
    return this.callbacks.size;
  }
}

// 전역 인스턴스
export const animationFrameManager = new AnimationFrameManager();

// React Hook for animation frame
export function useAnimationFrame(callback: () => void, deps: any[] = []) {
  const callbackRef = React.useRef(callback);
  
  React.useEffect(() => {
    callbackRef.current = callback;
  });

  React.useEffect(() => {
    const animationCallback = () => callbackRef.current();
    const unsubscribe = animationFrameManager.subscribe(animationCallback);
    
    return unsubscribe;
  }, deps);
}

// 부드러운 값 변화를 위한 유틸리티
export class SmoothValue {
  private currentValue: number;
  private targetValue: number;
  private speed: number;
  private threshold: number;
  private callback?: (value: number) => void;
  private unsubscribe?: () => void;

  constructor(
    initialValue: number = 0,
    speed: number = 0.1,
    threshold: number = 0.01,
    callback?: (value: number) => void
  ) {
    this.currentValue = initialValue;
    this.targetValue = initialValue;
    this.speed = speed;
    this.threshold = threshold;
    this.callback = callback;
  }

  setTarget(value: number) {
    this.targetValue = value;
    
    if (!this.unsubscribe) {
      this.unsubscribe = animationFrameManager.subscribe(() => this.update());
    }
  }

  private update() {
    const diff = this.targetValue - this.currentValue;
    
    if (Math.abs(diff) < this.threshold) {
      this.currentValue = this.targetValue;
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = undefined;
      }
    } else {
      this.currentValue += diff * this.speed;
    }
    
    if (this.callback) {
      this.callback(this.currentValue);
    }
  }

  getValue() {
    return this.currentValue;
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }
}

// 부드러운 스크롤을 위한 유틸리티
export function smoothScrollTo(
  element: HTMLElement,
  targetScrollTop: number,
  duration: number = 300
) {
  const startScrollTop = element.scrollTop;
  const distance = targetScrollTop - startScrollTop;
  const startTime = performance.now();

  function animate() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // easeOutCubic 이징 함수
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    
    element.scrollTop = startScrollTop + distance * easedProgress;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

// React import
import React from 'react';