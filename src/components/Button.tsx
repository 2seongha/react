import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant = 'primary',
  disabled = false,
  size = 'medium'
}) => {
  const getButtonClasses = (): string => {
    const baseClasses = 'button';
    const variantClasses = {
      primary: 'button--primary',
      secondary: 'button--secondary',
      danger: 'button--danger'
    };
    const sizeClasses = {
      small: 'button--small',
      medium: 'button--medium',
      large: 'button--large'
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'button--disabled' : ''}`;
  };

  return (
    <button
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button; 