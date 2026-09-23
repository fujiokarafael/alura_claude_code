import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../supabase'
import { usuarios } from '../data/mockData'

const DESCRICAO_PAPEL = {
  responsavel: 'Vê e edita tudo.',
  cuidador: 'Vê saúde e lembretes; marca remédio como administrado.',
  convidado: 'Acesso temporário só de leitura à saúde.',
}

export default function Login() {
  return isSupabaseConfigured ? <LoginSupabase /> : <LoginMock />
}

// Modo mock: simula o convite de acesso escolhendo uma das pessoas de exemplo.
function LoginMock() {
  const { entrar } = useAuth()
  const navigate = useNavigate()

  function handleEntrar(usuarioId) {
    entrar(usuarioId)
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <h1>🌱 Lumi</h1>
      <p>Escolha com qual perfil de exemplo você quer entrar.</p>
      <div className="persona-list">
        {usuarios.map((usuario) => (
          <button key={usuario.id} className="persona-card" onClick={() => handleEntrar(usuario.id)}>
            <strong>{usuario.nome}</strong>
            <span>{DESCRICAO_PAPEL[usuario.papel]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Modo real: e-mail/senha via Supabase Auth (ver src/supabase.js).
function LoginSupabase() {
  const { cadastrar, entrarComEmailSenha } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState('entrar') // 'entrar' | 'cadastrar'
  const [form, setForm] = useState({ nome: '', nomeFamilia: '', email: '', senha: '' })
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  function atualizarCampo(campo) {
    return (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      if (modo === 'cadastrar') {
        await cadastrar(form)
      } else {
        await entrarComEmailSenha(form.email, form.senha)
      }
      navigate('/dashboard')
    } catch (err) {
      setErro(traduzirErro(err.message))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login-page">
      <h1>🌱 Lumi</h1>
      <p>{modo === 'cadastrar' ? 'Crie a conta da sua família.' : 'Entre com sua conta.'}</p>
      <form className="form-login" onSubmit={handleSubmit}>
        {modo === 'cadastrar' && (
          <>
            <input placeholder="Seu nome" value={form.nome} onChange={atualizarCampo('nome')} required />
            <input placeholder="Nome da família (ex.: Família Silva)" value={form.nomeFamilia} onChange={atualizarCampo('nomeFamilia')} required />
          </>
        )}
        <input type="email" placeholder="E-mail" value={form.email} onChange={atualizarCampo('email')} required />
        <input type="password" placeholder="Senha" value={form.senha} onChange={atualizarCampo('senha')} required minLength={6} />
        {erro && <p className="erro-login">{erro}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : modo === 'cadastrar' ? 'Criar conta' : 'Entrar'}
        </button>
      </form>
      <button
        className="link-alternar-modo"
        onClick={() => setModo(modo === 'cadastrar' ? 'entrar' : 'cadastrar')}
      >
        {modo === 'cadastrar' ? 'Já tenho conta' : 'Ainda não tenho conta'}
      </button>
    </div>
  )
}

// O Supabase Auth retorna mensagens de erro em inglês (não códigos), então o
// mapeamento é por trecho da mensagem original.
function traduzirErro(mensagem) {
  const mapa = [
    [/already registered/i, 'Este e-mail já tem uma conta.'],
    [/invalid email/i, 'E-mail inválido.'],
    [/password should be at least/i, 'A senha precisa ter pelo menos 6 caracteres.'],
    [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  ]
  const encontrado = mapa.find(([padrao]) => padrao.test(mensagem ?? ''))
  if (encontrado) return encontrado[1]
  return mensagem ? `Não foi possível concluir: ${mensagem}` : 'Não foi possível concluir. Tente novamente.'
}
