import {forwardRef} from "react";

const ButtonSecondary = forwardRef(function ButtonSecondary({children, onClick, disabled = false}, ref)
{
  return (
    <button
      className={`${disabled ? "bg-gray-200 text-gray-700 cursor-not-allowed" : "bg-none text-gray-700 hover:text-gray-400 hover:shadow-sm active:shadow-inner"} 
    px-4 py-1.5 w-full text-base font-bold rounded`}
      onClick={onClick}
      disabled={disabled}
      ref={ref}>
      {children}
    </button>
  )
});

export default ButtonSecondary;