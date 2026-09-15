# Raiz — protótipo

Protótipo inicial do app descrito no PRD ("Raiz"): repositório de documentos, saúde e memórias da sua filha.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (algo como `http://localhost:5173`).

Na tela de login, escolha um dos perfis de exemplo — **Rafael** ou **Camila** (Responsável), **Vó Lúcia** (Cuidadora) ou **Dra. Ana** (Convidada) — para ver como cada papel enxerga telas diferentes.

## O que já existe

- Login mock com três papéis (Responsável, Cuidador de confiança, Convidado profissional)
- Lista de dependentes (já pronta para mais de um filho)
- Perfil do dependente com abas: dados pessoais, saúde, medicamentos e vacinas, lembretes, documentos
- Controle de acesso por papel (`src/access/permissions.js`), a mesma matriz da seção 7 do PRD
- App instalável como PWA (`vite-plugin-pwa`)
- Dados de exemplo em `src/data/mockData.js` — nada ainda está salvo de verdade

## O que falta para virar um app de verdade

1. Criar um projeto no [console do Firebase](https://console.firebase.google.com), ativar **Authentication**, **Firestore** e **Storage**.
2. Copiar `.env.example` para `.env` e preencher com as chaves do projeto.
3. Trocar as importações de `src/data/mockData.js` por leituras/escritas no Firestore (o arquivo `src/firebase.js` já expõe `db`, `auth` e `storage` prontos para uso).
4. Escrever as regras de segurança do Firestore aplicando a mesma matriz de `src/access/permissions.js` do lado do servidor — hoje ela só é aplicada na tela, o que não é suficiente sozinho para dados sensíveis.
5. Trocar o login mock por Firebase Authentication de verdade (e-mail/senha ou link mágico).

## Estrutura

```
src/
  access/permissions.js   matriz de permissões por papel
  context/AuthContext.jsx quem está logado agora (mock)
  components/             Layout e RoleGate (esconde o que o papel não pode ver)
  pages/                  Login, Dashboard, Perfil do dependente
  data/mockData.js        dados de exemplo
  firebase.js             conexão com Firebase (inativa até existir .env)
```
