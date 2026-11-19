import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/common/ErrorBoundary';
import {FirebaseErrorBoundary} from './components/common/FirebaseErrorBoundary';
import {FirebaseProvider} from './contexts/FirebaseContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <FirebaseErrorBoundary>
    <ErrorBoundary>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </ErrorBoundary>
  </FirebaseErrorBoundary>
);
