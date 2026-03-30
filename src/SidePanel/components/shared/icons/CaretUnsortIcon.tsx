interface CaretUnsortIconProps {
  className: string
}

export default function CaretUnsortIcon({ className }: CaretUnsortIconProps) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M4.932,11.182c-0.176,0.176 -0.176,0.46 -0,0.636c0.176,0.176 0.46,0.176 0.636,0l1.932,-1.932l1.932,1.932c0.176,0.176 0.46,0.176 0.636,0c0.176,-0.176 0.176,-0.46 0,-0.636l-2.25,-2.25c-0.176,-0.176 -0.46,-0.176 -0.636,-0l-2.25,2.25Zm5.136,-7.364c0.176,-0.176 0.176,-0.46 0,-0.636c-0.176,-0.176 -0.46,-0.176 -0.636,-0l-1.932,1.932l-1.932,-1.932c-0.176,-0.176 -0.46,-0.176 -0.636,-0c-0.176,0.176 -0.176,0.46 -0,0.636l2.25,2.25c0.084,0.085 0.199,0.132 0.318,0.132c0.119,-0 0.234,-0.047 0.318,-0.132l2.25,-2.25Z"
        fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
    </svg>
  )
}