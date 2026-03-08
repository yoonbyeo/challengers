import './CoinIcon.css'

type CoinIconProps = {
  size?: number
  className?: string
}

export default function CoinIcon({ size = 32, className = '' }: CoinIconProps) {
  return (
    <span
      className={`coin-icon ${className}`.trim()}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      aria-hidden
    >
      C
    </span>
  )
}
