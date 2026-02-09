import { ApiError } from "../types/errors/ApiError";

export async function formatError(response: Response): Promise<never> {
    const status = response.status;
    let code = 'UNKNOWN_ERROR';
    let message = `HTTP ${status}: Unknown error`;

    try {
        const text = await response.text();

        if (text) {
            try {
                const json = JSON.parse(text);

                code =
                    json.code ||
                    json.error_code ||
                    json.type ||
                    String(status);

                message =
                    json.message ||
                    json.error ||
                    json.detail ||
                    json.msg ||
                    text;
            } catch {
                message = text;
            }
        } else {
            message = `HTTP ${status} with empty response`;
        }
    } catch (e) {
        console.warn('Failed to read response body:', e);
        message = `HTTP ${status} (failed to read response body)`;
    }

    throw new ApiError(status, code, message, response);
}