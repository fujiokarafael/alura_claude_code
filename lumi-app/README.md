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

Se você já tinha rodado `supabase/schema.sql` antes de o fluxo de convite existir, precisa colar de novo só a parte nova (tabela `convites` e a função `resgatar_convite`, no fim do arquivo) no SQL Editor — o resto já existe e não precisa repetir.

## O que já existe

- **Autenticação real** (e-mail/senha, via Supabase Auth) quando `.env` está configurado; login mock com três papéis quando não está
- **Cadastro de dependente real**, salvo no Supabase (Postgres) com atualização em tempo real via Realtime — a família e o primeiro responsável são criados juntos no cadastro
- **Convite de cuidador/convidado por código**: o Responsável gera um código (Dashboard → "Convidar cuidador ou convidado"), escolhendo o papel; a pessoa convidada usa esse código na tela de login ("Tenho um código de convite") pra entrar na mesma família com o papel certo — ver `AuthContext.gerarConvite`/`cadastrarComConvite` e a função `resgatar_convite` em `supabase/schema.sql`
- Perfil do dependente com abas: dados pessoais, saúde (alergias/condições + receitas e exames anexados), consultas, medicamentos e vacinas, lembretes, lista de compras, documentos
- Controle de acesso por papel na tela (`src/access/permissions.js`), a mesma matriz da seção 7 do PRD, com `consultas` e `listaCompras` adicionadas junto às categorias do PRD original
- App instalável como PWA (`vite-plugin-pwa`)

## O que ainda é só mock (Fase 1 do roadmap)

As abas de saúde, consultas, medicamentos/vacinas, lembretes, lista de compras e documentos ainda leem de `src/data/mockData.js` — só o cadastro do dependente (Fase 0) já é real. Migrar essas coleções para o Supabase é a Fase 1.

## O que falta para virar um app de verdade (Fase 1 em diante)

1. Migrar `documentos`, `registrosSaude`, `consultas`, `documentosSaude`, `medicamentos`, `vacinas`, `lembretes` e `itensCompra` de `src/data/mockData.js` para tabelas do Supabase (com `dependente_id` como chave estrangeira), seguindo o padrão de `src/data/useDependentes.js`.
2. Escrever as políticas de RLS aplicando a matriz completa de `src/access/permissions.js` por categoria — as políticas atuais (`supabase/schema.sql`) só garantem que a família é dona dos seus dados, ainda sem diferenciar responsável / cuidador / convidado.
3. Upload de arquivo de verdade para o Supabase Storage (documentos, receitas, exames).

## Estrutura

```
src/
  access/permissions.js     matriz de permissões por papel
  context/AuthContext.jsx   sessão atual — Supabase Auth real ou mock
  data/useDependentes.js    lê/escreve dependentes no Supabase (ou mock, se não configurado)
  data/mockData.js          dados de exemplo (ainda usados por todas as abas, exceto dependentes)
  components/               Layout e RoleGate (esconde o que o papel não pode ver)
  pages/                    Login, Dashboard, Perfil do dependente
  supabase.js               conexão com Supabase (inativa até existir .env)
supabase/schema.sql         tabelas e políticas de RLS da Fase 0 — colar no SQL Editor do Supabase
```
