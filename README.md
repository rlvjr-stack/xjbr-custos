# Classe 7 — Controle de Custos de Obra

Sistema web para controlar e ratear custos de obra entre os investidores **XJBR** e **MPI**
(Construtora Classe 7). Online, multiusuário, com guarda de comprovantes.

## Stack
- **Frontend:** HTML + CSS + JavaScript · Chart.js
- **Backend:** Supabase (PostgreSQL + Storage + Auth) via funções serverless (`/api`) na Vercel
- **Hospedagem:** Vercel (domínio próprio + HTTPS)

## Arquivos
| Arquivo | Para que serve |
|---|---|
| [`index.html`](index.html) | A aplicação |
| [`api/`](api) | Funções serverless (login, configuração pública, administração de parceiros) |
| [`lib/`](lib) | Helpers do backend (cliente Supabase admin, checagem do Dev, CRUD de parceiros) |
| [`supabase/schema.sql`](supabase/schema.sql) | Cria tabelas, segurança (RLS) e o bucket de arquivos |
| [`GUIA_DE_INSTALACAO.md`](GUIA_DE_INSTALACAO.md) | **Comece aqui** — passo a passo para colocar no ar |
| [`DASHBOARD_CLASSE7_DOCUMENTACAO.md`](DASHBOARD_CLASSE7_DOCUMENTACAO.md) | Manual de uso das funcionalidades |

## Como publicar
Siga o **[GUIA_DE_INSTALACAO.md](GUIA_DE_INSTALACAO.md)**: criar projeto no Supabase →
rodar o `schema.sql` → configurar as variáveis de ambiente na Vercel (chaves do Supabase,
senha do Dev) → publicar → rodar o bootstrap (`/api/admin/bootstrap`) uma única vez para
criar os parceiros iniciais → ligar o domínio.

## Segurança
Nenhuma chave ou senha fica no código-fonte ou em arquivos estáticos. Tudo o que é sensível
(`SUPABASE_SERVICE_ROLE_KEY`, `DEV_PASS`, hashes de senha dos parceiros) vive como variável
de ambiente na Vercel e só é acessado pelas funções em `/api` (lado servidor). O navegador
recebe apenas a chave pública `anon` (via `/api/public-config`), protegida pelas regras de
RLS do banco.

## Acesso
Login só por **senha**, com dois perfis:
- **Financeiro** — acesso completo (cria/edita/exclui)
- **Visualizador** — somente leitura

A separação é garantida no banco (Row Level Security), não só na tela.
