export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly code: string,
        public readonly message: string,
        public readonly originalResponse?: Response
    ) {
        super(message);
        this.name = 'ApiError';

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}