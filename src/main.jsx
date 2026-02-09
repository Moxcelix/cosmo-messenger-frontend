import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProviderOld } from './context/AuthContextOld'
import { AuthProvider } from './context/AuthContext'
import { ServicesProvider } from './context/ServicesContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <ServicesProvider>
    <AuthProviderOld>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AuthProviderOld>
  </ServicesProvider>
  // </React.StrictMode>,
)