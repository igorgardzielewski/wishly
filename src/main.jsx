import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n.js'
import {AuthProvider} from "./AuthContext.jsx";
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <AuthProvider>
    <App/>
      </AuthProvider>
  </StrictMode>,
)
