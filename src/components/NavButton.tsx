import { ReactNode } from "react";

interface NavButtonProps {
    onClick: () => void;
    children: ReactNode;
    icon?: ReactNode;
    isActive?: boolean;
    variant?: "default" | "danger";
    className?: string; 
}

export const NavButton = ({
    onClick,
    children,
    icon,
    isActive = false,
    variant = "default",
    className = "", 
}: NavButtonProps) => {
    const baseStyles = "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center";

    const variantStyles = {
        default: isActive
            ? "text-blue-600 bg-blue-50 border border-blue-200"
            : "text-gray-500 bg-gray-100 hover:bg-gray-200",
        danger: "text-white bg-red-600 hover:bg-red-700",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        >
            {icon && <span className="w-5 h-5 mr-2">{icon}</span>}
            {children}
        </button>
    );
};