import React from 'react'
import Login from './components/Login'
import ChatList from './components/ChatList'
import Register from './components/Register'
import ChatPage from './components/ChatPage'
import HomePage from './components/HomePage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DirectChatPage from './components/DirectChatPage'
import { LoginPage } from './pages/Login.page'
import { RegisterPage } from './pages/Register.page'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/chat/direct/:username" element={<DirectChatPage />} />
        <Route path="/new/login" element={<LoginPage />} />
        <Route path="/new/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App