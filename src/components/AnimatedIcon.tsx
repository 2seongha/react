import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import React, { useEffect, useRef, useState } from 'react';
import lottieSuccessData from '../assets/lottie_success.json'
import lottieLoadingData from '../assets/lottie_loading.json'
import lottieWarningData from '../assets/lottie_warning.json'
import lottieErrorData from '../assets/lottie_error.json'

interface AnimatedIconProps {
  status?: string | null;
  style?: React.CSSProperties;
  onAnimationComplete?: () => void;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ status, style, onAnimationComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  useEffect(() => {
    if (status && lottieRef && lottieRef.current && lottieRef.current.animationItem) {
      lottieRef.current!.animationItem!.loop = false;
    }

    return;
  }, [status]);

  const handleLoadingComplete = () => {
    if (!lottieRef.current!.animationItem!.loop) {
      setIsLoading(false);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return lottieSuccessData;
      case 'error':
        return lottieErrorData;
      case 'warning':
        return lottieWarningData;
      default:
        return lottieLoadingData;
    }
  }


  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={isLoading ? lottieLoadingData : getStatusIcon()}
      loop={isLoading}
      style={{ width: 100, height: 100, ...style }}
      onComplete={isLoading ? handleLoadingComplete : undefined}
    />
  );
};

export default AnimatedIcon;