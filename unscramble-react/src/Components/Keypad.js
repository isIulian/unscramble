import React, { useState, useEffect } from 'react'

export default function Keypad({keys}) {
  const [letters, setLetters] = useState(null)

  useEffect(() => {
    setLetters(keys)
  }, [keys])

  return (
    <div className="keypad">
      {letters && letters.map(l => {
        return (
          <div key={l.key}>{l.key}</div>
        )
      })}
    </div>
  )
}