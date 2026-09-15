import { Link } from 'react-router-dom'
import { dependentes, lembretes } from '../data/mockData'

function idade(dataNascimento) {
  const nascimento = new Date(dataNascimento)
  const diffMs = Date.now() - nascimento.getTime()
  const meses = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
  return meses < 24 ? `${meses} meses` : `${Math.floor(meses / 12)} anos`
}

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dependentes</h1>
      <div className="dependente-grid">
        {dependentes.map((dependente) => {
          const pendentes = lembretes.filter((l) => l.dependenteId === dependente.id && l.status === 'pendente')
          return (
            <Link key={dependente.id} to={`/dependente/${dependente.id}`} className="dependente-card">
              <strong>{dependente.nome}</strong>
              <span>{idade(dependente.dataNascimento)} · Tipo {dependente.tipoSanguineo}</span>
              {pendentes.length > 0 && (
                <span className="lembrete-count">{pendentes.length} lembrete(s) pendente(s)</span>
              )}
            </Link>
          )
        })}
        <Link to="#" className="dependente-card dependente-card--novo" onClick={(e) => e.preventDefault()}>
          + Adicionar dependente
        </Link>
      </div>
    </div>
  )
}
