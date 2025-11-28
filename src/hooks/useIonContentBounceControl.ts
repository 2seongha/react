import { useEffect, useCallback, RefObject } from 'react';

const useIonContentBounceControl = (contentRef: HTMLDivElement | null) => {
  const handleScroll = useCallback((event: Event) => {
    const element = event.currentTarget as HTMLDivElement;
    const currentScrollTop = element.scrollTop;

    if (currentScrollTop <= 0) {
      element.style.overflow = 'hidden';
      setTimeout(() => {
        element.style.overscrollBehavior = 'auto';
        // element.style.overflow = 'auto';
      }, 0);
    } else {
      element.style.overscrollBehavior = 'none';
    }
  }, []);

  useEffect(() => {
    const content = contentRef as any;
    if (!content) return;
    content.style.overscrollBehavior = 'none';
    content.addEventListener('scroll', handleScroll);

    return () => content.removeEventListener('scroll', handleScroll);
  }, [contentRef, handleScroll]);
};

export default useIonContentBounceControl;