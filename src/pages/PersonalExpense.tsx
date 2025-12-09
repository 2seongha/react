import React, { useCallback, useRef, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonPage,
  useIonRouter,
  useIonViewWillEnter,
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';
import "./PersonalExpense.css";
import { addOutline } from 'ionicons/icons';
import PersonalExpenseAddModal from '../components/PersonalExpenseAddModal';
import CachedImage from '../components/CachedImage';
import { banknotesGlassIcon } from '../assets/images';
import SearchHelpModal from '../components/SearchHelpModal';
import { getStart } from '../stores/service';
import { webviewToast } from '../webview';
import _ from 'lodash';

const PersonalExpense: React.FC = () => {
  const router = useIonRouter();
  const [approval, setApproval] = useState(null); // 상신 템플릿
  const [docItem, setDocItem] = useState(null); // 항목 추가 바인딩
  const oriItem = useRef(null); // 항목 템플릿

  useIonViewWillEnter(() => {
    const initApproval = async () => {
      const approval = await getStart('IA103');
      if (approval instanceof Error) {
        router.goBack();
        webviewToast('예상치 못한 오류가 발생했습니다. 잠시 후 시도해주세요.');
      }
      console.log(approval);
      oriItem.current = approval.FLOWHD_DOCITEM[0];
      approval.FLOW_DOCITEM = [];
      setApproval(approval);
    }
    initApproval();
  });

  // 항목 추가
  const handleAddItem = useCallback(() => {
    setDocItem(_.cloneDeep(oriItem.current));
  }, []);

  return (
    <IonPage className='personal-expense'>
      <AppBar title={<span>임직원 개인경비</span>} showBackButton={true} />
      <IonContent
        fullscreen
        scrollX={false}
        scrollY={false}
        scrollEvents={false}
        style={{
          '--padding-top': '12px',
          '--padding-start': '21px',
          '--padding-end': '21px',
        }}>
        <div style={{
          paddingTop: '26px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          <CachedImage src={banknotesGlassIcon} width={130} height={130}></CachedImage>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '24px 0'
          }}>
            <span style={{ fontSize: '18px', fontWeight: '500', marginBottom: '2px' }}>임직원 개인경비 상신을 위해</span>
            <span style={{ fontSize: '18px', fontWeight: '500' }}>항목을 추가해주세요</span>
          </div>
        </div>
        <IonButton
          type='button'
          id='personal-expense-add-modal-trigger'
          mode='md'
          onClick={handleAddItem}
          style={{
            marginTop: '21px',
            width: '100%',
            height: '58px',
            '--background': 'transparent',
            '--color': 'var(--ion-color-step-900)',
            '--ripple-color': 'transparent',
            borderRadius: '17px',
            border: '1px dashed var(--custom-border-color-100)',
            fontSize: '16px'
          }}>
          {<IonIcon src={addOutline} style={{ marginRight: '2px' }} />}항목 추가
        </IonButton>

        {/* 항목 추가 모달 */}
        <PersonalExpenseAddModal
          trigger='personal-expense-add-modal-trigger'
          docItem={docItem}
        />
        {/* 서치 헬프 모달 */}
        <SearchHelpModal />

      </IonContent>
      <IonFooter style={{
        boxShadow: 'none',
      }}>
        <div
          style={{
            height: "auto",
            width: "100%",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 21px",
            gap: "12px",
            paddingBottom: 'calc( var(--ion-safe-area-bottom) + 12px )',
          }}
        >
          <IonButton
            mode="md"
            color="primary"
            disabled
            style={{
              flex: 1.5,
              height: "58px",
              fontSize: "18px",
              fontWeight: "600",
            }}
            id="approve-modal"
            onClick={() => {
            }}
          >
            <span>다음 단계</span>
          </IonButton>
        </div>
      </IonFooter>
    </IonPage >
  );
};

export default PersonalExpense;