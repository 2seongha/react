import {
  IonContent,
  IonPage,
} from '@ionic/react';
import React from 'react';
import AppBar from '../components/AppBar';
import { useParams } from 'react-router-dom';

const Attach: React.FC = () => {
  let { FileName, AttachUrl } = useParams<{ FileName: string, AttachUrl: string }>();
  FileName = decodeURIComponent(FileName);
  AttachUrl = decodeURIComponent(AttachUrl);
  // AttachUrl = 'https://www.istn.co.kr';

  return (
    <IonPage className="attach">
      <AppBar title={<span
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",   // 줄바꿈 금지
          overflow: "hidden",     // 넘치는 부분 숨김
          textOverflow: "ellipsis" // ... 처리
        }}
      >
        {FileName}
      </span>} showBackButton={true} titleCenter={false} />
      <IonContent scrollEvents={false} scrollY={false}>
        <iframe
          src={AttachUrl}
          title={FileName}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Attach;
