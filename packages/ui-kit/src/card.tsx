import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingStyles = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

export function Card({ padding = 'md', hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[rgba(0,0,0,0.10)] bg-white ${paddingStyles[padding]} ${hover ? 'transition-shadow hover:shadow-md' : ''} ${className}`}
      {...props}
    />
  )
}
