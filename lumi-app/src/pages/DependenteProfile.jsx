import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import RoleGate, { usePermission } from '../components/RoleGate'
import { useAuth } from '../context/AuthContext'
import { useDependentes } from '../data/useDependentes'
import {
  useDocumentos,
  useRegistrosSaude,
  useDocumentosSaude,
  useConsultas,
  useMedicamentos,
  useVacinas,
  useLembretes,
  useItensCompra,
} from '../data/useRegistrosDependente'

const ABAS = [
  { id: 'pessoal', titulo: 'Dados pessoais' },
  { id: 'saude', titulo: 'Saúde' },
  { id: 'consultas', titulo: 'Consultas' },
  { id: 'medicamentosVacinas', titulo: 'Medicamentos e vacinas' },
  { id: 'lembretes', titulo: 'Lembretes' },
  { id: 'listaCompras', titulo: 'Lista de compras' },
  { id: 'escolarConvenio', titulo: 'Documentos' },
]

const TIPO_DOCUMENTO_SAUDE = { receita: 'Receita', exame: 'Exame' }

export default function DependenteProfile() {
  const { id } = useParams()
  const [abaAtiva, setAbaAtiva] = useState('pessoal')
  const { usuarioAtual } = useAuth()
  const { dependentes } = useDependentes(usuarioAtual?.familiaId)
  const dependente = dependentes.find((d) => d.id === id)
  const nivelAbaAtiva = usePermission(abaAtiva)

  const { itens: registrosSaude } = useRegistrosSaude(id)
  const { itens: documentosSaude } = useDocumentosSaude(id)
  const { itens: consultas } = useConsultas(id)
  const { itens: medicamentos } = useMedicamentos(id)
  const { itens: vacinas } = useVacinas(id)
  const { itens: lembretes } = useLembretes(id)
  const { itens: documentos } = useDocumentos(id)

  if (!dependente) return <p>Dependente não encontrado.</p>

  return (
    <div className="perfil">
      <Link to="/dashboard" className="voltar">← Dependentes</Link>
      <h1>{dependente.nome}</h1>

      <nav className="tabs">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            className={aba.id === abaAtiva ? 'tab tab--ativa' : 'tab'}
            onClick={() => setAbaAtiva(aba.id)}
          >
            {aba.titulo}
          </button>
        ))}
      </nav>

      {nivelAbaAtiva === 'read' && (
        <p className="aviso-somente-leitura">Você tem acesso somente de leitura a esta aba.</p>
      )}

      <div className="tab-content">
        {abaAtiva === 'pessoal' && (
          <RoleGate categoria="pessoal">
            <dl className="dados-lista">
              <dt>Data de nascimento</dt><dd>{dependente.dataNascimento}</dd>
              <dt>CPF</dt><dd>{dependente.cpf}</dd>
              <dt>Tipo sanguíneo</dt><dd>{dependente.tipoSanguineo}</dd>
            </dl>
          </RoleGate>
        )}

        {abaAtiva === 'saude' && (
          <RoleGate categoria="saude">
            <h3>Alergias e condições</h3>
            <ul className="registro-lista">
              {registrosSaude.map((r) => (
                <li key={r.id}>
                  <strong>{r.tipo === 'alergia' ? 'Alergia' : 'Condição'}</strong> — {r.descricao}
                  <span className="registro-meta">{r.data} · {r.profissional}</span>
                </li>
              ))}
            </ul>

            <h3>Receitas e exames</h3>
            <ul className="registro-lista">
              {documentosSaude.map((doc) => (
                <li key={doc.id}>
                  <strong>{TIPO_DOCUMENTO_SAUDE[doc.tipo]}</strong> — {doc.descricao}
                  <span className="registro-meta">Anexado em {doc.dataUpload}</span>
                </li>
              ))}
            </ul>
            <button className="botao-mock" disabled>+ Anexar receita ou exame</button>
          </RoleGate>
        )}

        {abaAtiva === 'consultas' && (
          <RoleGate categoria="consultas">
            <ul className="registro-lista">
              {consultas.map((c) => (
                <li key={c.id}>
                  <strong>{c.especialidade}</strong> — {c.motivo}
                  <span className="registro-meta">{c.data} · {c.profissional}</span>
                  {c.observacoes && <span className="registro-meta">{c.observacoes}</span>}
                </li>
              ))}
            </ul>
            <button className="botao-mock" disabled>+ Registrar consulta</button>
          </RoleGate>
        )}

        {abaAtiva === 'medicamentosVacinas' && (
          <RoleGate categoria="medicamentosVacinas">
            <h3>Medicamentos em uso</h3>
            <ul className="registro-lista">
              {medicamentos.filter((m) => m.ativo).map((m) => (
                <li key={m.id}>
                  <strong>{m.nome}</strong> — {m.dosagem}
                  <span className="registro-meta">Horário: {m.horarios.join(', ')}</span>
                </li>
              ))}
            </ul>
            <h3>Vacinas</h3>
            <ul className="registro-lista">
              {vacinas.map((v) => (
                <li key={v.id}>
                  <strong>{v.nome}</strong> — {v.dose}
                  <span className="registro-meta">
                    Aplicada em {v.dataAplicacao}
                    {v.proximaDosePrevista && ` · próxima dose: ${v.proximaDosePrevista}`}
                  </span>
                </li>
              ))}
            </ul>
          </RoleGate>
        )}

        {abaAtiva === 'lembretes' && (
          <RoleGate categoria="lembretes">
            <ul className="registro-lista">
              {lembretes.map((l) => (
                <li key={l.id}>
                  <strong>{l.referencia}</strong>
                  <span className="registro-meta">{l.dataAlvo} · {l.status}</span>
                </li>
              ))}
            </ul>
          </RoleGate>
        )}

        {abaAtiva === 'listaCompras' && (
          <RoleGate categoria="listaCompras">
            <ListaCompras dependenteId={id} />
          </RoleGate>
        )}

        {abaAtiva === 'escolarConvenio' && (
          <RoleGate categoria="escolarConvenio">
            <ul className="registro-lista">
              {documentos.map((doc) => (
                <li key={doc.id}>
                  <strong>{doc.tipo}</strong>
                  <span className="registro-meta">Categoria: {doc.categoria} · Enviado em {doc.dataUpload}</span>
                </li>
              ))}
            </ul>
          </RoleGate>
        )}
      </div>
    </div>
  )
}

function ListaCompras({ dependenteId }) {
  const { itens, adicionar, atualizar } = useItensCompra(dependenteId)
  const [novoItem, setNovoItem] = useState('')

  function alternarComprado(item) {
    atualizar(item.id, { comprado: !item.comprado })
  }

  async function adicionarItem(e) {
    e.preventDefault()
    const nome = novoItem.trim()
    if (!nome) return
    await adicionar({ nome, comprado: false })
    setNovoItem('')
  }

  return (
    <>
      <ul className="lista-compras">
        {itens.map((item) => (
          <li key={item.id} className={item.comprado ? 'item-compra item-compra--comprado' : 'item-compra'}>
            <label>
              <input type="checkbox" checked={item.comprado} onChange={() => alternarComprado(item)} />
              {item.nome}
            </label>
          </li>
        ))}
      </ul>
      <form className="form-novo-item" onSubmit={adicionarItem}>
        <input
          type="text"
          placeholder="Ex.: Carrinho de bebê compacto"
          value={novoItem}
          onChange={(e) => setNovoItem(e.target.value)}
        />
        <button type="submit">Adicionar</button>
      </form>
    </>
  )
}
