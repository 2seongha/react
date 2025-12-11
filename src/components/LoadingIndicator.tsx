import './LoadingIndicator.css';

export interface LoadingIndicatorProps {
  color?: string,
  style?: React.CSSProperties
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ color, style }) => {
  return (
    <div
      className="loader"
      style={{
        ...(color ? { ['--loader-color' as any]: color } : {}),
        ...style,   // ★ 외부 style 이 마지막에 와야 override 가능
      }}
    />
  );
};

export default LoadingIndicator;