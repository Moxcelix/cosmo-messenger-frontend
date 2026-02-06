import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(username, password);
        } catch (err) {
            console.log(err)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Вход</h2>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            <div>
                <label>Логин:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                />
            </div>

            <div>
                <label>Пароль:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                />
            </div>

            <button type="submit" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
            </button>
        </form>
    );
};