import React from 'react'
import Login from './components/Login'
import ChatList from './components/ChatList'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './components/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App