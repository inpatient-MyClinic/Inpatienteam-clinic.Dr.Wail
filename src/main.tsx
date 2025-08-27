import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SystemInitializationService } from './services/systemInitializationService'

// Initialize system services safely
try {
  SystemInitializationService.initialize();
} catch (error) {
  console.error('System initialization failed:', error);
}

// Ensure cleanup on hot module replacement
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    try {
      SystemInitializationService.cleanup();
    } catch (error) {
      console.error('System cleanup failed:', error);
    }
  });
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
