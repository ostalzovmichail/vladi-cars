import { type CSSProperties } from 'react'

const pulseKeyframes = `
@keyframes skeletonPulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
`

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = pulseKeyframes
  document.head.appendChild(style)
}

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: CSSProperties
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: '#eeecea',
        animation: 'skeletonPulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.10)',
    }}>
      <Skeleton height={180} borderRadius={0} />
      <div style={{ padding: '12px 16px' }}>
        <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={16} />
      </div>
      <div style={{ padding: '8px 16px' }}>
        <Skeleton width="40%" height={12} />
      </div>
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Skeleton width={80} height={24} />
        <Skeleton width={100} height={32} borderRadius={999} />
      </div>
    </div>
  )
}
