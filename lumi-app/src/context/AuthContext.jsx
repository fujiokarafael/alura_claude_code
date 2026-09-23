import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase'
import { usuarios as usuariosMock } from '../data/mockData'

const AuthContext = createContext(null)

// O Postgres usa snake_case (familia_id); o resto do app usa camelCase (familiaId).
function mapPerfil(id, row) {
  return { id, nome: row.nome, email: row.email, papel: row.papel, familiaId: row.familia_id }
}

export function AuthProvider({ children }) {
  const [usuarioAtual, setUsuarioAtual] = useState(null)
  const [carregando, setCarregando] = useState(isSupabaseConfigured)

  // Modo Supabase: reage ao login/logout real e busca o perfil (nome, papel,
  // familiaId) salvo em `usuarios/{uid}` — o Auth do Supabase só sabe e-mail/senha.
  useEffect(() => {
    if (!isSupabaseConfigured) return

    async function carregarPerfil(userId) {
      const { data } = await supabase.from('usuarios').select('*').eq('id', userId).single()
      setUsuarioAtual(data ? mapPerfil(userId, data) : null)
      setCarregando(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) carregarPerfil(session.user.id)
      else setCarregando(false)
    })

    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (session?.user) carregarPerfil(session.user.id)
      else {
        setUsuarioAtual(null)
        setCarregando(false)
      }
    })

    return () => assinatura.subscription.unsubscribe()
  }, [])

  // Modo mock: escolher uma das personas de exemplo (ver README).
  function entrar(usuarioId) {
    setUsuarioAtual(usuariosMock.find((u) => u.id === usuarioId) ?? null)
  }

  // Primeiro acesso de uma família no modo real: cria a conta, a família e o
  // perfil do responsável (papel inicial — convites para outros papéis são
  // um passo futuro, ver README).
  async function cadastrar({ nome, email, senha, nomeFamilia }) {
    const { data, error } = await supabase.auth.signUp({ email, password: senha })
    if (error) throw error

    const userId = data.user.id
    // Gera o id da família no cliente: se pedíssemos para o banco gerar e
    // devolver (`.select()` após o insert), a política de leitura de
    // `familias` bloquearia essa leitura, pois o `usuarios` que ela consulta
    // ainda não existe nesse instante (Postgres aplica a policy de SELECT
    // também no RETURNING de um INSERT).
    const familiaId = crypto.randomUUID()
    const { error: erroFamilia } = await supabase
      .from('familias')
      .insert({ id: familiaId, nome: nomeFamilia })
    if (erroFamilia) throw erroFamilia

    const { error: erroUsuario } = await supabase
      .from('usuarios')
      .insert({ id: userId, nome, email, papel: 'responsavel', familia_id: familiaId })
    if (erroUsuario) throw erroUsuario
  }

  async function entrarComEmailSenha(email, senha) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw error
  }

  function sair() {
    if (isSupabaseConfigured) return supabase.auth.signOut()
    setUsuarioAtual(null)
    return Promise.resolve()
  }

  return (
    <AuthContext.Provider
      value={{ usuarioAtual, carregando, entrar, cadastrar, entrarComEmailSenha, sair }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return context
}
