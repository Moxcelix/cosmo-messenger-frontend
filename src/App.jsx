import React from 'react'
import Login from './components/Login'
import ChatList from './components/ChatList'
import Register from './components/Register'
import ChatPage from './components/ChatPage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App