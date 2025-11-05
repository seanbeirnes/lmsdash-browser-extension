import { ReactNode } from "react"

interface PrimaryCardLayoutProps {
  children: ReactNode
  className: string
  fullWidth: boolean
}

export default function PrimaryCardLayout({ children, className, fullWidth = true }: PrimaryCardLayoutProps) {
  return (
    <div className={`self-start ${fullWidth ? "w-full" : ""} p-4 flex flex-row justify-center sm:justify-start gap-4 flex-wrap ${className}`}>
      {children}
    </div>
  )
}