import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usuarios } from '../data/mockData'

const DESCRICAO_PAPEL = {
  responsavel: 'Vê e edita tudo.',
  cuidador: 'Vê saúde e lembretes; marca remédio como administrado.',
  convidado: 'Acesso temporário só de leitura à saúde.',
}

// Tela de login mock: mais tarde entra o Firebase Auth (ver src/firebase.js).
// Por enquanto, simula o convite de acesso escolhendo uma das pessoas de exemplo.
export default function Login() {
  const { entrar } = useAuth()
  const navigate = useNavigate()

  function handleEntrar(usuarioId) {
    entrar(usuarioId)
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <h1>🌱 Raiz</h1>
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
