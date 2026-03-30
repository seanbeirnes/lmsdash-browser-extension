import { ReactNode } from "react";

interface PrimaryCardProps {
  children: ReactNode
  className: string
  fixedWidth: boolean
  minHeight: boolean
}

export default function PrimaryCard({ children, className = "", fixedWidth = true, minHeight = true }: PrimaryCardProps) {
  return (
    <div className={`grid grid-cols-1 grid-flow-row ${minHeight ? "min-h-72" : ""} min-w-72 bg-gray-50 p-4 rounded-lg ${fixedWidth ? "w-72" : ""} ${className}`}>
      {children}
    </div>
  )
}