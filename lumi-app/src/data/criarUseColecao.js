import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase'

// Fábrica de hooks: cada aba do perfil do dependente (saúde, consultas,
// medicamentos...) precisa do mesmo comportamento — ler do Supabase com
// atualização em tempo real quando configurado, ou usar dados de exemplo
// quando não (mesmo padrão de useDependentes.js). Em vez de repetir esse
// código 8 vezes, esta função gera o hook pronto; as 8 chamadas ficam em
// src/data/useRegistrosDependente.js.
export function criarUseColecao({ tabela, dadosMock, paraApp, paraBanco }) {
  return function useColecao(dependenteId) {
    const [itens, setItens] = useState(() =>
      isSupabaseConfigured ? [] : dadosMock.filter((item) => item.dependenteId === dependenteId),
    )

    useEffect(() => {
      if (!isSupabaseConfigured || !dependenteId) return
      let ativo = true

      supabase
        .from(tabela)
        .select('*')
        .eq('dependente_id', dependenteId)
        .then(({ data }) => {
          if (ativo && data) setItens(data.map(paraApp))
        })

      const canal = supabase
        .channel(`${tabela}-${dependenteId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tabela, filter: `dependente_id=eq.${dependenteId}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setItens((atual) => [...atual, paraApp(payload.new)])
            } else if (payload.eventType === 'UPDATE') {
              setItens((atual) => atual.map((item) => (item.id === payload.new.id ? paraApp(payload.new) : item)))
            } else if (payload.eventType === 'DELETE') {
              setItens((atual) => atual.filter((item) => item.id !== payload.old.id))
            }
          },
        )
        .subscribe()

      return () => {
        ativo = false
        supabase.removeChannel(canal)
      }
    }, [dependenteId])

    async function adicionar(dados) {
      if (isSupabaseConfigured && dependenteId) {
        const { error } = await supabase.from(tabela).insert({ ...paraBanco(dados), dependente_id: dependenteId })
        if (error) throw error
        return
      }
      setItens((atual) => [...atual, { id: `${tabela}-${Date.now()}`, dependenteId, ...dados }])
    }

    async function atualizar(id, dados) {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from(tabela).update(paraBanco(dados)).eq('id', id)
        if (error) throw error
        return
      }
      setItens((atual) => atual.map((item) => (item.id === id ? { ...item, ...dados } : item)))
    }

    return { itens, adicionar, atualizar }
  }
}
