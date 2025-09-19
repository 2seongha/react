import React, { useState, useRef } from 'react';
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
  IonInput,
  IonImg,
  IonButton,
  IonAlert,
  IonActionSheet,
  IonModal
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';
import { webviewTheme, webviewBadge, webviewToast, webviewHaptic } from '../webview';
import { themeIcon, bellIcon, lockIcon } from '../assets/images';

const Settings: React.FC = () => {
  const themeMode = useAppStore(state => state.themeMode);
  const setThemeMode = useAppStore(state => state.setThemeMode);
  const [badgeNumber, setBadgeNumber] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Input refs
  const badgeInputRef = useRef<HTMLIonInputElement | null>(null);
  const toastInputRef = useRef<HTMLIonInputElement | null>(null);

  const handleThemeChange = (value: string) => {
    const newTheme = value as 'light' | 'dark' | 'system';

    // AppStore에 저장 (영구적으로 localStorage에 저장됨)
    setThemeMode(newTheme);

    // 웹뷰에 테마 변경 알림
    webviewTheme(newTheme);
  };

  const handleBadgeTest = () => {
    console.log('Badge 테스트:', badgeNumber);
    webviewBadge(badgeNumber);
  };

  const handleToastTest = () => {
    console.log('Toast 테스트:', toastMessage);
    webviewToast(toastMessage);
  };

  const handleHapticTest = (hapticType: string) => {
    console.log('Haptic 테스트:', hapticType);
    webviewHaptic(hapticType);
  };

  // Focus handlers for inputs
  const handleInputFocus = (inputRef: React.RefObject<HTMLIonInputElement | null>) => {
    if (inputRef.current) {
      const inputElement = inputRef.current;
      inputElement.style.opacity = "0";

      // 클론에 포커스
      setTimeout(() => {
        inputElement.style.opacity = "1";
      });
    }
  };


  return (
    <IonPage>
      <AppBar title={<span>설정</span>} showBackButton={true} />
      <IonContent>
        <IonList>
          <IonItem>
            <IonImg
              src={themeIcon}
              style={{ width: '24px', height: '24px', marginRight: '16px' }}
              alt="theme icon"

            />
            <IonLabel>
              <h3>테마 설정</h3>
              <IonSegment
                value={themeMode}
                onIonChange={e => handleThemeChange(e.detail.value as string)}
                style={{ marginTop: '8px' }}
              >
                <IonSegmentButton value="light">
                  <IonLabel>라이트</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="system">
                  <IonLabel>시스템</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="dark">
                  <IonLabel>다크</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonLabel>
          </IonItem>

          <IonItem button>
            <IonImg
              src={bellIcon}
              style={{ width: '24px', height: '24px', marginRight: '16px' }}
              alt="notification icon"

            />
            <IonLabel>알림 설정</IonLabel>
          </IonItem>

          <IonItem button>
            <IonImg
              src={lockIcon}
              style={{ width: '24px', height: '24px', marginRight: '16px' }}
              alt="security icon"

            />
            <IonLabel>보안 설정</IonLabel>
          </IonItem>

          {/* 배지 테스트 섹션 */}
          <IonItem>
            <IonLabel position="stacked">배지 숫자 테스트</IonLabel>
            <div style={{ position: 'relative' }}>
              <IonInput
                ref={badgeInputRef}
                type="number"
                value={badgeNumber}
                placeholder="숫자를 입력하세요"
                onIonInput={(e) => setBadgeNumber(e.detail.value!)}
                onFocus={() => handleInputFocus(badgeInputRef)}
                style={{ marginTop: '8px' }}
              />
            </div>
          </IonItem>

          <IonItem>
            <IonButton
              expand="block"
              onClick={handleBadgeTest}
              disabled={!badgeNumber.trim()}
              style={{ width: '100%', height: '48px' }}
            >
              webviewBadge 테스트 실행
            </IonButton>
          </IonItem>

          {/* 토스트 테스트 섹션 */}
          <IonItem>
            <IonLabel position="stacked">토스트 메시지 테스트</IonLabel>
            <div style={{ position: 'relative' }}>
              <IonInput
                ref={toastInputRef}
                type="text"
                value={toastMessage}
                placeholder="토스트 메시지를 입력하세요"
                onIonInput={(e) => setToastMessage(e.detail.value!)}
                onFocus={() => handleInputFocus(toastInputRef)}
                style={{ marginTop: '8px' }}
              />
            </div>
          </IonItem>

          <IonItem>
            <IonButton
              expand="block"
              onClick={handleToastTest}
              disabled={!toastMessage.trim()}
              style={{ width: '100%', height: '48px' }}
              color="secondary"
            >
              webviewToast 테스트 실행
            </IonButton>
          </IonItem>

          {/* 햅틱 테스트 섹션 */}
          <IonItem>
            <IonLabel>
              <h3>햅틱 피드백 테스트</h3>
              <p>다양한 햅틱 피드백을 테스트해보세요</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', paddingBottom: '100px' }}>
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => handleHapticTest('lightImpact')}
                color="success"
                style={{ height: '48px' }}
              >
                Light Impact
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                onClick={() => handleHapticTest('mediumImpact')}
                color="warning"
                style={{ height: '48px' }}
              >
                Medium Impact
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                onClick={() => handleHapticTest('heavyImpact')}
                color="danger"
                style={{ height: '48px' }}
              >
                Heavy Impact
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                onClick={() => handleHapticTest('selectionClick')}
                color="medium"
                style={{ height: '48px' }}
              >
                Selection Click
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                onClick={() => handleHapticTest('vibrate')}
                color="dark"
                style={{ height: '48px' }}
              >
                Vibrate
              </IonButton>
            </div>
          </IonItem>

          {/* Dialog/Modal 테스트 섹션 */}
          <IonItem>
            <IonLabel>
              <h3>Dialog & Modal 테스트</h3>
              <p>다양한 Dialog와 Modal을 테스트해보세요</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', paddingBottom: '100px' }}>
              <IonButton
                expand="block"
                onClick={() => setIsAlertOpen(true)}
                color="primary"
                style={{ height: '48px' }}
              >
                Alert Dialog 테스트
              </IonButton>

              <IonButton
                expand="block"
                onClick={() => setIsActionSheetOpen(true)}
                color="secondary"
                style={{ height: '48px' }}
              >
                Action Sheet (Bottom Sheet) 테스트
              </IonButton>

              <IonButton
                expand="block"
                onClick={() => setIsModalOpen(true)}
                color="tertiary"
                style={{ height: '48px' }}
              >
                Modal Dialog 테스트
              </IonButton>
            </div>
          </IonItem>
        </IonList>

        {/* Alert Dialog with Input */}
        <IonAlert
          isOpen={isAlertOpen}
          onDidDismiss={() => setIsAlertOpen(false)}
          header="사용자 입력"
          subHeader="Alert Dialog with Input 테스트"
          message="이름을 입력해주세요:"
          inputs={[
            {
              name: 'name',
              type: 'text',
              placeholder: '이름을 입력하세요',
              attributes: {
                maxlength: 20,
              },
            },
            {
              name: 'age',
              type: 'number',
              placeholder: '나이를 입력하세요',
              min: 1,
              max: 100,
              attributes: {
              },
            },
            {
              name: 'email',
              type: 'email',
              placeholder: '이메일을 입력하세요',
              attributes: {
              },
            }
          ]}
          buttons={[
            {
              text: '취소',
              role: 'cancel',
              handler: () => {
                webviewHaptic('lightImpact');
              }
            },
            {
              text: '확인',
              handler: (alertData) => {
                webviewHaptic('mediumImpact');
                const { name, age, email } = alertData;
                webviewToast(`입력된 정보: ${name}, ${age}세, ${email}`);
              }
            }
          ]}
        />

        {/* Action Sheet (Bottom Sheet) with Swipe to Dismiss */}
        <IonActionSheet
          isOpen={isActionSheetOpen}
          onDidDismiss={() => setIsActionSheetOpen(false)}
          header="액션 선택"
          subHeader="아래로 드래그하거나 옵션을 선택하세요"
          canDismiss={true}
          showBackdrop={true}
          backdropDismiss={true}
          keyboardClose={true}
          animated={true}
          enterAnimation={undefined}
          leaveAnimation={undefined}
          buttons={[
            {
              text: '📄 문서 보기',
              icon: 'document-text-outline',
              handler: () => {
                webviewHaptic('selectionClick');
                webviewToast('문서 보기를 선택했습니다');
              }
            },
            {
              text: '📷 사진 촬영',
              icon: 'camera-outline',
              handler: () => {
                webviewHaptic('selectionClick');
                webviewToast('사진 촬영을 선택했습니다');
              }
            },
            {
              text: '📁 파일 업로드',
              icon: 'cloud-upload-outline',
              handler: () => {
                webviewHaptic('selectionClick');
                webviewToast('파일 업로드를 선택했습니다');
              }
            },
            {
              text: '🔗 링크 공유',
              icon: 'share-outline',
              handler: () => {
                webviewHaptic('selectionClick');
                webviewToast('링크 공유를 선택했습니다');
              }
            },
            {
              text: '⭐ 즐겨찾기 추가',
              icon: 'star-outline',
              handler: () => {
                webviewHaptic('mediumImpact');
                webviewToast('즐겨찾기에 추가했습니다');
              }
            },
            {
              text: '🗑️ 삭제',
              icon: 'trash-outline',
              role: 'destructive',
              handler: () => {
                webviewHaptic('heavyImpact');
                webviewToast('삭제 옵션을 선택했습니다');
              }
            },
            {
              text: '취소',
              role: 'cancel',
              handler: () => {
                webviewHaptic('lightImpact');
              }
            }
          ]}
        />

        {/* Modal Dialog */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Modal Dialog</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>닫기</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{ padding: '20px' }}>
              <h2>Modal Dialog 테스트</h2>
              <p>이것은 전체 화면 Modal입니다.</p>
              <p>렌더링 성능과 애니메이션을 확인해보세요.</p>

              <IonList>
                <IonItem>
                  <IonLabel>Modal 내부 리스트 아이템 1</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Modal 내부 리스트 아이템 2</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Modal 내부 리스트 아이템 3</IonLabel>
                </IonItem>
              </IonList>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <IonButton
                  expand="block"
                  onClick={() => {
                    webviewHaptic('mediumImpact');
                    webviewToast('Modal에서 액션을 실행했습니다!');
                  }}
                >
                  액션 실행
                </IonButton>
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  모달 닫기
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Settings;