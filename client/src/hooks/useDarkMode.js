import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('mw-theme') === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.setAttribute('data-theme', 'dark')
      localStorage.setItem('mw-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
      localStorage.setItem('mw-theme', 'light')
    }
  }, [dark])

  return [dark, setDark]
}
