import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonIcon,
  useIonRouter,
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';

type CommonHeaderProps = {
  title: string;
  showBackButton?: boolean;
  rightButtons?: React.ReactNode;
};

const CommonAppBar: React.FC<CommonHeaderProps> = ({
  title,
  showBackButton = false,
  rightButtons,
}) => {
  const router = useIonRouter();

  return (
    <IonToolbar mode='md'>
      {showBackButton && (
        <IonButtons slot="start">
          <IonButton onClick={() => router.goBack()}>
            <IonIcon icon={arrowBack} />
          </IonButton>
        </IonButtons>
      )}

      <IonTitle>{title}</IonTitle>

      {rightButtons && (
        <IonButtons slot="end">
          {rightButtons}
        </IonButtons>
      )}
    </IonToolbar>
  );
};

export default CommonAppBar;