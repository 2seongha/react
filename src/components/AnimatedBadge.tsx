import React from 'react';
import SlotCounter from 'react-slot-counter';
import './AnimatedBadge.css';

interface AnimatedBadgeProps {
  count: number;
}

const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({ count }) => {
  if (count === 0) {
    return (
      <div className='animated-badge'>
        <span>0</span>
      </div>
    );
  }
  return (
    <div className='animated-badge'>
      <SlotCounter
        value={count}
        duration={0.3}
        useMonospaceWidth={true}
      />
    </div>
  );
};

export default AnimatedBadge;