import React, { Profiler } from 'react'
import Login from './components/Login'
import ChatList from './components/ChatList'
import Register from './components/Register'
import ChatPage from './components/ChatPage'
import HomePage from './components/HomePage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DirectChatPage from './components/DirectChatPage'
import { LoginPage } from './pages/Login.page'
import { RegisterPage } from './pages/Register.page'
import { ChatsPage } from './pages/Chats.page'
import { ProfilePage } from './pages/Profile.page'
import { AuthProviderOld } from './context/AuthContextOld'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (

    <BrowserRouter>
      <AuthProvider>
        <AuthProviderOld>
          <Routes>

            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
            <Route path="/chat/direct/:username" element={<DirectChatPage />} />


            <Route path="/new/login" element={<LoginPage />} />
            <Route path="/new/register" element={<RegisterPage />} />
            <Route path="/new/chats" element={<ChatsPage />} />
            <Route path="/new/profile" element={<ProfilePage />} />
          </Routes>
        </AuthProviderOld>
      </AuthProvider>

    </BrowserRouter>


  )
}

export default App