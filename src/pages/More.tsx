import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
} from '@ionic/react';
import React from 'react';
import AppBar from '../components/AppBar';
import BottomTabBar from '../components/BottomNavigation';
import { webviewLogout } from '../webview';
import CustomDialog from '../components/Dialog';
import CachedImage from '../components/CachedImage';
import { clipboardIcon, copyMoreIcon, gearIcon, informationIcon, logoutIcon } from '../assets/images';

const More: React.FC = () => {
  const handleLogout = () => {
    webviewLogout();
  };

  return (
    <IonPage className="more">
      <AppBar title={<span>더보기</span>} showMenuButton={true} />
      <IonContent>
        <IonList style={{ padding: '0 9px' }}>
          <MenuItem
            iconSrc={gearIcon}
            title="설정"
            routerLink="/settings"
          />
          <MenuItem
            iconSrc={informationIcon}
            title="버전"
          />
          <MenuItem
            iconSrc={clipboardIcon}
            title="개인정보처리방침"
            routerLink="/privacyPolicy"
          />
          <MenuItem
            iconSrc={copyMoreIcon}
            title="서비스 이용약관"
            routerLink="/termsOfUse"
          />
          <MenuItem
            id='logout-trigger'
            iconSrc={logoutIcon}
            title="로그아웃"
          />
        </IonList>
        <CustomDialog
          trigger="logout-trigger"
          title="알림"
          message="로그아웃 하시겠습니까?"
          firstButtonText='아니오'
          secondButtonText='예'
          onSecondButtonClick={handleLogout}
        />
      </IonContent>
      <BottomTabBar />
    </IonPage>
  );
};

interface MenuItemProps {
  id?: string;
  iconSrc?: string;
  title: string;
  onClick?: () => void;
  routerLink?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ id, iconSrc, title, onClick, routerLink }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const iconContainerStyle = {
    backgroundColor: 'var(--ion-background-color2)',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    marginRight: '12px'
  };

  const titleStyle = {
    fontSize: '15px',
    fontWeight: '500'
  };

  return (
    <IonItem
      id={id}
      button
      mode='md'
      routerLink={routerLink}
      onClick={handleClick}
      style={{
        '--padding-start': '12px',
        '--padding-end': '12px',
        '--padding-top': '12px',
        '--padding-bottom': '12px',
        '--border-radius': '12px'
      }}>
      {iconSrc && (
        <div style={iconContainerStyle}>
          <CachedImage src={iconSrc} width={'22px'} />
        </div>
      )}
      <span style={titleStyle}>{title}</span>
    </IonItem>
  );
};

export default More;