import { forwardRef, memo } from "react";
import type { ComponentPropsWithoutRef, ReactNode, MouseEventHandler } from "react";

interface IconButtonProps extends ComponentPropsWithoutRef<'button'> {
  animated?: boolean;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

const IconButton = memo(forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    animated = false,
    children,
    onClick,
    className = "text-blue-600 hover:text-blue-50 hover:bg-blue-500 active:bg-blue-400 active:shadow-inner",
    disabled,
    type = "button",
    ...rest
  }, ref
) {
  const animationClass = animated ? "animate__animated animate__fadeIn" : "";
  const baseClass = "h-fit rounded-sm";
  const classes = [baseClass, className, animationClass, disabled ? "opacity-50 cursor-not-allowed" : ""].filter(Boolean).join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}));

IconButton.displayName = "IconButton";

export default IconButton;
