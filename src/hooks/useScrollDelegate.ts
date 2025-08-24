import { useEffect } from 'react';
import { animateScroll as scroll } from 'react-scroll';

interface UseSnapScrollProps {
  scrollContainer: HTMLElement | null;
  tabsElement: HTMLElement | null;
  isHeaderVisible: boolean;
}

export const useSnapScroll = ({ 
  scrollContainer, 
  tabsElement,
  isHeaderVisible 
}: UseSnapScrollProps) => {

  const snapToPosition = (direction: 'up' | 'down') => {
    console.log('snapToPosition called:', direction, !!scrollContainer);
    if (!scrollContainer) return;

    if (direction === 'down') {
      // 아래로 스크롤: top으로 snap
      console.log('Snapping to top');
      scroll.scrollTo(0, {
        containerId: 'scroll-container',
        duration: 150,
        smooth: 'easeOutQuad'
      });
    } else {
      // 위로 스크롤: tabs 위치로 snap
      if (tabsElement) {
        const tabsTop = tabsElement.offsetTop;
        console.log('Snapping to tabs:', tabsTop);
        scroll.scrollTo(tabsTop, {
          containerId: 'scroll-container',
          duration: 150,
          smooth: 'easeOutQuad'
        });
      }
    }
  };

  // scrollContainer에 id 설정
  useEffect(() => {
    if (scrollContainer) {
      scrollContainer.id = 'scroll-container';
    }
  }, [scrollContainer]);

  return {
    snapToPosition
  };
};