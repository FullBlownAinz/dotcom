import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

const Input: React.FC<InputProps> = ({ label, id, type, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="relative">
            <input
                id={id}
                type={isPassword && showPassword ? 'text' : type}
                className="block w-full px-4 py-3 bg-black text-fba-white border-2 border-gray-800 rounded-none focus:border-fba-red focus:outline-none focus:ring-0 peer transition-colors font-base uppercase"
                placeholder=" " 
                {...props}
            />
            <label
                htmlFor={id}
                className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-black px-2 peer-focus:px-2 peer-focus:text-fba-red peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 font-display"
            >
                {label}
            </label>
            {isPassword && (
                 <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-fba-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            )}
        </div>
    );
};

export default Input;
