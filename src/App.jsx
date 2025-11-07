import React from 'react'
import Login from './components/Login'
import ChatList from './components/ChatList'
import Register from './components/Register'
import ChatPage from './components/ChatPage'
import HomePage from './components/HomePage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DirectChatPage from './components/DirectChatPage'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App