import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variantStyles = {
  primary: 'bg-[#c8191a] text-white hover:bg-[#a51415]',
  secondary: 'bg-white text-[#1a1a1e] border border-[rgba(0,0,0,0.10)] hover:bg-[#eeecea]',
  ghost: 'text-[#1a1a1e] hover:bg-[#eeecea]',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${variantStyles[variant]} disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    />
  )
}
