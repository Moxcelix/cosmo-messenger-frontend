import { RegisterForm } from '../widgets/RegisterForm.widget';
import style from '../styles/RegisterPage.module.css'

export const RegisterPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
            <div className={style.registerPageContainer}>
                <RegisterForm />
            </div>
        </div>
    );
};