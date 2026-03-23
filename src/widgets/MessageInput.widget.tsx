import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import '../styles/MessageInput.css';

interface MessageInputProps {
    newMessage: string;
    onMessageChange: (message: string) => void;
    onSendMessage: (message: string) => void;
    sending: boolean;
    onStopTyping: () => void;
    displayName?: string;
}

const MessageInputWidget: React.FC<MessageInputProps> = ({
    newMessage,
    onMessageChange,
    onSendMessage,
    sending,
    onStopTyping,
    displayName
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const emojis: string[] = [
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
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Функция для обновления высоты textarea
    const updateTextAreaHeight = () => {
        if (textAreaRef.current) {
            const textarea = textAreaRef.current;
            // Сбрасываем высоту до минимальной, чтобы scrollHeight корректно считался
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 120);
            const finalHeight = Math.max(40, newHeight);
            textarea.style.height = `${finalHeight}px`;

            // Обновляем высоту контейнера
            const inputWrapper = textarea.closest('.input-wrapper') as HTMLElement;
            if (inputWrapper) {
                inputWrapper.style.height = 'auto';
                inputWrapper.style.height = `${Math.max(52, finalHeight + 8)}px`;
            }
        }
    };

    // Вызываем при каждом изменении сообщения
    useEffect(() => {
        updateTextAreaHeight();
    }, [newMessage]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setShowEmojiPicker(false);

            // Сбрасываем высоту после отправки
            setTimeout(() => {
                if (textAreaRef.current) {
                    textAreaRef.current.style.height = '40px';
                    const inputWrapper = textAreaRef.current.closest('.input-wrapper') as HTMLElement;
                    if (inputWrapper) {
                        inputWrapper.style.height = '52px';
                    }
                }
            }, 0);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onMessageChange(e.target.value);
    };

    const handleEmojiClick = (emoji: string) => {
        const textarea = textAreaRef.current;
        if (textarea) {
            const start = textarea.selectionStart || 0;
            const end = textarea.selectionEnd || 0;
            const newValue = newMessage.substring(0, start) + emoji + newMessage.substring(end);

            onMessageChange(newValue);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + emoji.length, start + emoji.length);
            }, 0);
        }
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    return (
        <div className="message-input-container">
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
                <div className="input-wrapper" style={{ minHeight: '52px', height: 'auto', alignItems: 'flex-start' }}>
                    {/* Кнопка эмодзи */}
                    <button
                        type="button"
                        onClick={toggleEmojiPicker}
                        className="emoji-button-inside mt-1"
                        aria-label="Выбрать эмодзи"
                    >
                        <svg className="emoji-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    {/* Поле ввода */}
                    <textarea
                        ref={textAreaRef}
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onBlur={onStopTyping}
                        placeholder={displayName ? `Введите сообщение для ${displayName}...` : 'Введите сообщение...'}
                        className="message-input-field  mt-1"
                        disabled={sending}
                        rows={1}
                        style={{
                            minHeight: '40px',
                            maxHeight: '120px',
                            resize: 'none',
                            overflowY: 'auto',
                            lineHeight: '1.4',
                            padding: '10px 0',
                            flex: 1
                        }}
                        aria-label="Введите сообщение"
                    />

                    {/* Кнопка отправки */}
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="send-button-inside"
                        aria-label="Отправить сообщение"

                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MessageInputWidget;