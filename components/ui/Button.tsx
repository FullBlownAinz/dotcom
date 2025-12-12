import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-6 py-2 font-display text-sm uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] focus:ring-fba-white disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-fba-red text-fba-white hover:bg-red-700',
    secondary: 'bg-transparent border-2 border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
