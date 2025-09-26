import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from 'sonner';
// FIX: Using lowercase 'r' to match the new filename
import router from './router';

// --- TypeScript Declaration for Global GSAP ---
declare global {
    interface Window {
        gsap: any;
        Observer: any;
    }
}

// Register GSAP plugin safely
if (window.gsap && window.Observer) {
    window.gsap.registerPlugin(window.Observer);
}

export default function App() {
  return (
    <AppProvider>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; } .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); }`}</style>
      <Toaster position="bottom-right" richColors closeButton />
      <RouterProvider router={router} />
    </AppProvider>
  );
}