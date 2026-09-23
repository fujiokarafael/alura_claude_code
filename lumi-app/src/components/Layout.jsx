import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NOME_PAPEL = {
  responsavel: 'Responsável',
  cuidador: 'Cuidador de confiança',
  convidado: 'Convidado profissional',
}

export default function Layout({ children }) {
  const { usuarioAtual, sair } = useAuth()
  const navigate = useNavigate()

  function handleSair() {
    sair()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/dashboard" className="brand">🌱 Lumi</Link>
        {usuarioAtual && (
          <div className="usuario-atual">
            <span>{usuarioAtual.nome}</span>
            <span className="papel-badge">{NOME_PAPEL[usuarioAtual.papel]}</span>
            <button onClick={handleSair}>Sair</button>
          </div>
        )}
      </header>
      <main className="content">{children}</main>
    </div>
  )
}
