import { ReactEventHandler, ReactNode } from "react";

interface MenuButtonProps {
  children: ReactNode
  onClick: ReactEventHandler
}

export default function MenuButton({ children, onClick }: MenuButtonProps) {
  return (
    <button className={"flex justify-start items-center gap-2 w-full px-4 py-2 bg-gray-50 hover:bg-white hover:text-blue-500 hover:shadow-sm active:shadow-inner active:text-blue-400 text-blue-600 rounded-sm"} onClick={onClick}>
      {children}
    </button>
  )
}