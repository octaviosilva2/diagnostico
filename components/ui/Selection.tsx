import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SelectionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
  disabled?: boolean;
}

export function Radio({ label, checked, onChange, className, disabled }: SelectionProps) {
  return (
    <div 
      onClick={!disabled ? onChange : undefined}
      className={cn("option-row", checked && "selected", disabled && "disabled", className)}
    >
      <div className="radio-circle">
        <div className="radio-dot" />
      </div>
      <span className="option-text">{label}</span>
    </div>
  );
}

export function Checkbox({ label, checked, onChange, className, disabled }: SelectionProps) {
  return (
    <div 
      onClick={!disabled ? onChange : undefined}
      className={cn("option-row", checked && "selected", disabled && "disabled", className)}
    >
      <div className="check-square">
        <span className="check-mark">✓</span>
      </div>
      <span className="option-text">{label}</span>
    </div>
  );
}
