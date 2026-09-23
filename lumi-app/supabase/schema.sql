-- Esquema da Fase 0 (ver README — Roadmap): tabelas + RLS garantindo que só
-- um usuário autenticado e membro da família pode ler/escrever os dados dela.
-- Ainda NÃO aplica a matriz de permissões por papel de src/access/permissions.js
-- (responsável / cuidador / convidado) — isso é a Fase 1, item 2 de
-- "O que falta para virar um app de verdade" no README.
--
-- Cole este arquivo no SQL Editor do painel do Supabase e rode uma vez.

create table if not exists familias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

create table if not exists usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  papel text not null check (papel in ('responsavel', 'cuidador', 'convidado')),
  familia_id uuid not null references familias (id) on delete cascade
);

create table if not exists dependentes (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references familias (id) on delete cascade,
  nome text not null,
  data_nascimento date,
  cpf text,
  tipo_sanguineo text,
  foto text,
  criado_em timestamptz not null default now()
);

alter table familias enable row level security;
alter table usuarios enable row level security;
alter table dependentes enable row level security;

-- usuarios: cada um só lê/edita o próprio perfil.
create policy "usuarios: ler o próprio perfil" on usuarios
  for select using (auth.uid() = id);

create policy "usuarios: criar o próprio perfil" on usuarios
  for insert with check (auth.uid() = id);

create policy "usuarios: editar o próprio perfil" on usuarios
  for update using (auth.uid() = id);

-- familias: qualquer autenticado pode criar (primeiro acesso); só quem
-- pertence à família pode lê-la.
create policy "familias: criar" on familias
  for insert to authenticated with check (true);

create policy "familias: ler a própria família" on familias
  for select using (
    id = (select familia_id from usuarios where id = auth.uid())
  );

-- dependentes: ler/criar/editar restrito a quem pertence à família dona do registro.
create policy "dependentes: ler da própria família" on dependentes
  for select using (
    familia_id = (select familia_id from usuarios where id = auth.uid())
  );

create policy "dependentes: criar na própria família" on dependentes
  for insert with check (
    familia_id = (select familia_id from usuarios where id = auth.uid())
  );

create policy "dependentes: editar da própria família" on dependentes
  for update using (
    familia_id = (select familia_id from usuarios where id = auth.uid())
  );

-- Realtime: necessário para useDependentes.js receber INSERT/UPDATE/DELETE ao vivo.
alter publication supabase_realtime add table dependentes;
