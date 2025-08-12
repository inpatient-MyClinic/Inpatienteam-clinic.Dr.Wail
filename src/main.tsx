import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SystemInitializationService } from './services/systemInitializationService'

// Initialize system services safely
SystemInitializationService.initialize();

// Ensure cleanup on hot module replacement
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    SystemInitializationService.cleanup();
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
