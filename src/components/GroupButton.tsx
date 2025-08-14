import React, { useRef, useState, useEffect } from 'react';
import './GroupButton.css';
import useAppStore from '../stores/appStore';
import CustomSkeleton from './CustomSkeleton';

const GroupButton: React.FC = () => {
  const [selected, setSelected] = useState<{ value: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const todoSummary = useAppStore(state => state.todoSummary);
  const setApprovals = useAppStore(state => state.setApprovals);
  const fetchApprovals = useAppStore(state => state.fetchApprovals);

  // todoSummary가 변경될 때 selected index 조정
  useEffect(() => {
    if (todoSummary && todoSummary.length > 0) {
      // selected index가 배열 범위를 벗어나면 조정
      let newIndex = selected == null ? { value: 0 } : { ...selected };
      if (newIndex.value >= todoSummary.length) {
        newIndex.value = Math.max(0, todoSummary.length - 1);
        // 새로 선택된 버튼으로 스크롤
        setTimeout(() => {
          const button = buttonRefs.current[newIndex.value];
          button?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 0);
      }
      setSelected(newIndex);
    } else {
      setSelected(null);
    }
  }, [todoSummary]);

  useEffect(() => {
    if (selected == null) return;
    console.log("선택변경");
    fetchApprovals();
  }, [selected]);

  const handleClick = (index: number) => {
    setApprovals(null);
    setSelected({ value: index });
    const button = buttonRefs.current[index];
    button?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  if (todoSummary && todoSummary.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className='group-button-wrapper'
    >
      {todoSummary ? (
        todoSummary.map((item, index) => (
          <button
          key={`group-button${index}`}
            ref={(el) => { (buttonRefs.current[index] = el) }}
            onClick={() => handleClick(index)}
            className={`group-button ${selected?.value === index ? 'selected' : ''}`}
          >
            {item.oLtext} ({item.cnt})
          </button>
        ))
      ) : (
        Array.from({ length: 10 }).map((_, index) => (
          <CustomSkeleton
            key={`group-button${index}`}
            width={80}
            height={30}
            style={{ borderRadius: '16px' }}
          />
        ))
      )}
    </div>
  );
}

export default GroupButton;