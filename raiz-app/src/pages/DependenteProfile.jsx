import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import RoleGate, { usePermission } from '../components/RoleGate'
import {
  dependentes,
  documentos,
  registrosSaude,
  medicamentos,
  vacinas,
  lembretes,
} from '../data/mockData'

const ABAS = [
  { id: 'pessoal', titulo: 'Dados pessoais' },
  { id: 'saude', titulo: 'Saúde' },
  { id: 'medicamentosVacinas', titulo: 'Medicamentos e vacinas' },
  { id: 'lembretes', titulo: 'Lembretes' },
  { id: 'escolarConvenio', titulo: 'Documentos' },
]

export default function DependenteProfile() {
  const { id } = useParams()
  const [abaAtiva, setAbaAtiva] = useState('pessoal')
  const dependente = dependentes.find((d) => d.id === id)
  const nivelAbaAtiva = usePermission(abaAtiva)

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
            <ul className="registro-lista">
              {registrosSaude.filter((r) => r.dependenteId === id).map((r) => (
                <li key={r.id}>
                  <strong>{r.tipo === 'alergia' ? 'Alergia' : 'Consulta'}</strong> — {r.descricao}
                  <span className="registro-meta">{r.data} · {r.profissional}</span>
                </li>
              ))}
            </ul>
          </RoleGate>
        )}

        {abaAtiva === 'medicamentosVacinas' && (
          <RoleGate categoria="medicamentosVacinas">
            <h3>Medicamentos em uso</h3>
            <ul className="registro-lista">
              {medicamentos.filter((m) => m.dependenteId === id && m.ativo).map((m) => (
                <li key={m.id}>
                  <strong>{m.nome}</strong> — {m.dosagem}
                  <span className="registro-meta">Horário: {m.horarios.join(', ')}</span>
                </li>
              ))}
            </ul>
            <h3>Vacinas</h3>
            <ul className="registro-lista">
              {vacinas.filter((v) => v.dependenteId === id).map((v) => (
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
              {lembretes.filter((l) => l.dependenteId === id).map((l) => (
                <li key={l.id}>
                  <strong>{l.referencia}</strong>
                  <span className="registro-meta">{l.dataAlvo} · {l.status}</span>
                </li>
              ))}
            </ul>
          </RoleGate>
        )}

        {abaAtiva === 'escolarConvenio' && (
          <RoleGate categoria="escolarConvenio">
            <ul className="registro-lista">
              {documentos.filter((doc) => doc.dependenteId === id).map((doc) => (
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
