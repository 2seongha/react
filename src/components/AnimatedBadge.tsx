import React, { useState, useEffect } from 'react';
import SlotCounter from 'react-slot-counter';
import './AnimatedBadge.css';

interface AnimatedBadgeProps {
  count: number;
}

const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({ count }) => {

  return (
    <div className='animated-badge'>
      {count == 0 ? <span>0</span> : <SlotCounter
        value={count}
        startValue={0}
        autoAnimationStart={true}
      />}
    </div>
  );
};

export default AnimatedBadge;