import React from 'react'
import '../styles/ChatLayout.css'

const ForbiddenChat = ({ onBack }) => {
    return (
        <div className="chat-layout-wrapper">
            <div className="chat-layout">
                {/* Кнопка назад всегда видна */}
                <div className="chat-header-forbidden">
                    <button onClick={onBack} className="back-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="chat-title">Доступ запрещен</div>
                </div>
                
                {/* Сообщение о запрете доступа */}
                <div className="forbidden-message-container">
                    <div className="forbidden-message">
                        <div className="forbidden-icon">🚫</div>
                        <h2 className="forbidden-title">Доступ запрещен</h2>
                        <p className="forbidden-description">
                            У вас нет доступа к этому чату.
                        </p>
                        <button 
                            onClick={onBack}
                            className="forbidden-back-button"
                        >
                            Вернуться к списку чатов
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForbiddenChat