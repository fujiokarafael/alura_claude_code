// Matriz de permissões — espelha a tabela da seção 7 do PRD.
// Níveis possíveis: 'full' (ver e editar), 'partial' (ver + ação limitada),
// 'read' (somente ver), 'none' (sem acesso).

export const PERMISSIONS = {
  pessoal: { responsavel: 'full', cuidador: 'none', convidado: 'none' },
  saude: { responsavel: 'full', cuidador: 'read', convidado: 'read' },
  medicamentosVacinas: { responsavel: 'full', cuidador: 'partial', convidado: 'read' },
  lembretes: { responsavel: 'full', cuidador: 'full', convidado: 'none' },
  escolarConvenio: { responsavel: 'full', cuidador: 'read', convidado: 'none' },
  configuracoes: { responsavel: 'full', cuidador: 'none', convidado: 'none' },
}

export function getPermission(papel, categoria) {
  return PERMISSIONS[categoria]?.[papel] ?? 'none'
}
