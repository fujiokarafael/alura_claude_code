# Lumi — protótipo

Protótipo do app descrito no PRD (nome definitivo: "Lumi", antes referido como "Raiz"): repositório de documentos, saúde e memórias da sua filha. Segue o roadmap da seção 10 do PRD — este README acompanha em qual fase o código está.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (algo como `http://localhost:5173`).

Sem um projeto Supabase configurado (veja abaixo), o app abre no **modo mock**: na tela de login, escolha um dos perfis de exemplo — **Rafael** ou **Camila** (Responsável), **Vó Lúcia** (Cuidadora) ou **Dra. Ana** (Convidada) — para ver como cada papel enxerga telas diferentes.

## Fase 0 do roadmap — Supabase real (feito)

1. Crie um projeto no [painel do Supabase](https://supabase.com/dashboard) e, em **Authentication → Providers**, deixe **Email** ativado. Em **Authentication → Settings**, desative "Confirm email" para simplificar o cadastro do protótipo (sem isso, o usuário precisa confirmar o e-mail antes do primeiro login).
2. Copie `.env.example` para `.env` e preencha com a URL e a `anon key` do projeto (Project Settings → API).
3. Cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) no **SQL Editor** do painel e rode uma vez — ele cria as tabelas e as políticas de RLS (Row Level Security).
4. Rode `npm run dev` de novo — a tela de login passa a pedir e-mail/senha reais. Clique em "Ainda não tenho conta" para criar a primeira família e o primeiro responsável.
5. Cadastre a primeira dependente pelo botão "+ Adicionar dependente" no Dashboard — ela é salva de verdade no Supabase (tabela `dependentes`).

Sem `.env`, nada disso aparece e o app continua no modo mock — os dois modos convivem no mesmo código (ver `src/supabase.js` e `src/data/useDependentes.js`).

Se você já tinha rodado `supabase/schema.sql` antes, não precisa colar o arquivo inteiro de novo — só a parte que ainda não rodou (identificável pelos comentários `-- Fluxo de convite` e `-- Fase 1` no arquivo).

## O que já existe

- **Autenticação real** (e-mail/senha, via Supabase Auth) quando `.env` está configurado; login mock com três papéis quando não está
- **Cadastro de dependente real**, salvo no Supabase (Postgres) com atualização em tempo real via Realtime — a família e o primeiro responsável são criados juntos no cadastro
- **Convite de cuidador/convidado por código**: o Responsável gera um código (Dashboard → "Convidar cuidador ou convidado"), escolhendo o papel; a pessoa convidada usa esse código na tela de login ("Tenho um código de convite") pra entrar na mesma família com o papel certo — ver `AuthContext.gerarConvite`/`cadastrarComConvite` e a função `resgatar_convite` em `supabase/schema.sql`
- **Perfil do dependente com dados reais do Supabase** em todas as abas (dados pessoais, saúde, consultas, medicamentos e vacinas, lembretes, lista de compras, documentos) — ver `src/data/useRegistrosDependente.js`. Só a Lista de Compras tem formulário de adicionar hoje; as outras abas ainda exibem os dados mas não têm um botão de cadastro funcional (ver "O que falta")
- Controle de acesso por papel na tela (`src/access/permissions.js`), a mesma matriz da seção 7 do PRD, com `consultas` e `listaCompras` adicionadas junto às categorias do PRD original
- App instalável como PWA (`vite-plugin-pwa`)

## O que falta para virar um app de verdade

1. Formulários de cadastro para as abas que hoje só leem (saúde, consultas, medicamentos/vacinas, documentos) — os botões "+ Anexar receita", "+ Registrar consulta" etc. ainda estão desabilitados.
2. Escrever as políticas de RLS aplicando a matriz completa de `src/access/permissions.js` por categoria — as políticas atuais (`supabase/schema.sql`) só garantem que a família é dona dos seus dados, ainda sem diferenciar responsável / cuidador / convidado.
3. Upload de arquivo de verdade para o Supabase Storage (documentos, receitas, exames).

## Estrutura

```
src/
  access/permissions.js         matriz de permissões por papel
  context/AuthContext.jsx       sessão atual — Supabase Auth real ou mock; convites
  data/useDependentes.js        lê/escreve dependentes no Supabase (ou mock, se não configurado)
  data/criarUseColecao.js       fábrica de hooks reaproveitada pelas 8 coleções abaixo
  data/useRegistrosDependente.js  documentos, saúde, consultas, medicamentos, vacinas, lembretes, lista de compras
  data/mockData.js              dados de exemplo (usados só quando .env não está configurado)
  components/                   Layout e RoleGate (esconde o que o papel não pode ver)
  pages/                        Login, Dashboard, Perfil do dependente
  supabase.js                   conexão com Supabase (inativa até existir .env)
supabase/schema.sql             tabelas, políticas de RLS e funções — colar no SQL Editor do Supabase
```
