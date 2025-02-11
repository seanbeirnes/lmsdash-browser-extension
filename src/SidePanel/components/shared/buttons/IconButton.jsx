import {forwardRef} from "react";

const IconButton = forwardRef(function IconButton({animated = false, children, onClick, className="text-blue-600 hover:text-blue-50 hover:bg-blue-500 active:bg-blue-400 active:shadow-inner"}, ref) {
  return (
    <button ref={ref} className={`h-fit rounded-sm ${className} ${animated && "animate__animated animate__fadeIn"}`} onClick={onClick}>
      {children}
    </button>
  )
});

export default IconButton;
