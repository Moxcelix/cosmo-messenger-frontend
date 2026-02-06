import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContextOld'
import { ServicesProvider } from './context/ServicesContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <ServicesProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ServicesProvider>
  // </React.StrictMode>,
)