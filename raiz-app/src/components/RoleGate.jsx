import { useAuth } from '../context/AuthContext'
import { getPermission } from '../access/permissions'

export function usePermission(categoria) {
  const { usuarioAtual } = useAuth()
  return usuarioAtual ? getPermission(usuarioAtual.papel, categoria) : 'none'
}

// Esconde o conteúdo quando o papel do usuário atual não tem acesso
// à categoria de dado informada (ver src/access/permissions.js).
export default function RoleGate({ categoria, children }) {
  const nivel = usePermission(categoria)
  if (nivel === 'none') {
    return <p className="sem-acesso">Seu papel não tem acesso a esta informação.</p>
  }
  return children
}
