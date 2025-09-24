// import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'

// Pages
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ForgetPasswordPage from './pages/ForgetPassword'
import AdminPage from './pages/AdminPage'
import ControlPage from './pages/controlPage'
import HomePage from './pages/home'


export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forget" element={<ForgetPasswordPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/control/*" element={<ControlPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}
