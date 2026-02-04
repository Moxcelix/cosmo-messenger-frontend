import React, { useState, useRef, useEffect } from 'react'
import '../styles/MessageInput.css'

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
        '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'
    ]

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
        if (newMessage.trim()) {
            onSendMessage(newMessage)
            setShowEmojiPicker(false)
        }
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
            
            setTimeout(() => {
                input.focus()
                input.setSelectionRange(start + emoji.length, start + emoji.length)
            }, 0)
        }
    }

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    return (
        <div className="message-input-container">
            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div 
                    ref={emojiPickerRef}
                    className="emoji-picker"
                >
                    <div className="emoji-grid">
                        {emojis.map((emoji, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleEmojiClick(emoji)}
                                className="emoji-button"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="message-input-form">
                <div className="input-wrapper">
                    {/* Кнопка эмодзи внутри инпута */}
                    <button
                        type="button"
                        onClick={toggleEmojiPicker}
                        className="emoji-button-inside"
                    >
                        <svg className="emoji-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    {/* Поле ввода */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onBlur={onStopTyping}
                        placeholder={displayName ? `Введите сообщение для ${displayName}...` : 'Введите сообщение...'}
                        className="message-input-field"
                        disabled={sending}
                    />

                    {/* Кнопка отправки внутри инпута */}
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="send-button-inside"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    )
}

export default MessageInput