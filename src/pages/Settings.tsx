import React, { useState, useRef, ReactNode } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonButton,
  IonAlert,
  IonActionSheet,
  IonModal,
  IonInput,
  IonIcon,
  IonToggle
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';
import CustomInput from '../components/CustomInput';
import { webviewTheme, webviewBadge, webviewToast, webviewHaptic } from '../webview';
import { themeIcon, bellIcon, lockIcon } from '../assets/images';
import CachedImage from '../components/CachedImage';
import { contrastOutline, moonOutline, sunnyOutline } from 'ionicons/icons';
import { Widgets } from '@mui/icons-material';

const Settings: React.FC = () => {
  const themeMode = useAppStore(state => state.themeMode);
  const setThemeMode = useAppStore(state => state.setThemeMode);

  const handleThemeChange = (value: string) => {
    const newTheme = value as 'light' | 'dark' | 'system';

    // AppStore에 저장 (영구적으로 localStorage에 저장됨)
    setThemeMode(newTheme);

    // 웹뷰에 테마 변경 알림
    webviewTheme(newTheme);
  };



  return (
    <IonPage>
      <AppBar title={<span>설정</span>} showBackButton={true} />
      <IonContent style={{
        '--padding-start': '21px',
        '--padding-end': '21px',
      }}>
        <span style={{ fontSize: '17px', fontWeight: '600', marginTop: '28px', marginBottom: '12px', display: 'block' }}>테마</span>
        <MenuItem title={'모드'} iconSrc={themeIcon} content={
          <IonSegment
            mode='ios'
            value={themeMode}
            onIonChange={e => handleThemeChange(e.detail.value as string)}
            style={{
              width: '210px',
              '--background': 'transparent',
              border: '1px solid var(--custom-border-color-100)'
            }}
          >
            <IonSegmentButton value="light" style={{
              '--indicator-color': 'rgba(var(--ion-color-primary-rgb), .5)',
              '--border-color': 'var(--custom-border-color-100)'
            }}>
              <IonIcon src={sunnyOutline} size='small'></IonIcon>
            </IonSegmentButton>
            <IonSegmentButton value="system" style={{
              '--indicator-color': 'rgba(var(--ion-color-primary-rgb), .5)',
              '--border-color': 'var(--custom-border-color-100)'
            }}>
              <IonIcon src={contrastOutline} size='small'></IonIcon>
            </IonSegmentButton>
            <IonSegmentButton value="dark" style={{
              '--indicator-color': 'rgba(var(--ion-color-primary-rgb), .5)',
              '--border-color': 'var(--custom-border-color-100)'
            }}>
              <IonIcon src={moonOutline} size='small'></IonIcon>
            </IonSegmentButton>
          </IonSegment>
        } />
        <span style={{ fontSize: '17px', fontWeight: '600', marginTop: '36px', marginBottom: '12px', display: 'block' }}>푸시알림</span>
        <MenuItem title={'개인알림'} iconSrc={bellIcon} content={
          <IonToggle />
        } />
        <MenuItem title={'공지알림'} iconSrc={bellIcon} content={
          <IonToggle />
        } />
      </IonContent>
    </IonPage >
  );
};

interface MenuItemProps {
  id?: string;
  iconSrc?: string;
  title: string;
  onClick?: () => void;
  routerLink?: string;
  content?: ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({ id, iconSrc, title, onClick, routerLink, content }) => {
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
    <div
      style={{
        padding: '12px 0',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        {iconSrc && (
          <div style={iconContainerStyle}>
            <CachedImage src={iconSrc} width={'22px'} />
          </div>
        )}
        <span style={titleStyle}>{title}</span>
      </div>
      {content}
    </div>
  );
};

export default Settings;