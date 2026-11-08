import { createContext, useContext } from 'react'

export const AvisosContext = createContext(null)

export function useAvisos() {
  const avisos = useContext(AvisosContext)
  if (!avisos) throw new Error('useAvisos debe utilizarse dentro de AvisosProvider')
  return avisos
}
