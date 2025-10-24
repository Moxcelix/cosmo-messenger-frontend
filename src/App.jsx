import React from 'react'
import Login from './components/Login'
import ChatList from './components/ChatList'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/chats" element={<ChatList />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App