import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => {
    return (
        <div className="relative">
            <textarea
                id={id}
                className="block w-full px-4 py-3 bg-black text-fba-white border-2 border-gray-800 rounded-none focus:border-fba-red focus:outline-none focus:ring-0 peer transition-colors font-base uppercase resize-y min-h-[120px]"
                placeholder=" "
                {...props}
            />
            <label
                htmlFor={id}
                className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-black px-2 peer-focus:px-2 peer-focus:text-fba-red peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 font-display"
            >
                {label}
            </label>
        </div>
    );
};

export default Textarea;
