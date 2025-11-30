import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-right"
      containerStyle={{
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          zIndex: 99999,
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#28a745',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#dc3545',
            secondary: '#fff',
          },
        },
      }}
    />
  </StrictMode>,
)
