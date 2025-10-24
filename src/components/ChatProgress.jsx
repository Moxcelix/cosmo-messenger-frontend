import React from 'react'

const ChatProgress = ({ loaded, total, hasMore }) => {
  const progress = total > 0 ? (loaded / total) * 100 : 0
  
  return (
    <div className="px-4 py-2 bg-gray-100 border-t">
      <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
        <span>Загружено: {loaded} из {total}</span>
        <span>{hasMore ? 'Еще есть...' : 'Все загружено'}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default ChatProgress