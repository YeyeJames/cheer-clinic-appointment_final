
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  type = 'button',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-[1.5rem] font-black transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.96]";
  
  const variants = {
    primary: "bg-[#ffb85f] text-white hover:bg-[#ffa726] focus:ring-[#ffb85f] shadow-xl shadow-[#ffb85f]/20",
    secondary: "bg-white text-stone-700 border-2 border-stone-100 hover:bg-stone-50 focus:ring-brand-yellow shadow-md",
    danger: "bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 focus:ring-red-500",
    success: "bg-emerald-50 text-emerald-700 border-2 border-emerald-100 hover:bg-emerald-100 focus:ring-emerald-500",
    ghost: "bg-transparent text-stone-500 hover:bg-stone-100 focus:ring-stone-400",
  };

  const sizes = {
    sm: "h-11 px-6 text-sm",
    md: "h-14 px-8 text-lg rounded-[1.2rem]",
    lg: "h-16 px-10 text-xl rounded-[1.5rem]",
    xl: "h-20 px-12 text-2xl rounded-[1.8rem]",
  };

  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </button>
  );
};
