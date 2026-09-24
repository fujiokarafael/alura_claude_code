import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDependentes } from '../data/useDependentes'
import { lembretes } from '../data/mockData'
import { usePermission } from '../components/RoleGate'

function idade(dataNascimento) {
  const nascimento = new Date(dataNascimento)
  const diffMs = Date.now() - nascimento.getTime()
  const meses = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
  return meses < 24 ? `${meses} meses` : `${Math.floor(meses / 12)} anos`
}

export default function Dashboard() {
  const { usuarioAtual } = useAuth()
  const { dependentes, adicionarDependente } = useDependentes(usuarioAtual?.familiaId)
  const podeConfigurarAcesso = usePermission('configuracoes') === 'full'

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
      {podeConfigurarAcesso && <ConvidarPessoa />}
    </div>
  )
}

// Só o Responsável vê isto (matriz de permissões, categoria "configuracoes").
// Gera um código de uso único ligado ao papel escolhido — ver
// AuthContext.gerarConvite e supabase/schema.sql (tabela convites).
function ConvidarPessoa() {
  const { gerarConvite } = useAuth()
  const [papel, setPapel] = useState('cuidador')
  const [codigo, setCodigo] = useState(null)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState(null)

  async function handleGerar() {
    setErro(null)
    setGerando(true)
    try {
      setCodigo(await gerarConvite(papel))
    } catch (err) {
      setErro(err.message)
    } finally {
      setGerando(false)
    }
  }

  return (
    <section className="convidar-pessoa">
      <h2>Convidar cuidador ou convidado</h2>
      <p>Gere um código, envie por WhatsApp e a pessoa usa em "Tenho um código de convite" na tela de login.</p>
      <div className="form-convite">
        <select value={papel} onChange={(e) => { setPapel(e.target.value); setCodigo(null) }}>
          <option value="cuidador">Cuidador de confiança</option>
          <option value="convidado">Convidado profissional</option>
        </select>
        <button onClick={handleGerar} disabled={gerando}>
          {gerando ? 'Gerando...' : 'Gerar código'}
        </button>
      </div>
      {erro && <p className="erro-login">{erro}</p>}
      {codigo && <p className="codigo-convite">Código: <strong>{codigo}</strong></p>}
    </section>
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
