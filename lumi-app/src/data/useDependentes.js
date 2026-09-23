import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase'
import { dependentes as dependentesMock } from './mockData'

// O Postgres usa snake_case; o resto do app usa camelCase.
function paraApp(row) {
  return {
    id: row.id,
    nome: row.nome,
    dataNascimento: row.data_nascimento,
    cpf: row.cpf,
    tipoSanguineo: row.tipo_sanguineo,
    foto: row.foto,
  }
}

function paraBanco(dados) {
  return {
    nome: dados.nome,
    data_nascimento: dados.dataNascimento,
    cpf: dados.cpf,
    tipo_sanguineo: dados.tipoSanguineo,
    foto: dados.foto,
  }
}

// Fonte única da lista de dependentes: lê do Supabase quando o app está
// configurado com um projeto real, ou mantém os dados de exemplo em
// memória enquanto isso (ver README — "O que falta para virar um app de verdade").
export function useDependentes(familiaId) {
  const [dependentes, setDependentes] = useState(isSupabaseConfigured ? [] : dependentesMock)

  useEffect(() => {
    if (!isSupabaseConfigured || !familiaId) return

    let ativo = true

    supabase
      .from('dependentes')
      .select('*')
      .eq('familia_id', familiaId)
      .then(({ data }) => {
        if (ativo && data) setDependentes(data.map(paraApp))
      })

    const canal = supabase
      .channel(`dependentes-${familiaId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dependentes', filter: `familia_id=eq.${familiaId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDependentes((atual) => [...atual, paraApp(payload.new)])
          } else if (payload.eventType === 'UPDATE') {
            setDependentes((atual) =>
              atual.map((d) => (d.id === payload.new.id ? paraApp(payload.new) : d)),
            )
          } else if (payload.eventType === 'DELETE') {
            setDependentes((atual) => atual.filter((d) => d.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      ativo = false
      supabase.removeChannel(canal)
    }
  }, [familiaId])

  async function adicionarDependente(dados) {
    if (isSupabaseConfigured && familiaId) {
      const { error } = await supabase
        .from('dependentes')
        .insert({ ...paraBanco(dados), familia_id: familiaId })
      if (error) throw error
      return
    }
    setDependentes((atual) => [...atual, { id: `dep-${Date.now()}`, ...dados }])
  }

  return { dependentes, adicionarDependente }
}
