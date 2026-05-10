import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: cn(
    "bg-primary text-primary-fg",
    "shadow-[0_4px_0_0_rgb(199_72_52)] hover:shadow-[0_6px_0_0_rgb(199_72_52)]",
    "active:translate-y-1 active:shadow-[0_1px_0_0_rgb(199_72_52)]",
    "hover:-translate-y-0.5",
  ),
  secondary: cn(
    "bg-surface text-text border-2 border-border",
    "shadow-[0_3px_0_0_rgb(234_222_199)] hover:shadow-[0_5px_0_0_rgb(234_222_199)]",
    "hover:border-primary hover:text-primary",
    "active:translate-y-1 active:shadow-[0_1px_0_0_rgb(234_222_199)]",
    "hover:-translate-y-0.5",
  ),
  ghost: "text-text hover:bg-bg",
  danger: cn(
    "bg-danger text-white",
    "shadow-[0_4px_0_0_rgb(166_55_55)] hover:shadow-[0_6px_0_0_rgb(166_55_55)]",
    "active:translate-y-1 active:shadow-[0_1px_0_0_rgb(166_55_55)]",
    "hover:-translate-y-0.5",
  ),
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-4 text-sm rounded-xl gap-2",
  md: "h-12 px-6 text-base rounded-2xl gap-2.5",
  lg: "h-14 px-8 text-lg rounded-2xl gap-3",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-display font-semibold leading-none",
        "transition-all duration-150 select-none whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : leadingIcon}
      <span>{children}</span>
      {!loading && trailingIcon}
    </button>
  );
}
