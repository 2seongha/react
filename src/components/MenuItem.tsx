import React from 'react';
import CachedImage from './CachedImage';

interface MenuItemProps {
  icon?: string;
  iconSrc?: string;
  title: string;
  onClick?: () => void;
  routerLink?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, iconSrc, title, onClick, routerLink }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'var(--ion-text-color)',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s ease',
    marginBottom: '4px'
  };

  const iconContainerStyle = {
    backgroundColor: 'var(--ion-background-color2)',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    marginRight: '12px'
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: '500'
  };

  const content = (
    <>
      {iconSrc && (
        <div style={iconContainerStyle}>
          <CachedImage src={iconSrc} width={'28px'} />
        </div>
      )}
      <span style={titleStyle}>{title}</span>
    </>
  );

  if (routerLink) {
    return (
      <a href={routerLink} style={itemStyle} onClick={handleClick}>
        {content}
      </a>
    );
  }

  return (
    <div style={itemStyle} onClick={handleClick}>
      {content}
    </div>
  );
};

export default MenuItem;