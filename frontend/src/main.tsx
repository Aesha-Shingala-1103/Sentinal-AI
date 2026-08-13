import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'reactflow/dist/style.css';
import App from './App.tsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
  <App />
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        background: "#0F172A",
        color: "#fff",
        border: "1px solid rgba(34,211,238,.3)",
      },
    }}
  />
</>
  </StrictMode>,
)
