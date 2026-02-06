export async function formatError(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}`;

    try {
        const text = await response.text();

        if (text) {
            try {
                const json = JSON.parse(text);
                errorMessage = json.message || json.error || text;
            } catch {
                errorMessage = text;
            }
        }
    } catch (e) {
        console.warn('Could not read response body:', e);
    }

    throw new Error(errorMessage);
}