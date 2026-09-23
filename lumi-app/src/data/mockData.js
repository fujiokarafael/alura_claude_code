// Dados de exemplo — seguem o modelo de dados da seção 6 do PRD.
// Servem só para navegar pelo protótipo antes de existir um Supabase real.

export const usuarios = [
  { id: 'u1', nome: 'Rafael', papel: 'responsavel' },
  { id: 'u2', nome: 'Camila', papel: 'responsavel' },
  { id: 'u3', nome: 'Vó Lúcia', papel: 'cuidador' },
  { id: 'u4', nome: 'Dra. Ana (pediatra)', papel: 'convidado' },
]

export const dependentes = [
  {
    id: 'd1',
    nome: 'Alice',
    dataNascimento: '2026-03-12',
    cpf: '000.000.000-00',
    tipoSanguineo: 'O+',
    foto: null,
  },
]

export const documentos = [
  { id: 'doc1', dependenteId: 'd1', tipo: 'Certidão de nascimento', categoria: 'civil', dataUpload: '2026-03-20' },
  { id: 'doc2', dependenteId: 'd1', tipo: 'Carteirinha do convênio', categoria: 'saude', dataUpload: '2026-03-25' },
]

export const registrosSaude = [
  { id: 'rs1', dependenteId: 'd1', tipo: 'alergia', descricao: 'Alergia a proteína do leite de vaca', data: '2026-05-02', profissional: 'Dra. Ana' },
]

export const consultas = [
  { id: 'c1', dependenteId: 'd1', data: '2026-06-12', profissional: 'Dra. Ana', especialidade: 'Pediatria', motivo: 'Consulta de rotina — 3 meses', observacoes: 'Peso e altura dentro da curva esperada.' },
]

// Receita ou resultado de exame anexado — pode vir de uma consulta (consultaId) ou ser solto.
export const documentosSaude = [
  { id: 'ds1', dependenteId: 'd1', consultaId: 'c1', tipo: 'receita', descricao: 'Receita — Vitamina D', dataUpload: '2026-06-12' },
  { id: 'ds2', dependenteId: 'd1', consultaId: 'c1', tipo: 'exame', descricao: 'Exame de sangue — rotina', dataUpload: '2026-06-15' },
]

export const medicamentos = [
  { id: 'm1', dependenteId: 'd1', nome: 'Vitamina D', dosagem: '2 gotas', horarios: ['08:00'], ativo: true },
]

export const vacinas = [
  { id: 'v1', dependenteId: 'd1', nome: 'BCG', dose: 'Dose única', dataAplicacao: '2026-03-13', proximaDosePrevista: null },
  { id: 'v2', dependenteId: 'd1', nome: 'Pentavalente', dose: '1ª dose', dataAplicacao: '2026-05-15', proximaDosePrevista: '2026-07-15' },
]

export const lembretes = [
  { id: 'l1', dependenteId: 'd1', tipo: 'vacina', referencia: 'Pentavalente — 2ª dose', dataAlvo: '2026-07-15', status: 'pendente' },
  { id: 'l2', dependenteId: 'd1', tipo: 'medicamento', referencia: 'Vitamina D — 08:00', dataAlvo: '2026-09-15', status: 'pendente' },
]

export const itensCompra = [
  { id: 'ic1', dependenteId: 'd1', nome: 'Carrinho de bebê compacto', comprado: false },
  { id: 'ic2', dependenteId: 'd1', nome: 'Fraldas tamanho P', comprado: true },
  { id: 'ic3', dependenteId: 'd1', nome: 'Termômetro digital', comprado: false },
]
