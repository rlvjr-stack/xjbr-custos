# Classe 7 — Controle de Custos de Obra

Sistema web para controlar e ratear custos de obra entre os investidores **XJBR** e **MPI**
(Construtora Classe 7). Online, multiusuário, com guarda de comprovantes.

## Stack
- **Frontend:** HTML + CSS + JavaScript · Chart.js
- **Backend:** Supabase (PostgreSQL + Storage + Auth)
- **Hospedagem:** Vercel (domínio próprio + HTTPS)

## Arquivos
| Arquivo | Para que serve |
|---|---|
| [`index.html`](index.html) | A aplicação |
| [`config.js`](config.js) | Chaves do Supabase (preencher antes de usar) |
| [`supabase/schema.sql`](supabase/schema.sql) | Cria tabelas, segurança (RLS) e o bucket de arquivos |
| [`GUIA_DE_INSTALACAO.md`](GUIA_DE_INSTALACAO.md) | **Comece aqui** — passo a passo para colocar no ar |
| [`DASHBOARD_CLASSE7_DOCUMENTACAO.md`](DASHBOARD_CLASSE7_DOCUMENTACAO.md) | Manual de uso das funcionalidades |

## Como publicar
Siga o **[GUIA_DE_INSTALACAO.md](GUIA_DE_INSTALACAO.md)**: criar projeto no Supabase →
rodar o `schema.sql` → criar os 2 usuários (Financeiro/Visualizador) → preencher `config.js`
→ publicar na Vercel → ligar o domínio.

## Acesso
Login só por **senha**, com dois perfis:
- **Financeiro** — acesso completo (cria/edita/exclui)
- **Visualizador** — somente leitura

A separação é garantida no banco (Row Level Security), não só na tela.
