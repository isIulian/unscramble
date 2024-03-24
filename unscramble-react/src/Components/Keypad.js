import React, { useEffect } from 'react'
import Key from './Key';

export default function Keypad ({ onChar, onDelete, onEnter, guesses }) {

  const onClick = (value) => {
    if (value === 'ENTER') {
      onEnter()
    } else if (value === 'DELETE') {
      onDelete()
    } else {
      onChar(value)
    }
  }

  useEffect(() => {
    const listener = (e) => {
      if (e.code === 'Enter') {
        onEnter()
      } else if (e.code === 'Backspace') {
        onDelete()
      } else {
        const key = e.key.toUpperCase()
        if (key.length === 1 && key >= 'A' && key <= 'Z') {
          onChar(key)
        }
      }
    }
    window.addEventListener('keyup', listener)
    return () => {
      window.removeEventListener('keyup', listener)
    }
  }, [onEnter, onDelete, onChar])

  return (
    <div className='keyboard-component'>
      <div className="keyboard-component__row">
        <Key value="Q" onClick={onClick} />
        <Key value="W" onClick={onClick} />
        <Key value="E" onClick={onClick} />
        <Key value="R" onClick={onClick} />
        <Key value="T" onClick={onClick} />
        <Key value="Y" onClick={onClick} />
        <Key value="U" onClick={onClick} />
        <Key value="I" onClick={onClick} />
        <Key value="O" onClick={onClick} />
        <Key value="P" onClick={onClick} />
      </div>
      <div className="keyboard-component__row">
        <Key value="A" onClick={onClick} />
        <Key value="S" onClick={onClick} />
        <Key value="D" onClick={onClick} />
        <Key value="F" onClick={onClick} />
        <Key value="G" onClick={onClick} />
        <Key value="H" onClick={onClick} />
        <Key value="J" onClick={onClick} />
        <Key value="K" onClick={onClick} />
        <Key value="L" onClick={onClick} />
      </div>
      <div className="keyboard-component__row">
        <Key large={true} value="ENTER" onClick={onClick}>
          Enter
        </Key>
        <Key value="Z" onClick={onClick} />
        <Key value="X" onClick={onClick} />
        <Key value="C" onClick={onClick} />
        <Key value="V" onClick={onClick} />
        <Key value="B" onClick={onClick} />
        <Key value="N" onClick={onClick} />
        <Key value="M" onClick={onClick} />
        <Key large={true} value="DELETE" onClick={onClick}>
          Delete
        </Key>
      </div>
    </div>
  )
}