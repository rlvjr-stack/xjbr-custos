# 📒 Log do Projeto — Sistema de Custos XJBR

> Documento de continuidade. Resume **tudo que foi feito**, o **estado atual**, as
> **decisões**, **senhas/credenciais**, a **estrutura de arquivos** e os **próximos passos**.
> Última atualização: **15/06/2026 (sessão 8)** — Lançamentos (lista principal e "Lançamentos vinculados" do detalhe da obra) agora ordenados por Data por padrão, em vez de por Nº/ID, com novo seletor na barra de filtros para alternar entre "Ordenar por Data" e "Ordenar por Nº/ID".

---

## 1. O que é o projeto

Sistema web para **controlar e ratear custos de obra** entre duas fontes pagadoras
(ex.: **XJBR × MPI**), da **XJBR** (domínio pretendido: `www.xjbr.com.br`).

Concepção atual: o **Dev** é o administrador central que cria e gerencia **clientes**
(parceiros). Cada cliente tem seu próprio dashboard isolado, com identidade visual
(logo, nome, cores), fontes pagadoras e senhas próprias.

---

## 2. Estado atual (resumo rápido)

- ✅ **Segurança reescrita (sessão 6)**: backend serverless `/api` na Vercel; segredos
  (chave `service_role`, `DEV_PASS`, hashes/senhas internas) só em variáveis de
  ambiente — nunca em arquivo do site. `config.js` **removido**.
- ✅ Pronto para virar **ONLINE** (Supabase) configurando as variáveis de ambiente na Vercel
  e rodando o **bootstrap** (`/api/admin/bootstrap`) uma única vez.
- ✅ Sem backend configurado, cai em **modo LOCAL/demo** (no navegador, `localStorage`,
  senhas de demonstração fixas) — não protege dado real algum.
- ✅ **Multi-cliente**: cada cliente tem ambiente isolado (`/mpi`, `/construtorax`…), agora
  persistido no banco (`tenant_settings`) e gerenciado pelo Painel Dev via `/api/admin/tenants`.
- ✅ **3 perfis de acesso**: Financeiro, Visualizador e Dev (super-admin).
- ✅ **Painel Dev** com criação de clientes, logo (sigla ou imagem), fontes e senhas — agora
  persistido no banco em modo online (sem mais lista local/`config.js`).
- ✅ **Arquivar obras**: Financeiro arquiva com data de término; obra sai do picker de novas despesas; pode reativar.
- ✅ **Filtro Ativas / Arquivadas / Todas**: afeta KPIs, gráficos e tabela.
- ✅ **Formato R$ brasileiro** em todos os campos de valor (prefixo R$, `.` milhar, `,` decimal).
- ✅ **Fontes Pagadoras e Centros de Custo editáveis** pelo Financeiro/Dev via modal Configurações.
- ✅ **Proteção contra exclusão de obra** com lançamentos vinculados.
- ✅ **Tooltip nas ações de obra** (📦 Arquivar Obra / 🗑 Excluir Obra).
- ✅ **Rateio manual por obra**: ao criar/editar lançamento, escolha entre divisão igual ou valor manual por obra; soma deve fechar com o total; relatórios usam os valores reais.
- ✅ **7 correções** de análise aplicadas (veja seção 8).
- ✅ **Publicado** em produção na Vercel (`xjbr-custos.vercel.app`); domínio `www.xjbr.com.br` ainda não conectado.
- ✅ **Botão de tema claro/escuro** no cabeçalho (desktop) e no menu (mobile).
- ✅ **Fontes pagadoras dinâmicas nos resultados**: cards "Pago por X" e o gráfico "Por fonte pagadora" agora mostram TODAS as fontes cadastradas (não só as 2 primeiras).
- ✅ **Tabela "Lançamentos vinculados" responsiva**: no detalhe da obra, em telas ≤768px a tabela (que quebrava texto letra-por-letra) é substituída por uma lista de cards, igual ao padrão da lista principal de lançamentos.
- ✅ **Fontes pagadoras persistem no banco**: salvar em Configurações grava `tenant_settings.fontes` via `PUT /api/settings` (Financeiro/Dev), não some mais ao limpar o cache.
- ✅ **Anexos no detalhe da obra**: a tabela "Lançamentos vinculados" (desktop e cards mobile) agora mostra o selo 📎 clicável para ver os comprovantes, igual à lista principal.
- ⚠️ **Pendente: rodar `supabase/schema.sql` atualizado no SQL Editor do Supabase** — adiciona as colunas `lancamentos.rateio` (jsonb) e `obras.archived`/`obras.ended_at`, que faltavam no banco e causavam erro ao salvar lançamento/arquivar obra.

Para testar localmente (modo demo/offline, sem backend): `http://localhost:8123/?t=mpi` → senha `dev-master`.

---

## 3. Como abrir / usar agora (modo local)

1. Servidor estático já configurado em `.claude/launch.json` (porta 8123).
2. Acesse `http://localhost:8123/?t=mpi` no navegador. Use **Ctrl+Shift+R** se necessário.
3. Tela de login → senha (ver seção 4) → Entrar.
4. Para testar outro cliente no PC: `?t=construtorax`.

---

## 4. Senhas atuais

**Modo demo/offline (sem backend)** — fixas em `LOCAL_FALLBACK_CONFIG` dentro do
`index.html`, sem efeito em produção e sem proteger dado real algum:

| Acesso | Senha (demo) |
|---|---|
| **Dev** (super-admin, global) | `dev-master` |
| MPI — Financeiro | `classe7` |
| MPI — Visualizador | `ver123` |

**Modo online (produção)** — não há mais senhas fixas no código:

| Acesso | Onde fica |
|---|---|
| **Dev** (super-admin, global) | variável de ambiente `DEV_PASS` na Vercel |
| Financeiro / Visualizador de cada parceiro | hash (bcrypt) em `tenant_settings`, definido no **bootstrap** (`/api/admin/bootstrap`) ou no Painel Dev (`/api/admin/tenants`) |

> O Dev entra pela mesma tela de senha; o sistema reconhece automaticamente
> e mostra o botão **🛠 Admin**.

---

## 5. Perfis de acesso

- **Financeiro** — cria/edita/exclui lançamentos, gerencia obras, arquiva/reativa obras.
- **Visualizador** — somente leitura; vê e abre comprovantes/anexos.
- **Dev** — super-admin: Painel do Desenvolvedor (criar/editar/abrir/remover clientes e administrar tudo, em qualquer ambiente).

---

## 6. Estrutura de arquivos

```
XJBR-MPI/
├── index.html                       ← o sistema (HTML + CSS + JS)
├── api/
│   ├── public-config.js             ← config pública (anon key + lista de parceiros)
│   ├── login.js                     ← verifica senha no servidor, devolve sessão
│   └── admin/
│       ├── tenants.js               ← CRUD de parceiros (só Dev, via Bearer token)
│       └── bootstrap.js             ← inicialização única (1º parceiro + conta Dev)
├── lib/
│   ├── supabaseAdmin.js             ← cliente Supabase com service_role
│   ├── requireDev.js                ← valida que o usuário logado é "dev"
│   └── tenantCrud.js                ← cria/edita contas e senhas de parceiros
├── vercel.json                      ← roteamento /mpi, /construtorax, /api na Vercel
├── package.json / package-lock.json ← dependências (@supabase/supabase-js, bcryptjs)
├── supabase/
│   └── schema.sql                   ← cria o banco online (tabelas + segurança RLS + tenant_settings)
├── GUIA_DE_INSTALACAO.md            ← passo a passo para publicar (Supabase + variáveis de ambiente + Vercel + bootstrap)
├── TUTORIAL_COLOCAR_ONLINE.pdf      ← tutorial em PDF para leigo: GitHub + Supabase + Vercel + deploy
├── DASHBOARD_CLASSE7_DOCUMENTACAO.md← manual de uso das funcionalidades
├── README.md                        ← visão geral
├── gerar_tutorial_pdf.js            ← script Node.js que gerou o PDF do tutorial
└── LOG_DO_PROJETO.md                ← este arquivo
```

> 🔒 `config.js` foi **removido** — não existe mais nenhum arquivo com chaves/senhas
> no site. Tudo isso vive em variáveis de ambiente da Vercel, lidas só por `api/`.

---

## 7. Funcionalidades já prontas

- KPIs (total investido, pago por cada fonte, acerto 50/50)
- Gráficos: gasto por obra (barras por CC) e donut por fonte pagadora
- Painel "Por centro de custo"
- Tabela de lançamentos com ID (`#001`), filtros e coluna Anexo (📎)
- Formulário de lançamento com campo R$ dinâmico, data obrigatória, upload de comprovantes
- **Arquivar obras** — com data de término, seção separada no modal, botão reativar
- **Filtro Ativas / Arquivadas / Todas** — afeta KPIs, gráficos e tabela; aparece automaticamente quando há obra arquivada
- **Gerenciador de obras** — obras arquivadas não aparecem no picker de novas despesas
- Detalhe da obra (modal) com KPIs, painel por CC e tabela responsiva
- Exportar Excel/CSV · Backup/Importar JSON (com aviso de ambiente no import)
- Login por senha (3 perfis) com identificação de ambiente no header (`/mpi`)
- **Painel Dev** (🛠 Admin):
  - Lista de clientes com logo em miniatura
  - Formulário "Novo cliente": slug, nome, logo (sigla ou imagem upload), fontes, senhas
  - Abrir, editar, limpar dados, remover clientes
- **Logo por cliente**: sigla de texto OU imagem (base64, máx 500KB); aparece no header e na tela de login

---

## 8. Histórico do que foi feito (cronológico)

1. Diagnóstico do dashboard original (HTML único, localStorage, senhas no código).
2. Correção XJBE → XJBR em todo o sistema e documentação.
3. Transformação em sistema publicável: arquitetura Supabase, `index.html`, `config.js`, `supabase/schema.sql`, guia e documentação.
4. Modo LOCAL adicionado: funciona no navegador sem Supabase; troca para online automática.
5. Coluna ID (`#001`) em cada lançamento (tabela, detalhe da obra e exportação).
6. Coluna Anexo (📎) dedicada e visível na lista.
7. Painel colorido por centro de custo no detalhe da obra + tabela responsiva.
8. Marca: removido "Construtora Classe 7"; agora XJBR × MPI; logo C7; exportações renomeadas. Tags anti-cache no HTML.
9. Multi-parceiro: ambientes por caminho da URL, dados/senhas isolados; fontes pagadoras configuráveis; `vercel.json`; schema com `tenant` + RLS.
10. Usuário Dev + Painel do Desenvolvedor (criar/editar/abrir/limpar/remover parceiros).
11. Visualizador acessa/abre os anexos.
12. **Sessão 06/06/2026 — Melhorias e novas funcionalidades:**
    - Removido `backdrop-filter:blur(3px)` dos modais (causava modal invisível em certos navegadores)
    - Removida animação `pop` do modal (causava `opacity:0` travado em certos browsers)
    - Campo Valor total com prefixo R$ dinâmico (aparece ao digitar, some ao limpar)
    - Data do comprovante obrigatória (validação no save)
    - Login online otimizado: detecta perfil pela senha antes de tentar o banco (evita até 3 roundtrips)
    - Obras sem lançamentos filtradas do gráfico "Gasto por obra"
    - Aviso de senhas em texto no Painel Dev
    - Import com nome do ambiente no confirm
    - Slug `/mpi` visível no subheading do header
    - **Arquivar obras**: botão 📦, data de término inline, seção "Obras arquivadas", botão reativar
    - **Filtro Ativas / Arquivadas / Todas**: barra aparece ao arquivar primeira obra; afeta KPIs, gráficos e tabela
    - **Obras arquivadas** não aparecem no picker de casas ao criar lançamento
    - **Painel Dev reformulado**: lista com logo em miniatura, formulário "Novo cliente" com logo (sigla ou upload de imagem), senhas com type=password

23. **Sessão 15/06/2026 (sessão 8) — Lançamentos ordenados por Data (com opção por Nº/ID):**
    - **Pedido**: a lista de Lançamentos (e a tabela "Lançamentos vinculados" do detalhe da obra) deve ficar sempre ordenada por **Data**, e não pelo Nº/ID — um lançamento cadastrado hoje com data antiga deve aparecer encaixado na posição cronológica correta (data maior primeiro). Adicionar também um seletor na barra de filtros para alternar entre "Ordenar por Data" e "Ordenar por Nº/ID".
    - **Implementado**: novas funções `cmpByData` (data desc, desempate por `numero`) e `cmpById` (Nº/ID desc, comportamento anterior). `render()` agora ordena `viewLancs` com `cmpByData` por padrão, ou `cmpById` se o usuário escolher. Novo `<select id="fSort">` na barra de filtros (`#fltPanel`), com `setSortMode(v)` salvando a escolha em `localStorage` (`xjbr_sort`) e re-renderizando. A tabela "Lançamentos vinculados" do modal Detalhes da Obra (`openObraDetail`) também passou a usar `cmpByData`, sempre por data.

22. **Sessão 13/06/2026 (sessão 7, parte 5) — Anexos visíveis no detalhe da obra:**
    - **Pedido**: na tabela "Lançamentos vinculados" do modal "Detalhes da Obra", também mostrar os comprovantes/anexos de cada lançamento, igual à lista principal.
    - **Implementado**: nova coluna "Anexo" na tabela desktop (`#obraDetTbody`) com o selo clicável 📎 N (`attach-badge`, mesmo de `render()`), abrindo `openFileView(id)`. Nos cards mobile (`#obraDetCards`), o mesmo selo aparece nas tags do lançamento, clicável com `stopPropagation` (não abre o formulário de edição). `min-width` da `.od-table` ajustado de 620px para 690px para acomodar a coluna nova.

21. **Sessão 13/06/2026 (sessão 7, parte 4) — Fontes pagadoras agora persistem no banco:**
    - **Bug**: em Configurações → Fontes de Pagamento, ao adicionar uma nova fonte pagadora e salvar, a mudança só era gravada em `localStorage` (`c7_fontes_<tenant>`). Limpando o cache do navegador, `FONTES` voltava a vir de `/api/public-config` (que lê `tenant_settings.fontes`, nunca atualizado) e a fonte nova desaparecia.
    - **Correção**: novo endpoint `PUT /api/settings` (`lib/requireUser.js` + `api/settings.js`) — Financeiro (ou Dev) autenticado grava `fontes` em `tenant_settings` do próprio parceiro. `saveSettings()` agora é assíncrona: em modo online, chama `/api/settings` com o token da sessão antes de aplicar a mudança; se falhar, mostra erro e não altera nada. Modo LOCAL/demo continua só em `localStorage`, sem chamada de rede.
    - **Fora do escopo (notado para depois)**: a migração de lançamentos quando uma fonte é renomeada (já existia, não persiste o novo nome em `lancamentos.fonte` no banco) e os Centros de Custo (`CC_DEFS`, mesmo problema de só-localStorage, mas `tenant_settings` não tem coluna para isso ainda) seguem com a mesma limitação — não fazem parte deste fix, que tratou especificamente "fonte pagadora".

20. **Sessão 13/06/2026 (sessão 7, parte 3) — Tabela "Lançamentos vinculados" responsiva no detalhe da obra:**
    - **Bug**: no modal "Detalhes da Obra" em mobile, a tabela `.od-table` (colunas Fornecedor/Referência sem largura fixa) ficava espremida a quase 0px, fazendo `word-break:break-word` quebrar cada caractere numa linha — texto vertical ilegível e colunas "Valor total"/"Rateado" somem da tela.
    - **Correção**: adicionado `id="obraDetTableWrap"` ao wrapper da tabela e um novo container `<div class="mobile-cards" id="obraDetCards">`. Em `@media(max-width:768px)`, `#obraDetTableWrap{display:none}` esconde a tabela e `.mobile-cards{display:flex}` (regra já existente) mostra os cards. `openObraDetail()` agora também popula `#obraDetCards` reaproveitando o padrão `.lrow`/`.lrows-wrap` da lista principal (mesma bolinha colorida por fonte via `fonteKpiColor`, fornecedor, referência, badge de centro de custo, código/fonte, valor rateado em destaque, data, e tag "Total: R$ X" quando o rateado difere do valor total do lançamento).
    - Revisão geral de responsividade (dashboard, KPIs, gráfico, lista de lançamentos, modais "Novo lançamento", "Gerenciar obras" e "Configurações") em viewport mobile (390px): tudo renderiza corretamente, nenhum outro ponto quebrado encontrado.

19. **Sessão 13/06/2026 (sessão 7, parte 2) — Fontes pagadoras dinâmicas nos resultados:**
    - **Bug**: ao cadastrar uma 3ª fonte pagadora (Configurações → Fontes Pagadoras), ela não aparecia nos cards "Pago por X" nem no gráfico de pizza "Por fonte pagadora" — só as duas primeiras (`FA`/`FB`) eram exibidas, e o card "Total investido" nem somava os lançamentos dessa 3ª fonte.
    - **Correção**: `totals()` agora soma o valor de TODOS os lançamentos filtrados (`Total investido` correto independente da fonte) e calcula `porFonte`, um total por cada fonte cadastrada. `renderKpis()`, `renderDonut()`/legenda e `openObraDetail()` agora geram um card/segmento **para cada fonte de `FONTES`**, com cores de uma paleta (`FONTE_HEX`/`fonteKpiColor` — as 2 primeiras seguem o tema teal/ochre, demais usam cores fixas). Exportação CSV ("RESUMO INVESTIDORES") também lista todas as fontes. Grids `.kpis`/`.od-kpis` trocados para `auto-fit` para acomodar qualquer quantidade de cards.
    - **Mantido**: "Acerto 50/50" continua comparando só as duas primeiras fontes (`FA`/`FB`), como já documentado ("as duas primeiras são usadas no acerto financeiro").

18. **Sessão 13/06/2026 (sessão 7) — Publicação ao vivo e correção de colunas faltando no banco:**
    - **Botão de tema claro/escuro**: adicionado no cabeçalho (desktop) e no menu (mobile); preferência salva em `localStorage` (`xjbr_theme`), com fallback para `prefers-color-scheme`.
    - **Login do Dev**: `api/login.js` agora usa `DEV_PASS.trim()` para tolerar espaço/quebra de linha no valor da variável de ambiente.
    - **Deploy travado na Vercel (causa raiz)**: o commit `089996e` tinha e-mail de autor (`xjbr@xjbr.com.br`) não vinculado à conta GitHub — a Vercel bloqueia (silenciosamente, até em deploys via CLI) qualquer deploy baseado num commit assim. Corrigido o `git config user.email` para o e-mail verificado no GitHub (`rivaldolvjr@gmail.com`) e criado um commit vazio com o e-mail correto para destravar o deploy. Site agora publicado e ao vivo.
    - **Bug: erro ao salvar lançamento** (`Could not find the 'rateio' column of 'lancamentos' in the schema cache`): o campo `rateio` (rateio manual por obra, sessão 15) era enviado ao Supabase mas a coluna nunca existiu na tabela `lancamentos`. Adicionada `rateio jsonb` em `supabase/schema.sql` (+ `alter table ... add column if not exists` para bancos existentes) e ajustado `reload()` em `index.html` para ler `l.rateio` de volta.
    - **Bug latente equivalente em `obras`**: `archived`/`ended_at` (sessão "Arquivar obras") também nunca existiram na tabela `obras` nem eram lidos no `reload()` — mesma classe de erro ocorreria ao arquivar uma obra em modo online. Corrigido da mesma forma (colunas + `alter table` + leitura no `reload()`).
    - **Ação pendente do usuário**: rodar o `supabase/schema.sql` atualizado no SQL Editor do Supabase (idempotente, seguro rodar de novo) para criar as 3 colunas novas no banco em produção.

17. **Sessão 12/06/2026 (sessão 6) — Reescrita completa de segurança:**
    - **Problema identificado**: `config.js` era um arquivo estático público que expunha `DEV_PASS`, `PASS_FINANCEIRO` e `PASS_VIEWER` em texto puro — qualquer visitante podia logar como `dev@xjbr.local` (acesso total cross-tenant, ignorando RLS).
    - **Solução**: backend serverless `/api` na Vercel; segredos (chave `service_role`, `DEV_PASS`, senhas internas) só em variáveis de ambiente, nunca em arquivo do site.
    - **Nova tabela `tenant_settings`** (RLS habilitado, zero políticas = só `service_role`) guarda a configuração e os hashes de senha de cada parceiro.
    - `config.js` **removido**; novo endpoint `/api/public-config` substitui o `<script src="config.js">` e devolve apenas a chave pública `anon` + a lista de parceiros.
    - `/api/login`: verifica a senha no servidor (bcrypt) e devolve tokens de sessão (`sb.auth.setSession()`).
    - **Painel Dev** agora persiste parceiros no banco via `/api/admin/tenants` (GET/POST/PUT/DELETE, protegido por Bearer token do Dev).
    - `/api/admin/bootstrap`: inicialização única (cria o 1º parceiro + a conta Dev), autodesativa-se após o primeiro uso (`_bootstrap_lock`).
    - Modo **LOCAL/demo** preservado como fallback offline (`LOCAL_FALLBACK_CONFIG`, senhas fixas `dev-master`/`classe7`/`ver123`) — não protege dado real algum.
    - `package.json` criado (`@supabase/supabase-js`, `bcryptjs`); `.gitignore` e `vercel.json` atualizados; toda a documentação (README, GUIA_DE_INSTALACAO, DASHBOARD) revisada.

16. **Sessão 07/06/2026 (parte 3) — Visualizador vê Valor Total e Rateado no detalhe da obra:**
    - Corrigida a regra `body.viewer ... td:last-child` que escondia a última coluna de **todas** as tabelas: agora escopada a `.tablewrap` (só a tabela principal de lançamentos), preservando a coluna **Rateado** na tabela do detalhe da obra (`.od-table`)
    - Visualizador agora enxerga **Valor total** e **Rateado** ao abrir os custos de uma obra; as ações de editar/excluir, o botão "Novo lançamento" e demais controles de escrita continuam ocultos para o Visualizador (verificado no navegador)

15. **Sessão 07/06/2026 (parte 2) — Rateio manual por obra:**
    - **Novo campo `rateio`** no lançamento: objeto `{obraId: valor}`, salvo junto com o lançamento; `null` quando divisão igual
    - **Função `valorParaObra(l, obraId)`**: centraliza o cálculo do valor de uma obra em qualquer lançamento — usa `rateio` se existir, senão divide igual
    - **UI no formulário**: toggle "⚖ Divisão igual / ✏ Manual por obra" aparece assim que ao menos uma obra é selecionada; modo manual exibe um input por obra pré-preenchido com a divisão igual; contador mostra soma vs. total em verde (ok) ou vermelho (diverge); borda vermelha nos inputs enquanto não fechar
    - **Validação no save**: bloqueia salvamento com toast se soma do rateio manual ≠ valor total
    - **Relatórios atualizados**: `obraTotals()`, `openObraDetail()` e tabela do detalhe de obra usam `valorParaObra()` — valores reais do rateio refletem em KPIs, barras e painel por CC
    - **Retrocompatibilidade**: lançamentos antigos sem campo `rateio` continuam funcionando com divisão igual implícita

14. **Sessão 07/06/2026 — Mobile, Dev e tutorial de publicação:**
    - **Cards mobile enriquecidos**: cada card agora exibe fornecedor, referência (itálico), badge colorido do centro de custo, #ID · fonte, nome da obra, ícone de anexo e ⚠ sem obra em vermelho
    - **Tooltip lixeira de obra**: `title="Excluir obra"` adicionado, alinhado com o 📦 "Arquivar obra"
    - **Análise do painel Dev**: levantamento de 7 melhorias possíveis — nenhuma implementada nesta sessão (decidido aguardar)
    - **Decisão sobre senhas locais**: mantidas em texto puro apenas para testes; migração para Supabase Auth quando for ao ar
    - **Tutorial de publicação**: documento `TUTORIAL_COLOCAR_ONLINE.pdf` gerado — cobre GitHub + Supabase + Vercel + fluxo de deploy via Claude, com checklist, comparativo de custos e diagrama de arquitetura

13. **Sessão 06/06/2026 (parte 2) — Formatação, configurações e proteções:**
    - **Formato de moeda brasileiro**: todos os inputs de valor usam máscara R$ com `.` como separador de milhar e `,` como decimal (ex.: `R$ 1.500,75`); função `maskValor()` e `parseValor()` centralizadas
    - **Modal Configurações** (⚙): acessível apenas por Financeiro e Dev; botão no header e no menu mobile
    - **Fontes Pagadoras dinâmicas**: lista editável com add/remove; proteção contra remover fonte com lançamentos; migração automática de lançamentos ao renomear fonte
    - **Centros de Custo dinâmicos**: lista editável com ícone, nome, subtítulo, cor; add/remove; proteção contra remover CC com lançamentos; color picker reduzido (26×26px)
    - **CC_DEFS e FONTES centralizados**: todas as funções de render leem dos arrays globais; persistência em `localStorage` por tenant (`c7_fontes_<tenant>`, `c7_cc_<tenant>`)
    - **Badges de CC por cor inline**: `ccBgStyle()` retorna `background/color` inline; removidas classes CSS hardcoded por CC
    - **Filtros restaurados no desktop**: corrigido bug pós-refatoração mobile onde `.flt-panel.collapsed` ficava oculto no desktop
    - **Proteção de exclusão de obra**: `delObra()` bloqueia com toast se a obra tiver lançamentos vinculados (antes apenas pedia confirmação e prosseguia)
    - **Tooltip nas ações de obra**: 🗑 exibe "Excluir obra" ao passar o mouse (alinhado com 📦 "Arquivar obra" que já existia)
    - Função `unarchiveObra()` e botão ↩ Reativar já existiam e foram confirmados funcionando

---

## 9. Decisões tomadas (para não reabrir)

- **Backend recomendado:** Supabase (um único projeto para todos os clientes).
- **Login:** só senha (sem e-mail para o usuário).
- **Hospedagem:** Vercel + domínio próprio.
- **Endereço dos clientes:** por **pasta** (`xjbr.com.br/mpi`), não subdomínio.
- **Isolamento online:** um banco, dados isolados por cliente via RLS.
- **Logo:** sigla de texto (máx 4 chars) OU imagem em base64 (máx 500KB) — armazenada no registro do cliente (localStorage / Supabase).
- **Filtro de obras:** aparece automaticamente quando existe ao menos uma obra arquivada — não polui a UI antes de ser necessário.
- **Dev é o único que cria clientes** — Financeiro só gerencia obras e lançamentos do seu ambiente.
- **Credenciais sensíveis (sessão 6)**: nunca em arquivo estático do site. Vivem em variáveis de
  ambiente da Vercel (`SUPABASE_SERVICE_ROLE_KEY`, `DEV_PASS`, etc.) e em `tenant_settings`
  (RLS habilitado, zero políticas = só `service_role`), acessadas apenas pelas funções `/api`.

---

## 10. Próximos passos (quando retomar)

### Funcionalidades pendentes discutidas mas não implementadas
- [ ] Nenhuma pendente no momento. Todas as solicitações das sessões 1 e 2 foram concluídas.

### Para publicar (sair do modo local para o online)
Seguir o **`GUIA_DE_INSTALACAO.md`** (4 etapas):
1. Criar projeto no **Supabase** (região São Paulo) e rodar **`supabase/schema.sql`** no SQL Editor
   — já cria `tenant_settings`, RLS e o bucket `comprovantes`.
   - **Atenção:** o schema ainda não tem as colunas `archived` e `ended_at` na tabela `obras`. Adicionar antes de rodar:
     ```sql
     alter table public.obras add column if not exists archived boolean default false;
     alter table public.obras add column if not exists ended_at date;
     ```
2. Configurar as **variáveis de ambiente** na Vercel: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `DEV_PASS`, `DEFAULT_TENANT` e (opcional) `BOOTSTRAP_TOKEN`.
3. Publicar o projeto na **Vercel** e ligar o domínio `www.xjbr.com.br`.
4. Rodar o **bootstrap** (`POST /api/admin/bootstrap`) uma única vez para criar o(s) primeiro(s)
   parceiro(s) (Financeiro/Visualizador) e a conta Dev — não há mais usuários/senhas pré-criados manualmente.

### Pendências combinadas / sugestões
- [ ] **Trocar as senhas de exemplo** por senhas reais antes de publicar.
- [ ] Definir os **clientes reais** (nomes, logos, fontes, senhas).
- [ ] Remover o cliente de exemplo `construtorax` se não for usar.
- [ ] (Quando publicar) habilitar **Realtime** no Supabase.
- [ ] Investigar por que os modais não abriam no navegador do usuário (suspeita: cache do navegador ou extensão interferindo). Solução aplicada: remover backdrop-filter e animação. Se ainda ocorrer, verificar console F12.

---

## 11. Observações técnicas (para quem for mexer no código)

- Modo detectado por `LOCAL = !sb` (sem Supabase configurado → local com `localStorage`).
- Parceiro/cliente vem da URL: `resolveTenantSlug()` (1º trecho do caminho, ou `?t=slug`, ou `DEFAULT_TENANT`).
- Registro de clientes: em modo ONLINE vem de `PUBLIC_TENANTS`, preenchido por `/api/public-config`
  (lê `tenant_settings` no banco). Em modo LOCAL, `loadTenantRegistry()` = `LOCAL_FALLBACK_CONFIG.tenants`
  + ajustes do Dev (`xjbr_tenants_v1` / `xjbr_tenants_removed` no localStorage).
- **Fontes pagadoras**: array global `FONTES`; `FA=FONTES[0]`, `FB=FONTES[1]`; editável no modal Configurações; persistido em `c7_fontes_<tenant>`.
- **Rateio por obra**: campo `rateio` no lançamento (`{obraId: valor}` ou `null`). Função `valorParaObra(l, obraId)` usada em todos os cálculos. Variáveis globais no formulário: `rateioMode` ('igual'|'manual') e `curRateio` (objeto temporário).
- **Centros de custo**: array global `CC_DEFS` (termina com sentinel `{key:'',label:'Sem categoria'}`); editável no modal Configurações; persistido em `c7_cc_<tenant>`; helpers: `ccLabel(key)`, `ccColor(key)`, `ccBgStyle(key)`.
- Dados locais por cliente: chave `xjbr_state_<slug>`.
- Permissão de escrita: `canWrite()` = Financeiro ou Dev.
- **Filtro de obras**: variável global `obraFilter` ('ativas'|'arquivadas'|'todas'). Funções `getFilteredObras()` e `getFilteredLancamentos()` retornam a view filtrada. Variáveis `viewObras` e `viewLancs` são atualizadas no início de `render()` e usadas por `totals()`, `obraTotals()`, `renderCCReport()` e a tabela de lançamentos.
- **Arquivar obras**: campo `archived: boolean` e `ended_at: date` no objeto de obra (localStorage). Online precisa das colunas no Supabase (ver seção 10).
- **Logo por cliente**: salva em `tcfg.logo = {type: 'sigla'|'image', value: string}`. Renderizada por `applyLogoEl()` no header e na tela de login.
- Online: tabelas `obras`/`lancamentos` têm coluna `tenant`; isolamento por RLS via `user_tenant()`/`user_role()`.
- Comprovantes online: bucket `comprovantes`, arquivos na pasta `<tenant>/`.
