import { criarUseColecao } from './criarUseColecao'
import {
  documentos,
  registrosSaude,
  consultas,
  documentosSaude,
  medicamentos,
  vacinas,
  lembretes,
  itensCompra,
} from './mockData'

export const useDocumentos = criarUseColecao({
  tabela: 'documentos',
  dadosMock: documentos,
  paraApp: (row) => ({
    id: row.id,
    dependenteId: row.dependente_id,
    tipo: row.tipo,
    categoria: row.categoria,
    dataUpload: row.data_upload,
  }),
  paraBanco: (d) => ({ tipo: d.tipo, categoria: d.categoria, data_upload: d.dataUpload }),
})

export const useRegistrosSaude = criarUseColecao({
  tabela: 'registros_saude',
  dadosMock: registrosSaude,
  paraApp: (row) => ({
    id: row.id,
    dependenteId: row.dependente_id,
    tipo: row.tipo,
    descricao: row.descricao,
    data: row.data,
    profissional: row.profissional,
  }),
  paraBanco: (d) => ({ tipo: d.tipo, descricao: d.descricao, data: d.data, profissional: d.profissional }),
})

export const useConsultas = criarUseColecao({
  tabela: 'consultas',
  dadosMock: consultas,
  paraApp: (row) => ({
    id: row.id,
    dependenteId: row.dependente_id,
    data: row.data,
    profissional: row.profissional,
    especialidade: row.especialidade,
    motivo: row.motivo,
    observacoes: row.observacoes,
  }),
  paraBanco: (d) => ({
    data: d.data,
    profissional: d.profissional,
    especialidade: d.especialidade,
    motivo: d.motivo,
    observacoes: d.observacoes,
  }),
})

// Receita ou resultado de exame anexado — pode vir de uma consulta (consultaId) ou ser solto.
export const useDocumentosSaude = criarUseColecao({
  tabela: 'documentos_saude',
  dadosMock: documentosSaude,
  paraApp: (row) => ({
    id: row.id,
    dependenteId: row.dependente_id,
    consultaId: row.consulta_id,
    tipo: row.tipo,
    descricao: row.descricao,
    dataUpload: row.data_upload,
  }),
  paraBanco: (d) => ({
    consulta_id: d.consultaId ?? null,
    tipo: d.tipo,
    descricao: d.descricao,
    data_upload: d.dataUpload,
  }),
})

export const useMedicamentos = criarUseColecao({
  tabela: 'medicamentos',
  dadosMock: medicamentos,
  paraApp: (row) => ({
    id: row.id,
    dependenteId: row.dependente_id,
    nome: row.nome,
    dosagem: row.dosagem,
    horarios: row.horarios,
    ativo: row.ativo,
  }),
  paraBanco: (d) => ({ nome: d.nome, dosagem: d.dosagem, horarios: d.horarios, ativo: d.ativo }),
})

export const useVacinas = criarUseColecao({
  tabela: 'vacinas',
  dadosMock: vacinas,
  paraApp: (row) => ({
    id: row.id,
    dependenteId: row.dependente_id,
    nome: row.nome,
    dose: row.dose,
    dataAplicacao: row.data_aplicacao,
    proximaDosePrevista: row.proxima_dose_prevista,
  }),
  paraBanco: (d) => ({
    nome: d.nome,
    dose: d.dose,
    data_aplicacao: d.dataAplicacao,
    proxima_dose_prevista: d.proximaDosePrevista ?? null,
  }),
})

export const useLembretes = criarUseColecao({
  tabela: 'lembretes',
  dadosMock: lembretes,
  paraApp: (row) => ({
    id: row.id,
    dependenteId: row.dependente_id,
    tipo: row.tipo,
    referencia: row.referencia,
    dataAlvo: row.data_alvo,
    status: row.status,
  }),
  paraBanco: (d) => ({ tipo: d.tipo, referencia: d.referencia, data_alvo: d.dataAlvo, status: d.status }),
})

export const useItensCompra = criarUseColecao({
  tabela: 'itens_compra',
  dadosMock: itensCompra,
  paraApp: (row) => ({ id: row.id, dependenteId: row.dependente_id, nome: row.nome, comprado: row.comprado }),
  paraBanco: (d) => ({ nome: d.nome, comprado: d.comprado }),
})
