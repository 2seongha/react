import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonPage,
  useIonViewDidEnter,
  useIonViewWillEnter,
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';
import "./PersonalExpense.css";
import { addOutline, arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import NoData from '../components/NoData';
import { MobileStepper, Step, StepLabel, Stepper } from '@mui/material';
import PersonalExpenseAddModal from '../components/PersonalExpenseAddModal';
import CachedImage from '../components/CachedImage';
import { banknotesGlassIcon } from '../assets/images';

const PersonalExpense: React.FC = () => {
  const [step, setStep] = useState(0);

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
        {/* <MobileStepper
          variant="progress"
          steps={3}
          position="static"
          activeStep={step}
          sx={{
            padding: 0,
            flexGrow: 1,
            "& .MuiLinearProgress-root": {
              width: '100%',
              height: '2px',
              backgroundColor: 'var(--custom-border-color-50)',      // 진행 바 색
            },
            "& .MuiLinearProgress-bar": {
              backgroundColor: 'var(--ion-color-primary)',      // 진행 바 색
            },
          }}
          backButton={undefined}
          nextButton={undefined} /> */}
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
        {/* <NoData message={`데이터가 없습니다.\n경비 항목을 추가해 주세요.`}></NoData> */}
        {/* <span>아래 '행 추가' 버튼을 눌러 경비 항목을 추가해 주세요.</span> */}
        <IonButton
          type='button'
          id='personal-expense-add-modal-trigger'
          mode='md'
          style={{
            marginTop: '21px',
            width: '100%',
            height: '58px',
            '--background': 'transparent',
            '--color': 'var(--ion-color-step-900)',
            borderRadius: '17px',
            border: '1px dashed var(--custom-border-color-100)',
            fontSize: '16px'
          }}>
          {<IonIcon src={addOutline} style={{ marginRight: '2px' }} />}항목 추가
        </IonButton>
        <PersonalExpenseAddModal
          trigger='personal-expense-add-modal-trigger'
        />
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