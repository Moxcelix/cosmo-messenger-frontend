import { useCallback, useState } from "react";
import { useServices } from "../context/ServicesContext";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useRegister = () => {
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { authService } = useServices();

    const register = useCallback(async (username: string, password: string, email: string): Promise<void> => {
        setRegisterError(null)
        setLoading(true)
        try {
            await authService.register({ username, password, email });
        } catch (err: unknown) {
            setRegisterError(getErrorMessage(err));
        }
        setLoading(false)
    }, [authService]);

    const validatePassword = useCallback(async(password:string):Promise<void>=>{
        setPasswordError(null)
        try {
            const token = await authService.validatePassword(password);
        } catch (err: unknown) {
            setPasswordError(getErrorMessage(err));
        }
    }, [authService])

    return {
        registerError,
        passwordError,
        loading,

        register,
        validatePassword,
        setRegisterError,
        setPasswordError,
    };
}