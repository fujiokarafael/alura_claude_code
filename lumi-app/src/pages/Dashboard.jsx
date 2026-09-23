import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDependentes } from '../data/useDependentes'
import { lembretes } from '../data/mockData'

function idade(dataNascimento) {
  const nascimento = new Date(dataNascimento)
  const diffMs = Date.now() - nascimento.getTime()
  const meses = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
  return meses < 24 ? `${meses} meses` : `${Math.floor(meses / 12)} anos`
}

export default function Dashboard() {
  const { usuarioAtual } = useAuth()
  const { dependentes, adicionarDependente } = useDependentes(usuarioAtual?.familiaId)

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
      </div>
      <NovoDependente onAdicionar={adicionarDependente} />
    </div>
  )
}

function NovoDependente({ onAdicionar }) {
  const [aberto, setAberto] = useState(false)
  const [form, setForm] = useState({ nome: '', dataNascimento: '', cpf: '', tipoSanguineo: '' })
  const [enviando, setEnviando] = useState(false)

  function atualizarCampo(campo) {
    return (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await onAdicionar({ ...form, foto: null })
      setForm({ nome: '', dataNascimento: '', cpf: '', tipoSanguineo: '' })
      setAberto(false)
    } finally {
      setEnviando(false)
    }
  }

  if (!aberto) {
    return (
      <button className="dependente-card dependente-card--novo" onClick={() => setAberto(true)}>
        + Adicionar dependente
      </button>
    )
  }

  return (
    <form className="form-novo-dependente" onSubmit={handleSubmit}>
      <input placeholder="Nome" value={form.nome} onChange={atualizarCampo('nome')} required />
      <input type="date" placeholder="Data de nascimento" value={form.dataNascimento} onChange={atualizarCampo('dataNascimento')} required />
      <input placeholder="CPF" value={form.cpf} onChange={atualizarCampo('cpf')} />
      <input placeholder="Tipo sanguíneo" value={form.tipoSanguineo} onChange={atualizarCampo('tipoSanguineo')} />
      <div className="form-novo-dependente-acoes">
        <button type="button" onClick={() => setAberto(false)}>Cancelar</button>
        <button type="submit" disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  )
}
