import { createContext, useContext, useState } from 'react'
import { usuarios } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuarioAtual, setUsuarioAtual] = useState(null)

  function entrar(usuarioId) {
    setUsuarioAtual(usuarios.find((u) => u.id === usuarioId) ?? null)
  }

  function sair() {
    setUsuarioAtual(null)
  }

  return (
    <AuthContext.Provider value={{ usuarioAtual, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return context
}
