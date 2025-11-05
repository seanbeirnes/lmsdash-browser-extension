import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonPrimaryProps = {
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function clsx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(function ButtonPrimary(
  { children, disabled = false, isLoading = false, className, type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "px-4 py-1.5 w-full text-base font-bold rounded transition-shadow",
        disabled || isLoading
          ? "bg-gray-200 text-gray-700 cursor-not-allowed"
          : "bg-blue-500 text-white hover:bg-blue-400 hover:shadow-sm active:shadow-inner",
        className
      )}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {children}
    </button>
  );
});

export default ButtonPrimary;