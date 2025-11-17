import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonFab, IonContent } from '@ionic/react';
import { VirtuosoHandle } from 'react-virtuoso';

interface ScrollToTopFabProps {
  isTop: boolean;
  onScrollToTop: () => void;
  scrollCallbackRef: React.RefObject<(() => void) | null>;
  safeAreaBottom?: boolean;
}

const ScrollToTopFab: React.FC<ScrollToTopFabProps> = React.memo(({ isTop, onScrollToTop, scrollCallbackRef, safeAreaBottom = true }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!isTop) {
        if (!isScrolling) {
          setIsScrolling(true);
        }

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 2000);
      }
    };

    scrollCallbackRef.current = handleScroll;

    return () => {
      scrollCallbackRef.current = null;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isTop, isScrolling, scrollCallbackRef]);

  return (
    <IonFab
      vertical="bottom"
      horizontal="end"
      slot="fixed"
      style={{
        marginBottom: `calc(${safeAreaBottom ? 'var(--ion-safe-area-bottom) + ' : ''}12px)`,
        opacity: (isScrolling && !isTop) ? 1 : 0,
        transform: (isScrolling && !isTop) ? 'scale(1)' : 'scale(0.8)',
        transition: 'all 0.3s ease-in-out',
        pointerEvents: (isScrolling && !isTop) ? 'auto' : 'none'
      }}
    >
      <IonButton mode='md' onTouchStart={onScrollToTop} className='scroll-top-button'>
        <span>상단으로 이동</span>
      </IonButton>
    </IonFab>
  );
});

export default ScrollToTopFab;

export const useScrollToTop = () => {
  const [isTop, setIsTop] = useState(true);
  const scrollCallbackRef = useRef<(() => void) | null>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);

  const scrollToTop = () => {
    if (!contentRef.current) return;
    const contentEl = contentRef.current;
    contentEl.scrollToTop(500);
  };

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      content.getScrollElement().then((scrollElement) => {
        if (scrollElement) {
          const scrollTop = scrollElement.scrollTop;
          setIsTop(scrollTop < 100);

          if (scrollCallbackRef.current) {
            scrollCallbackRef.current();
          }
        }
      });
    };

    content.getScrollElement().then((scrollElement) => {
      if (scrollElement) {
        scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      }
    });

    return () => {
      content.getScrollElement().then((scrollElement) => {
        if (scrollElement) {
          scrollElement.removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, []);

  return {
    isTop,
    scrollToTop,
    scrollCallbackRef,
    contentRef
  };
};


export const useVirtuosoScrollToTop = () => {
  const [isTop, setIsTop] = useState(true);
  const scrollCallbackRef = useRef<(() => void) | null>(null);

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const scrollerElRef = useRef<HTMLElement | null>(null); // DOM element 저장용

  const scrollToTop = () => {
    virtuosoRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const scrollerRef = (ref: HTMLElement | Window | null) => {
    if (ref instanceof HTMLElement) { // HTMLElement일 때만 처리
      scrollerElRef.current = ref;

      const onScroll = () => {
        setIsTop(ref.scrollTop < 100);
        scrollCallbackRef.current?.();
      };

      ref.addEventListener("scroll", onScroll, { passive: true });

      // cleanup: ref가 바뀌거나 컴포넌트 언마운트될 때 제거
      return () => ref.removeEventListener("scroll", onScroll);
    }
  };

  return {
    isTop,
    scrollToTop,
    scrollCallbackRef,
    contentRef: virtuosoRef,
    scrollerRef, // Virtuoso에 전달할 ref callback
  };
};