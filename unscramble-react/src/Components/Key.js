import { React } from 'react'

function Key ({
  children,
  status,
  width = 40,
  value,
  onClick,
}) {
  return (
    <div
      style={{ width: `${width}px`, height: '48px' }}
      className="keyboard-component__key"
      onClick={() => onClick(value)}
    >
      {children || value}
    </div>
  )
}

export default Key;