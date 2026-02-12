interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullPage?: boolean;
    className?: string;
}

export const LoadingSpinner = ({ 
    size = 'md', 
    text = 'Загрузка...', 
    fullPage = false,
    className = '' 
}: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-4',
        lg: 'w-16 h-16 border-4'
    };

    const spinner = (
        <div className={`rounded-lg bg-white p-6 border border-gray-200 text-center ${className}`}>
            <div className={`
                animate-spin 
                ${sizeClasses[size]} 
                border-blue-600 border-t-transparent 
                rounded-full mx-auto mb-4
            `}></div>
            {text && <p className="text-gray-600">{text}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};