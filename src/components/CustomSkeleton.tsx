import React from 'react';
import Skeleton, { SkeletonProps } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface CustomSkeletonProps extends SkeletonProps {
  className?: string;
}

const CustomSkeleton: React.FC<CustomSkeletonProps> = ({ className, ...props }) => {
  return (
    <Skeleton
      duration={.8}
      className={className}
      baseColor="var(--skeleton-base-color)"
      highlightColor="var(--skeleton-hilight-color)"
      {...props}
    />
  );
};

export default CustomSkeleton;