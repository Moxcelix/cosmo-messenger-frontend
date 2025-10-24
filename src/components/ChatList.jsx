import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ChatProgress from './ChatProgress'

const ChatList = () => {
  const { authFetch, logout, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  
  const isMounted = useRef(true)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    isMounted.current = true
    
    return () => {
      isMounted.current = false
    }
  }, [])

  const loadChats = useCallback(async (pageNum = 1, append = false) => {    
    if (loading || !isMounted.current || !isAuthenticated) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await authFetch(`/api/v1/chats?page=${pageNum}&count=10`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!isMounted.current) {
        return
      }
      
      if (append) {
        setChats(prev => [...prev, ...data.chats])
      } else {
        setChats(data.chats)
      }
      
      setHasMore(data.meta.has_next)
      setTotal(data.meta.total)
      setPage(pageNum)
      initialLoadDone.current = true
      
    } catch (error) {
      if (!isMounted.current) {
        return
      }
      
      if (error.message.includes('Session expired') || error.message.includes('401')) {
        logout()
        navigate('/login')
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [authFetch, loading, isAuthenticated, logout, navigate])

  useEffect(() => {    
    if (isAuthenticated && !initialLoadDone.current) {
      loadChats(1, false)
    }
  }, [isAuthenticated]) 

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    
    if (isNearBottom && hasMore && !loading && initialLoadDone.current) {
      loadChats(page + 1, true)
    }
  }, [hasMore, loading, page, loadChats])

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl">Проверка авторизации...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl">Не авторизован</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Шапка */}
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Чаты</h1>
          <p className="text-gray-500 text-sm">
            Всего чатов: {total} • Загружено: {chats.length}
          </p>
        </div>
        <button 
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Выйти
        </button>
      </div>

      {/* Список чатов */}
      <div 
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {chats.length === 0 && !loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-lg mb-2">Чатов нет</div>
            <div className="text-sm">Попробуйте создать новый чат</div>
          </div>
        ) : (
          chats.map(chat => (
            <ChatListItem key={chat.id} chat={chat} />
          ))
        )}
        
        {loading && (
          <div className="p-4 text-center text-gray-500">
            Загрузка чатов...
          </div>
        )}
        
        {!hasMore && chats.length > 0 && (
          <div className="p-4 text-center text-gray-400 border-t">
            Все чаты загружены
          </div>
        )}
      </div>

      <ChatProgress 
        loaded={chats.length} 
        total={total} 
        hasMore={hasMore} 
      />
    </div>
  )
}

const ChatListItem = ({ chat }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-4 border-b hover:bg-gray-50 cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {chat.name}
          </h3>
          
          {chat.last_message && (
            <>
              <p className="text-gray-600 text-sm truncate mt-1">
                <span className="font-medium">
                  {chat.last_message.sender.name}:
                </span>{' '}
                {chat.last_message.content}
              </p>
              
              <div className="flex items-center mt-1 space-x-2">
                <span className="text-xs text-gray-400">
                  {formatTime(chat.last_message.timestamp)}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs capitalize text-gray-400">
                  {chat.type === 'direct' ? 'личный' : 'групповой'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatList