import { React } from 'react'

function Key ({
  children,
  large,
  value,
  onClick,
}) {
  return (
    <div
      className={"keyboard-component__key" + (large === true ? " large" : "")}
      onClick={() => onClick(value)}
    >
      {children || value}
    </div>
  )
}

export default Key;