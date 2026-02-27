'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type Lang = 'en' | 'es'

const LangContext = createContext<{ lang: Lang; toggle: () => void }>({
  lang: 'en',
  toggle: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  return (
    <LangContext.Provider value={{ lang, toggle: () => setLang(l => l === 'en' ? 'es' : 'en') }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

export default function LanguageToggle() {
  const { lang, toggle } = useLang()
  return (
    <button
      onClick={toggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        background: 'rgba(125,211,212,0.08)',
        border: '1px solid rgba(125,211,212,0.2)',
        borderRadius: '20px',
        color: '#7dd3d4',
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(125,211,212,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(125,211,212,0.08)')}
    >
      {lang === 'en' ? '🌐 ES' : '🌐 EN'}
    </button>
  )
}
