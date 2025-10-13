import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import React, { useEffect, useRef, useState } from 'react';
import lottieSuccessData from '../assets/lottie_success.json'
import lottieLoadingData from '../assets/lottie_loading.json'
import lottieWarningData from '../assets/lottie_warning.json'
import lottieErrorData from '../assets/lottie_error.json'

interface AnimatedIconProps {
  status?: string | null;
  style?: React.CSSProperties;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ status, style }) => {
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
      style={{ width: 120, height: 120, ...style }}
      onComplete={isLoading ? handleLoadingComplete : undefined}
    />
  );
};

export default AnimatedIcon;