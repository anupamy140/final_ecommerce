import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { router } from "./router";

export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); 
        body { 
          font-family: 'Inter', sans-serif; 
          -webkit-font-smoothing: antialiased; 
          -moz-osx-font-smoothing: grayscale; 
        }
        .text-shadow { 
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); 
        }
      `}</style>
      
      {/* Sonner Toaster for rich notifications */}
      <Toaster position="bottom-right" richColors />

      {/* React Router provider that enables all the routing logic */}
      <RouterProvider router={router} />
    </>
  );
}