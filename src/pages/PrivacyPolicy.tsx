import {
  IonContent,
  IonPage,
} from '@ionic/react';
import React from 'react';
import AppBar from '../components/AppBar';
const PrivacyPolicy: React.FC = () => {
  return (
    <IonPage className="more">
      <AppBar title={<span>개인정보처리방침</span>} showBackButton={true} />
      <IonContent>
        <div style={{ padding: '0 21px var(--ion-safe-area-bottom) 21px', maxWidth: '800px', margin: '0 auto' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제1조(목적)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              아이에스티엔(주)는 "회사 서비스"를 이용하는 개인의 정보를 보호하기 위해, 개인정보보호법, 정보통신망법 등 관련 법령을 준수하고 서비스 이용자의 개인정보 보호 관련 고충을 신속하고 원활하게 처리할 수 있도록 개인정보처리방침을 수립합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제2조(개인정보 처리의 원칙)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 법령 및 방침에 따라 이용자의 개인정보를 수집할 수 있으며, 수집된 개인정보는 개인의 동의가 있는 경우에 한해 제3자에게 제공될 수 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제3조(개인정보의 수집 및 이용목적)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 다음과 같은 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: 'var(--ion-color-step-600)' }}>
              <li>서비스 제공을 위한 회원 관리</li>
              <li>서비스 이용에 따른 본인인증, 개인 식별</li>
              <li>부정이용 방지 및 비인가 사용 방지</li>
              <li>서비스 개선 및 신규 서비스 개발</li>
              <li>고객상담 및 불만처리</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제4조(수집하는 개인정보의 항목)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집하고 있습니다.
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: 'var(--ion-color-step-600)' }}>
              <li><strong>필수항목:</strong> 아이디, 비밀번호, 이름, 연락처</li>
              <li><strong>자동수집항목:</strong> IP주소, 쿠키, 서비스 이용기록, 접속 로그</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제5조(개인정보의 보유 및 이용기간)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 개인정보 수집 및 이용목적이 달성된 후에는 예외 없이 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: 'var(--ion-color-step-600)' }}>
              <li><strong>회원 탈퇴 시:</strong> 즉시 파기</li>
              <li><strong>법령에 의한 보존:</strong> 관련 법령에서 정한 기간</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제6조(개인정보의 제3자 제공)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: 'var(--ion-color-step-600)' }}>
              <li>이용자의 사전 동의를 얻은 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제7조(개인정보의 파기)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제8조(개인정보보호책임자)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.
            </p>
            <div style={{ backgroundColor: 'var(--ion-color-light)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <p style={{ margin: '0', lineHeight: '1.6', color: 'var(--ion-color-step-600)' }}>
                <strong>개인정보보호책임자:</strong> 아이에스티엔(주)<br/>
                <strong>연락처:</strong> 고객센터를 통해 문의
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제9조(권익침해 구제방법)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              정보주체는 개인정보보호법 등 관계법령이 정하는 바에 따라 다음과 같은 기관에 개인정보 침해신고를 할 수 있습니다.
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: 'var(--ion-color-step-600)' }}>
              <li>개인정보보호위원회: privacy.go.kr / 국번없이 182</li>
              <li>개인정보침해신고센터: privacy.go.kr / 국번없이 182</li>
              <li>대검찰청: www.spo.go.kr / 국번없이 1301</li>
              <li>경찰청: ecrm.cyber.go.kr / 국번없이 182</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제10조(개인정보처리방침 변경)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              부칙
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)' }}>
              본 방침은 2024년 1월 1일부터 시행됩니다.
            </p>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PrivacyPolicy;