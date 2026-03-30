import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonPrimaryDangerProps = {
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function clsx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const ButtonPrimaryDanger = forwardRef<HTMLButtonElement, ButtonPrimaryDangerProps>(function ButtonPrimaryDanger(
  { children, disabled = false, isLoading = false, className, type = "button", ...rest },
  ref
) {
  const isDisabled = disabled || isLoading;
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "px-4 py-1.5 w-full text-base font-bold rounded transition-shadow",
        isDisabled
          ? "bg-gray-200 text-gray-700 cursor-not-allowed"
          : "bg-red-500 text-white hover:bg-red-400 hover:shadow-sm active:shadow-inner",
        className
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      {...rest}
    >
      {children}
    </button>
  );
});

export default ButtonPrimaryDanger;