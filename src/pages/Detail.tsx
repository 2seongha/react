import { IonContent, IonPage, IonHeader } from '@ionic/react';
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';

interface DetailParams {
  flowNo: string;
}

const Detail: React.FC = () => {
  const { flowNo } = useParams<DetailParams>();
  const [scrollY, setScrollY] = useState(0);
  const contentRef = useRef<HTMLIonContentElement>(null);

  // approvals에서 flowNo에 맞는 approval만 구독 (shallow로 최적화)
  const approval = useAppStore(
    state => state.approvals?.find(approval => approval.flowNo === flowNo) || null,
    shallow
  );

  if (!approval) {
    return (
      <IonPage>
        <AppBar title={<span>상세</span>} showBackButton={true} />
        <IonContent fullscreen>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'var(--ion-color-medium)'
          }}>
            해당 결재 정보를 찾을 수 없습니다.
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppBar title={<span>{approval.apprTitle}</span>} showBackButton={true} />
      <IonContent>
        <div style={{ padding: '20px', lineHeight: '1.8', fontSize: '16px' }}>
          <h1 style={{ marginBottom: '30px', textAlign: 'center', color: 'var(--ion-color-primary)' }}>
            엄청 긴 스크롤 테스트 문서
          </h1>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>1. 서론</h2>
          <p>
            이 문서는 스크롤 성능을 테스트하기 위한 매우 긴 문서입니다. 다양한 종류의 텍스트와 요소들을 포함하여 실제 사용 환경과 유사한 조건에서 스크롤이 얼마나 부드럽게 작동하는지 확인할 수 있습니다. 스크롤 성능은 사용자 경험에 매우 중요한 요소이며, 특히 모바일 환경에서는 더욱 중요합니다.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>2. 스크롤 성능의 중요성</h2>
          <p>
            웹 애플리케이션에서 스크롤 성능은 사용자가 가장 먼저 체감할 수 있는 성능 지표 중 하나입니다. 부드럽지 않은 스크롤은 사용자에게 앱이 느리다는 인상을 주고, 사용성을 크게 떨어뜨릴 수 있습니다. 특히 60fps를 유지하는 것이 중요하며, 이를 위해서는 다양한 최적화 기법이 필요합니다.
          </p>
          <p>
            모바일 디바이스에서는 터치 스크롤링이 주요 인터랙션 방식이므로, 스크롤 성능이 더욱 중요합니다. iOS와 Android는 각각 다른 스크롤 특성을 가지고 있으며, 이를 고려한 최적화가 필요합니다. CSS의 -webkit-overflow-scrolling: touch 속성이나 will-change 속성 등을 활용하여 하드웨어 가속을 적용할 수 있습니다.
          </p>
          
          <div style={{ height: '300px', backgroundColor: '#f0f0f0', margin: '30px 0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#666' }}>
            📊 차트 영역 (300px 높이)
          </div>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>3. Virtual Scrolling 기법</h2>
          <p>
            대량의 데이터를 처리할 때는 Virtual Scrolling 기법을 사용하는 것이 효과적입니다. 이 기법은 화면에 보이는 요소들만 DOM에 렌더링하고, 스크롤할 때 동적으로 요소를 추가/제거하는 방식입니다. React에서는 react-virtuoso, react-window 등의 라이브러리를 활용할 수 있습니다.
          </p>
          <p>
            Virtual Scrolling을 구현할 때 고려해야 할 요소들은 다음과 같습니다: 아이템의 높이 계산, 스크롤 위치 추적, 버퍼링 영역 설정, 동적 높이 처리 등입니다. 특히 동적 높이를 가진 아이템들의 경우 정확한 높이 계산이 중요하며, 이를 위해 측정과 캐싱 메커니즘이 필요합니다.
          </p>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>4. CSS 최적화 기법</h2>
          <p>
            CSS를 통한 스크롤 최적화는 다양한 방법이 있습니다. transform: translateZ(0)을 사용하여 GPU 가속을 강제로 활성화하거나, contain 속성을 사용하여 브라우저의 렌더링 최적화를 도울 수 있습니다. will-change 속성은 브라우저에게 어떤 속성이 변경될 것인지 미리 알려주어 최적화를 준비할 수 있게 합니다.
          </p>
          <p>
            백페이스 가시성(backface-visibility: hidden)을 설정하면 3D 변환 시 뒷면을 숨겨 렌더링 성능을 향상시킬 수 있습니다. 또한 perspective 속성을 사용하여 3D 컨텍스트를 생성하면 하드웨어 가속을 더 효과적으로 활용할 수 있습니다.
          </p>
          
          <div style={{ height: '200px', backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', margin: '30px 0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
            🎨 그라데이션 영역 (200px 높이)
          </div>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>5. JavaScript 최적화</h2>
          <p>
            JavaScript에서 스크롤 이벤트를 처리할 때는 성능에 주의해야 합니다. 스크롤 이벤트는 매우 빈번하게 발생하므로, 이벤트 핸들러에서 무거운 작업을 수행하면 성능 저하가 발생할 수 있습니다. 이를 해결하기 위해 requestAnimationFrame을 사용하거나 쓰로틀링(throttling) 기법을 적용할 수 있습니다.
          </p>
          <p>
            React에서는 useCallback과 useMemo를 적절히 활용하여 불필요한 리렌더링을 방지할 수 있습니다. 특히 스크롤 위치에 따라 동적으로 변경되는 컴포넌트의 경우, 메모이제이션을 통해 성능을 크게 개선할 수 있습니다. 또한 IntersectionObserver API를 사용하여 뷰포트에 들어오는 요소들을 효율적으로 감지할 수 있습니다.
          </p>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>6. 이미지 최적화</h2>
          <p>
            스크롤 성능에 영향을 주는 또 다른 중요한 요소는 이미지입니다. 대용량 이미지는 메모리 사용량을 증가시키고 스크롤을 끊기게 만들 수 있습니다. 이를 해결하기 위해 lazy loading을 구현하거나, 적절한 크기의 이미지를 사용하는 것이 중요합니다.
          </p>
          
          <div style={{ height: '250px', backgroundColor: '#e3f2fd', margin: '30px 0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#1976d2' }}>
            📷 이미지 영역 (250px 높이)
          </div>
          
          <p>
            WebP 포맷과 같은 최신 이미지 포맷을 사용하면 파일 크기를 줄이면서도 품질을 유지할 수 있습니다. 또한 responsive image를 구현하여 디바이스에 맞는 적절한 크기의 이미지를 제공하는 것도 중요합니다.
          </p>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>7. 메모리 관리</h2>
          <p>
            장시간 스크롤을 사용하는 애플리케이션에서는 메모리 누수가 성능 저하의 주요 원인이 될 수 있습니다. 특히 이벤트 리스너의 제거, DOM 요소의 정리, 타이머의 해제 등을 제대로 처리하지 않으면 메모리가 계속 누적될 수 있습니다.
          </p>
          <p>
            React에서는 useEffect의 cleanup 함수를 활용하여 컴포넌트가 언마운트될 때 리소스를 정리할 수 있습니다. 또한 WeakMap이나 WeakSet을 사용하여 가비지 컬렉션이 원활하게 이루어지도록 할 수 있습니다.
          </p>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>8. 디바이스별 최적화</h2>
          <p>
            iOS와 Android는 각각 다른 스크롤 특성을 가지고 있습니다. iOS는 -webkit-overflow-scrolling: touch 속성을 지원하여 네이티브 스크롤링을 제공하며, momentum scrolling을 지원합니다. Android는 overscroll-behavior 속성을 통해 스크롤 바운스 효과를 제어할 수 있습니다.
          </p>
          
          <div style={{ height: '180px', backgroundColor: '#fff3e0', margin: '30px 0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#f57c00' }}>
            📱 모바일 최적화 영역 (180px 높이)
          </div>
          
          <p>
            데스크톱 환경에서는 마우스 휠 이벤트와 키보드 스크롤을 고려해야 하며, 터치 디바이스에서는 터치 제스처와 관성 스크롤링을 고려해야 합니다. 각 플랫폼의 특성에 맞는 최적화를 적용하는 것이 중요합니다.
          </p>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>9. 성능 측정 도구</h2>
          <p>
            스크롤 성능을 정확히 측정하기 위해서는 적절한 도구가 필요합니다. Chrome DevTools의 Performance 탭을 사용하면 프레임 드롭이나 장시간 실행되는 작업을 식별할 수 있습니다. Lighthouse를 사용하면 전반적인 성능 점수와 개선 사항을 확인할 수 있습니다.
          </p>
          <p>
            실제 디바이스에서의 테스트도 중요합니다. 개발 환경의 고성능 컴퓨터에서는 문제가 없어 보이더라도, 실제 사용자의 저사양 디바이스에서는 성능 문제가 발생할 수 있습니다. 다양한 디바이스와 네트워크 환경에서 테스트하는 것이 필요합니다.
          </p>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>10. 실제 구현 사례</h2>
          <p>
            대형 소셜 미디어 플랫폼들은 어떻게 무한 스크롤을 최적화하고 있을까요? Facebook은 자체 개발한 가상화 기술을 사용하여 수천 개의 포스트를 부드럽게 스크롤할 수 있도록 합니다. Twitter는 타임라인의 동적 높이 계산과 이미지 lazy loading을 통해 최적화를 달성합니다.
          </p>
          
          <div style={{ height: '220px', backgroundColor: '#f3e5f5', margin: '30px 0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#7b1fa2' }}>
            🚀 성능 최적화 영역 (220px 높이)
          </div>
          
          <p>
            Netflix는 포스터 이미지의 점진적 로딩과 캐싱을 통해 부드러운 스크롤을 제공합니다. Instagram은 스토리와 피드의 프리로딩을 통해 사용자가 스크롤하기 전에 미리 콘텐츠를 준비합니다.
          </p>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>11. 미래의 기술</h2>
          <p>
            Web API의 발전과 함께 스크롤 최적화 기술도 계속 발전하고 있습니다. CSS Scroll Snap은 스크롤 위치를 특정 지점에 맞추는 기능을 제공하며, Intersection Observer v2는 더 정교한 가시성 감지를 가능하게 합니다.
          </p>
          <p>
            CSS Container Queries가 도입되면 컨테이너 크기에 따른 반응형 디자인이 더욱 정교해질 것이며, 이는 스크롤 성능 최적화에도 새로운 가능성을 열어줄 것입니다.
          </p>
          
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>12. 결론</h2>
          <p>
            스크롤 성능 최적화는 하나의 기법으로 해결되는 것이 아니라, 다양한 기술과 최적화 방법을 조합하여 달성해야 하는 목표입니다. CSS 최적화, JavaScript 최적화, 이미지 최적화, 메모리 관리 등 모든 영역에서 균형 잡힌 접근이 필요합니다.
          </p>
          <p>
            무엇보다 중요한 것은 실제 사용자 환경에서의 테스트와 측정입니다. 이론적인 최적화보다는 실제 성능 개선에 집중하고, 사용자 경험을 최우선으로 고려하는 것이 성공적인 최적화의 핵심입니다.
          </p>
          
          <div style={{ height: '300px', backgroundColor: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)', margin: '30px 0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white', fontWeight: 'bold' }}>
            🎯 마지막 영역 (300px 높이)
          </div>
          
          <p style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginTop: '60px', marginBottom: '60px', color: 'var(--ion-color-primary)' }}>
            스크롤 테스트 완료! 🎉
          </p>
          
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#666', marginBottom: '100px' }}>
            이 문서의 총 높이는 약 4000px 이상입니다.<br/>
            부드러운 스크롤을 경험해보세요!
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Detail;
