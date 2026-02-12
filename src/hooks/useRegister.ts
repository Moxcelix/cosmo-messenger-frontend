import { useCallback, useState } from "react";
import { useServices } from "../context/ServicesContext";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useRegister = () => {
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { authService } = useServices();

    const register = useCallback(async (username: string, password: string, email: string): Promise<boolean> => {
        setRegisterError(null);
        setLoading(true);
        let ok = true;
        try {
            await authService.register({ username, password, email });
        } catch (err: unknown) {
            setRegisterError(getErrorMessage(err));
            ok = false;
        }
        setLoading(false);
        return ok;
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