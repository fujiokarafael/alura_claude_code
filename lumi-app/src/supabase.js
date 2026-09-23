// Ponto único de conexão com o Supabase (Auth, Postgres, Storage).
//
// Enquanto o arquivo .env não tiver as chaves do projeto (veja .env.example),
// `isSupabaseConfigured` fica falso e o app usa os dados de exemplo em
// src/data/mockData.js — assim dá para navegar pelas telas antes de criar
// o projeto no Supabase.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
