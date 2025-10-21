import {
  IonContent,
  IonPage,
} from '@ionic/react';
import React from 'react';
import AppBar from '../components/AppBar';
const TermsOfUse: React.FC = () => {
  return (
    <IonPage className="more">
      <AppBar title={<span>서비스 이용약관</span>} showBackButton={true} />
      <IonContent>
        <div style={{ padding: '21px', maxWidth: '800px', margin: '0 auto' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제1조(목적)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              이 약관은 아이에스티엔(주)(이하 "회사")가 제공하는 iFLOW5 모바일 서비스의 이용과 관련하여 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제2조(정의)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              <li><strong>"서비스"</strong>: 다양한 단말기에서 이용 가능한 회사의 제반 서비스를 의미합니다.</li>
              <li><strong>"이용자"</strong>: 서비스를 받는 개인회원, 기업회원, 비회원을 말합니다.</li>
              <li><strong>"개인회원"</strong>: 개인정보를 제공하여 등록한 지속적 서비스 이용자를 말합니다.</li>
              <li><strong>"기업회원"</strong>: 기업정보 및 개인정보를 제공하여 등록한 지속적 서비스 이용자를 말합니다.</li>
              <li><strong>"비회원"</strong>: 회원가입 없이 서비스를 이용하는 자를 말합니다.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제3조(약관의 효력 및 변경)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              이 약관은 서비스 화면이나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다. 회사는 합리적인 사유가 발생될 경우에는 이 약관을 변경할 수 있으며, 약관이 변경되는 경우에는 지체 없이 공지합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제4조(서비스의 제공)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 다음과 같은 서비스를 제공합니다.
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              <li>업무 프로세스 관리 서비스</li>
              <li>전자결재 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제5조(서비스 이용계약의 성립)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              서비스 이용계약은 이용신청자가 약관에 동의하고 회사가 승낙함으로써 성립됩니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제6조(회원가입)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제7조(회원정보의 변경)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회원은 개인정보관리를 통해 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다. 회원은 회원가입신청 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편 기타 방법으로 회사에 대하여 그 변경사항을 알려야 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제8조(개인정보보호 의무)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고 이를 준수합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제9조(회사의 의무)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 지속적이고 안정적인 서비스의 제공을 위하여 설비에 장애가 생기거나 멸실된 때에는 이를 지체 없이 수리 또는 복구합니다. 다만, 천재지변, 비상사태 또는 그 밖에 부득이한 경우에는 그 서비스를 일시 중단할 수 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제10조(회원의 의무)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회원은 다음 행위를 하여서는 안 됩니다.
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              <li>신청 또는 변경 시 허위 내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제11조(저작권의 귀속 및 이용제한)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제12조(계약해지 및 이용제한)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회원이 이용계약을 해지하고자 하는 때에는 회원 본인이 온라인을 통하여 회사에 해지신청을 하여야 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제13조(손해배상)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 고의 또는 중대한 과실로 인한 손해를 제외하고 이에 대하여 책임을 부담하지 아니합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제14조(분쟁해결)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              제15조(서비스의 해제·해지 및 탈퇴 절차)
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)', marginBottom: '16px' }}>
              이용자는 언제든지 홈페이지 상단의 고객센터 또는 내 정보관리 메뉴 등을 통하여 이용계약 해지 신청을 할 수 있으며, 회사는 관련법 등이 정하는 바에 따라 이를 즉시 처리하여야 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--ion-text-color)' }}>
              부칙
            </h2>
            <p style={{ lineHeight: '1.6', color: 'var(--ion-color-step-600)' }}>
              본 약관은 2024년 11월 15일부터 적용됩니다.
            </p>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TermsOfUse;