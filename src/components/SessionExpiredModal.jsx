import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/SessionExpiredModal.css';

const SessionExpiredModal = () => {
    const { logout } = useAuth();

    const handleConfirm = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Кто здесь?</h2>
                </div>
                
                <div className="modal-body">
                    <p>Похоже, придется еще раз убедиться, что это вы 😔</p>
                    <div className="session-info">
                        <span>Нужно будет заново авторизоваться, дружочек</span>
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        className="confirm-button"
                        onClick={handleConfirm}
                    >
                        🔒 Войти снова
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal;