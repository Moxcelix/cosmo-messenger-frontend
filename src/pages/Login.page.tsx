import { LoginForm } from '../widgets/LoginForm.widget';

export const LoginPage = () => {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <LoginForm />
      <p>
        Нет аккаунта? <a href="/new/register">Зарегистрироваться</a>
      </p>
    </div>
  );
};