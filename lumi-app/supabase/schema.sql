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

-- Fluxo de convite (README — "O que falta", item 3): o Responsável gera um
-- código ligado à família e a um papel; a pessoa convidada usa esse código no
-- próprio cadastro para entrar na família com o papel certo, sem poder virar
-- responsável sozinha nem ver os códigos de outras famílias.

create table if not exists convites (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references familias (id) on delete cascade,
  papel text not null check (papel in ('cuidador', 'convidado')),
  codigo text not null unique,
  usado boolean not null default false,
  criado_em timestamptz not null default now()
);

alter table convites enable row level security;

-- Só o próprio Responsável da família vê/cria os convites dela — ninguém lê
-- essa tabela diretamente para "adivinhar" um código (isso passa só pela
-- função resgatar_convite abaixo, que não expõe a tabela inteira).
create policy "convites: responsavel cria da propria familia" on convites
  for insert with check (
    familia_id = (select familia_id from usuarios where id = auth.uid())
    and (select papel from usuarios where id = auth.uid()) = 'responsavel'
  );

create policy "convites: responsavel ve da propria familia" on convites
  for select using (
    familia_id = (select familia_id from usuarios where id = auth.uid())
    and (select papel from usuarios where id = auth.uid()) = 'responsavel'
  );

-- Função especial: roda com privilégio de dono da tabela (`security definer`),
-- então consegue validar e "gastar" um código sem que o chamador precise ter
-- acesso de leitura à tabela convites inteira. Evita expor todos os códigos
-- de todas as famílias para quem só deveria enxergar o seu próprio.
create or replace function resgatar_convite(codigo_input text)
returns table (familia_id uuid, papel text)
language plpgsql
security definer
set search_path = public
as $$
declare
  convite record;
begin
  select c.id, c.familia_id, c.papel into convite
  from convites c
  where c.codigo = codigo_input and c.usado = false;

  if not found then
    raise exception 'Convite inválido ou já utilizado.';
  end if;

  update convites set usado = true where id = convite.id;

  return query select convite.familia_id, convite.papel;
end;
$$;

grant execute on function resgatar_convite(text) to authenticated;
