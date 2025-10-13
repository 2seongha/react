import { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { setupIonicReact } from '@ionic/react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import lottieSuccessData from './assets/lottie_success.json'
import lottieLoadingData from './assets/lottie_loading.json'
import lottieWarningData from './assets/lottie_warning.json'
import lottieErrorData from './assets/lottie_error.json'

import App from './App'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
// import '@ionic/react/css/padding.css';
// import '@ionic/react/css/float-elements.css';
// import '@ionic/react/css/text-alignment.css';
// import '@ionic/react/css/text-transformation.css';
// import '@ionic/react/css/flex-utils.css';
// import '@ionic/react/css/display.css';

import './index.css';
import './App.css';

setupIonicReact({
  animated: true,
  rippleEffect: true,
  scrollPadding: false,
  scrollAssist: false
});

createRoot(document.getElementById('root')!).render(
  <App />
)
