import { type ReactNode } from 'react'

type BannerProps = {
  children: ReactNode
  className?: string
}

const Banner = ({ children, className = '' }: BannerProps) => {
  return <div className={`w-full bg-gray-100 p-4 ${className}`}>{children}</div>
}

export default Banner
