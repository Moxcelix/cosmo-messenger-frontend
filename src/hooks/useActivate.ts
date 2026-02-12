import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useServices } from "../context/ServicesContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useAuth } from "../context/AuthContext";

export const useActivate = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true)

    const { authService } = useServices()
    const { refresh } = useAuth()

    useEffect(() => {
        const checkToken = async (): Promise<void> => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('invalid');
                return;
            }

            try {
                await authService.activateConfirm(token)
                setStatus('success')
                try {
                    await refresh()
                }
                catch {}
            }
            catch (err: unknown) {
                setMessage(getErrorMessage(err));
                setStatus('error')
            }
            finally {
                setLoading(false)
            }
        }
        checkToken().then(() => { })
    }, [])

    return {
        status,
        message,
        loading,
    }
}