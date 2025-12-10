import React, { useState, useRef, useEffect } from 'react'

const MessageInput = ({
    newMessage,
    onMessageChange,
    onSendMessage,
    sending,
    onStopTyping,
    displayName
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const emojiPickerRef = useRef(null)
    const inputRef = useRef(null)

    // Базовый набор эмодзи
    const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
        '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
        '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
        '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
        '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
        '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
        '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
        '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟',
        '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
        '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
        '💋', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎',
        '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟',
        '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️',
        '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏',
        '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴'
    ]

    // Закрытие пикера при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSendMessage(newMessage)
        setShowEmojiPicker(false)
    }

    const handleInputChange = (e) => {
        onMessageChange(e.target.value)
    }

    const handleEmojiClick = (emoji) => {
        const input = inputRef.current
        if (input) {
            const start = input.selectionStart
            const end = input.selectionEnd
            const newValue = newMessage.substring(0, start) + emoji + newMessage.substring(end)
            
            onMessageChange(newValue)
            
            // Фокусируем обратно на инпут и устанавливаем курсор после эмодзи
            setTimeout(() => {
                input.focus()
                input.setSelectionRange(start + emoji.length, start + emoji.length)
            }, 0)
        }
    }

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker)
    }

    return (
        <div className="flex-shrink-0 bg-white border-t p-4 safe-area-bottom relative">
            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div 
                    ref={emojiPickerRef}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto"
                >
                    <div className="p-3">
                        <div className="grid grid-cols-8 gap-1">
                            {emojis.map((emoji, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex space-x-2">
                {/* Кнопка эмодзи */}
                <button
                    type="button"
                    onClick={toggleEmojiPicker}
                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>

                {/* Поле ввода */}
                <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onBlur={onStopTyping}
                    placeholder={displayName ? `Введите сообщение для ${displayName}...` : 'Введите сообщение...'}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    disabled={sending}
                />

                {/* Кнопка отправки */}
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="flex-shrink-0 w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-full font-medium transition-colors flex items-center justify-center"
                >
                    {sending ? '...' : '➤'}
                </button>
            </form>
        </div>
    )
}

export default MessageInput