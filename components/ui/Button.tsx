import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
}

export function Button({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  ...props 
}: ButtonProps) {
  
  const variantClass = variant === "secondary" ? "btn-secondary" : "btn-primary";
  const sizeClass = size === "lg" ? "full" : ""; // using .full for large primary 

  return (
    <button
      className={cn(variantClass, sizeClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}
