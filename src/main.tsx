import { createRoot } from 'react-dom/client'
import { setupIonicReact } from '@ionic/react'

import App from './App'

/* Core CSS required for Ionic components to work properly */
// import '@ionic/react/css/core.css';

// /* Basic CSS for apps built with Ionic */
// import '@ionic/react/css/normalize.css';
// import '@ionic/react/css/structure.css';
// import '@ionic/react/css/typography.css';

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
