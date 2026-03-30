import { forwardRef, memo, type ComponentPropsWithoutRef } from "react";

type ButtonSecondaryProps = ComponentPropsWithoutRef<'button'>;

const ButtonSecondary = forwardRef<HTMLButtonElement, ButtonSecondaryProps>(function ButtonSecondary(
  { children, disabled = false, type = "button", className = "", onClick, ...rest },
  ref
) {
  const baseClasses = "px-4 py-1.5 w-full text-base font-bold rounded";
  const enabledClasses = "bg-none text-gray-700 hover:text-gray-400 hover:shadow-sm active:shadow-inner";
  const disabledClasses = "bg-gray-200 text-gray-700 cursor-not-allowed";
  const classes = `${disabled ? disabledClasses : enabledClasses} ${baseClasses} ${className}`.trim();

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
});

ButtonSecondary.displayName = "ButtonSecondary";

export default memo(ButtonSecondary);