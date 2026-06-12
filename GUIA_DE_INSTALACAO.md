# Guia de Instalação e Publicação — Sistema Classe 7

Este guia leva o sistema do seu computador até a internet, no seu domínio.
São **4 etapas**:

1. **Banco de dados** (Supabase) — onde ficam os lançamentos, comprovantes e as configurações de cada parceiro
2. **Variáveis de ambiente** (Vercel) — chaves e senhas, fora do código-fonte
3. **Publicar** o site (Vercel) e ligar o seu domínio
4. **Inicializar** o sistema (criar o primeiro parceiro e a conta Dev)

> ⏱️ Tempo estimado: 30 a 45 minutos. Tudo o que usamos aqui tem **plano gratuito**.

---

## 📁 Arquivos do projeto

| Arquivo / pasta | Para que serve |
|---|---|
| `index.html` | O sistema em si (a tela que todos vão usar) |
| `api/` | Funções do servidor: login, configuração pública e administração de parceiros |
| `lib/` | Funções auxiliares usadas pelas funções de `api/` |
| `supabase/schema.sql` | O "molde" do banco — você roda uma vez no Supabase |
| `vercel.json` | Roteamento dos endereços `/mpi`, `/construtorax`, etc. |
| `GUIA_DE_INSTALACAO.md` | Este guia |
| `DASHBOARD_CLASSE7_DOCUMENTACAO.md` | Manual de uso das funcionalidades |

> 🔒 **Não existe mais `config.js`.** Nenhuma chave, senha ou hash fica no
> código do site. Tudo o que é sensível mora em **variáveis de ambiente** na
> Vercel (Etapa 2) e só é lido pelas funções do servidor em `api/`.

---

# ETAPA 1 — Banco de dados (Supabase)

## 1.1 Criar a conta e o projeto
1. Acesse **https://supabase.com** e clique em **Start your project** (pode entrar com o Google/GitHub).
2. Clique em **New project**.
3. Preencha:
   - **Name:** `classe7` (ou o que preferir)
   - **Database Password:** crie uma senha forte e **guarde** (é a senha do banco, não do sistema)
   - **Region:** escolha **South America (São Paulo)** — mais rápido no Brasil
4. Clique em **Create new project** e aguarde ~2 minutos enquanto ele é criado.

## 1.2 Criar as tabelas (rodar o schema)
1. No menu lateral, abra **SQL Editor**.
2. Clique em **+ New query**.
3. Abra o arquivo `supabase/schema.sql` (no seu computador), **copie todo o conteúdo** e cole na caixa.
4. Clique em **Run** (ou `Ctrl+Enter`). Deve aparecer **Success**.
   > Isso cria as tabelas `obras`, `lancamentos`, `profiles`, `tenant_settings`, as regras de segurança (RLS) e o local dos comprovantes (`comprovantes`).

## 1.3 Usuários (Financeiro, Visualizador, Dev)
Você **não precisa criar usuários aqui**. As contas de cada parceiro
(Financeiro/Visualizador) e a conta Dev são criadas automaticamente pelo
sistema na **Etapa 4 (Inicializar)**, a partir das senhas que você escolher
naquele passo.

## 1.4 Ligar a atualização em tempo real (opcional, recomendado)
Para que as telas se atualizem sozinhas quando alguém lança algo:
1. Menu lateral → **Database → Replication** (em algumas versões: **Realtime**).
2. Na publicação **supabase_realtime**, marque as tabelas **`lancamentos`** e **`obras`**.
3. Salve. (Se não achar essa tela, pode pular — o sistema funciona mesmo assim, só não atualiza sozinho.)

## 1.5 Copiar as chaves do projeto
1. Menu lateral → **Project Settings (engrenagem) → API**.
2. Anote **três** valores — você vai usar na Etapa 2:
   - **Project URL** (ex.: `https://abcdefgh.supabase.co`)
   - **Project API keys → `anon` `public`** (uma chave longa)
   - **Project API keys → `service_role`** (outra chave longa, **secreta**)

> ⚠️ A chave **`service_role`** dá acesso total ao banco, ignorando as
> regras de segurança. Ela **nunca** vai para o navegador nem para o
> código do site — só para a variável de ambiente da Vercel (Etapa 2).
> A chave `anon` é pública e segura para ficar no navegador (a RLS protege os dados).

---

# ETAPA 2 — Variáveis de ambiente (Vercel)

As chaves e senhas do sistema ficam guardadas na própria Vercel, fora do
código. Para configurar:

1. Crie sua conta em **https://vercel.com** (pode usar Google/GitHub) — se ainda não publicou o projeto, pode importar o repositório (Etapa 3) e voltar aqui para criar as variáveis.
2. No projeto, abra **Settings → Environment Variables**.
3. Adicione cada uma das variáveis abaixo (ambiente **Production** — marque também **Preview**/**Development** se for testar):

| Variável | Valor | Onde conseguir |
|---|---|---|
| `SUPABASE_URL` | Project URL | Supabase → Project Settings → API |
| `SUPABASE_ANON_KEY` | chave `anon` `public` | idem |
| `SUPABASE_SERVICE_ROLE_KEY` | chave `service_role` | idem — **nunca compartilhe** |
| `DEV_PASS` | uma senha forte, escolhida por você | senha do super-administrador (Dev) |
| `DEFAULT_TENANT` | ex.: `mpi` | chave (slug) do parceiro padrão |
| `BOOTSTRAP_TOKEN` *(opcional)* | uma string aleatória, escolhida por você | trava extra para a Etapa 4; pode remover depois |

4. Clique em **Save**.

> 💡 Essas variáveis nunca aparecem no código nem no navegador — só as
> funções em `api/` (executadas no servidor da Vercel) têm acesso a elas.
> Se mudar alguma depois, é preciso fazer um novo deploy (ou usar
> **Redeploy** no painel da Vercel) para o valor entrar em vigor.

---

# ETAPA 3 — Publicar na internet (Vercel) + domínio

## 3.1 Subir o site
1. Acesse **https://vercel.com** e crie conta (pode usar Google/GitHub).
2. No painel, clique em **Add New… → Project**.
3. **Caminho recomendado (com GitHub):**
   - Crie um repositório no GitHub e suba a pasta do projeto (`index.html`, `api/`, `lib/`, `supabase/`, `package.json`, `vercel.json` etc.).
   - Na Vercel, **Import** esse repositório.
   - Confirme/ajuste as variáveis de ambiente (Etapa 2) e clique em **Deploy**.
   - Em ~1 minuto o site fica no ar num endereço tipo `classe7.vercel.app`.

   > **Não tem/usa GitHub?** Me avise que eu te passo o passo a passo do upload direto (Vercel CLI) — é só rodar um comando.

## 3.2 Ligar o seu domínio
1. Na Vercel, abra o projeto → **Settings → Domains**.
2. Digite seu domínio (ex.: `www.xjbr.com.br` ou o domínio raiz) e clique em **Add**.
3. A Vercel mostra os registros de **DNS** (um CNAME ou A) para configurar.
4. Entre no painel onde você comprou o domínio e **adicione esses registros de DNS**.
5. Aguarde a propagação (de minutos a algumas horas). O **HTTPS (cadeado)** é ativado automaticamente.

---

# ETAPA 4 — Inicializar o sistema (bootstrap)

Esse passo cria, de uma vez só, o **primeiro parceiro** (ex.: `mpi`) e a
**conta Dev**. É **único** — depois de feito uma vez, o sistema se recusa a
fazer de novo (mesmo que alguém tente).

1. Escolha as senhas do(s) parceiro(s) iniciais (Financeiro e Visualizador, diferentes entre si).
2. Faça **uma única chamada** `POST` para `/api/admin/bootstrap` do seu site publicado. Pode usar o terminal (Windows: PowerShell; Mac/Linux: Terminal) com `curl`:

```bash
curl -X POST https://SEU-DOMINIO/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: SUA_BOOTSTRAP_TOKEN_SE_TIVER" \
  -d '{
    "tenants": [
      {
        "slug": "mpi",
        "nome": "MPI",
        "fontes": ["XJBR", "MPI"],
        "passFinanceiro": "senha-forte-financeiro",
        "passViewer": "senha-forte-leitura"
      }
    ]
  }'
```

   - Troque `SEU-DOMINIO` pelo endereço do seu site (ex.: `classe7.vercel.app` ou `www.xjbr.com.br`).
   - A linha `-H "x-bootstrap-token: ..."` só é necessária se você definiu `BOOTSTRAP_TOKEN` na Etapa 2 — se não definiu, pode remover essa linha.
   - Pode incluir mais de um parceiro no array `tenants` desde já, ou adicionar os demais depois pelo **Painel do Desenvolvedor** (veja a seção "Vários parceiros" abaixo).

3. Uma resposta `{"ok":true,"tenants":["mpi"],"dev":true}` confirma que deu certo.
4. **Teste**: acesse `https://SEU-DOMINIO/mpi`, entre com a senha do Financeiro (ou Visualizador, ou a `DEV_PASS` da Etapa 2) e confira que o sistema carrega.
5. Se quiser, agora remova a variável `BOOTSTRAP_TOKEN` da Vercel (não é mais necessária).

> ⚠️ Se a resposta for `{"error":"Sistema já inicializado"}`, o bootstrap já
> foi feito antes — use o **Painel do Desenvolvedor** (🛠 Admin, login com a
> `DEV_PASS`) para criar novos parceiros ou trocar senhas.

> 🛠️ Se o bootstrap **falhar no meio do caminho** (erro 500 com
> `tenantsCreated`), abra o **SQL Editor** do Supabase e confira as tabelas
> `tenant_settings` e `auth.users` — pode finalizar manualmente ou apagar as
> linhas `_bootstrap_lock`/`_dev` e os registros parciais para tentar de novo.

✅ Pronto: seu sistema está no ar, no seu domínio, com login por senha e dados na nuvem.

---

# Vários parceiros / centros de custo (multi-ambiente)

O sistema atende **vários parceiros** no mesmo domínio, cada um pelo seu caminho:
`www.xjbr.com.br/mpi`, `www.xjbr.com.br/construtorax`, etc. Cada ambiente tem
**dados, relatórios e senhas próprios e isolados** — um não enxerga o outro.

> O arquivo `vercel.json` (já incluído) faz esses caminhos abrirem o sistema. Não precisa mexer.

### Como funciona
- O sistema descobre o parceiro pelo **caminho da URL** (`/mpi` → parceiro `mpi`).
- A lista de parceiros, nomes, fontes pagadoras e logos vem do banco (`tenant_settings`), servida por `/api/public-config`.
- As duas **fontes pagadoras** de cada parceiro são configuráveis (ex.: `XJBR × MPI`, `XJBR × Construtora X`).

### Criar um novo parceiro (ex.: "construtorax")
1. Acesse o sistema e entre com a **senha do Dev** (`DEV_PASS`).
2. Clique em **🛠 Admin** no topo — abre o **Painel do Desenvolvedor**.
3. No formulário **Novo cliente**, preencha:
   - **Chave** (vai na URL, ex.: `construtorax`) — só letras minúsculas/números, sem espaços nem acentos
   - **Nome**, **Logo** (sigla ou imagem) e as duas **fontes pagadoras**
   - **Senha Financeiro** e **Senha Visualizador** (obrigatórias para um cliente novo)
4. Clique em **＋ Salvar cliente**.

Pronto — `www.xjbr.com.br/construtorax` já funciona, isolado, sem precisar de
novo deploy nem de editar nada no Supabase manualmente. As contas
(Financeiro/Visualizador) e os registros em `tenant_settings` são criados
automaticamente pelo backend.

> 💡 Para **trocar senhas** de um parceiro existente, abra o Painel do
> Desenvolvedor, clique em **✎ Editar**, preencha apenas o(s) campo(s) de
> senha que quer alterar (deixe em branco o que não quer mudar) e **Salvar**.

> ⚠️ A chave do parceiro deve ter só letras minúsculas/números (sem espaços nem acentos): `mpi`, `construtorax`, `obra2`.

---

# Usuário Dev (super-administrador)

Existe um login **Dev** com poderes totais. A senha é a variável de ambiente
**`DEV_PASS`** (Etapa 2) — troque por uma senha forte e não a compartilhe. O
Dev pode entrar em **qualquer** ambiente e enxerga um botão **🛠 Admin** no
topo, que abre o **Painel do Desenvolvedor**. Lá ele pode:

- **Criar** novos parceiros (nome, logo, fontes pagadoras e senhas) — sem editar arquivos nem usar o SQL Editor
- **Editar** parceiros existentes (nome, logo, fontes, senhas)
- **Abrir** qualquer ambiente
- **Remover** um parceiro (os lançamentos e obras dele continuam guardados no banco)

Além disso, o Dev tem todos os poderes de edição (criar/editar/excluir lançamentos e obras).

> A conta `dev@xjbr.local` do Supabase Auth é criada automaticamente pela
> **Etapa 4 (bootstrap)** — você não precisa criar nem configurar nada
> manualmente. Quem souber a `DEV_PASS` entra como Dev em qualquer parceiro.

> 🔒 Guarde a `DEV_PASS` com cuidado — ela dá acesso a tudo. Para trocá-la,
> edite a variável de ambiente na Vercel e faça um novo deploy/redeploy.

---

# Depois de publicado

### Trocar a senha de um parceiro (Financeiro/Visualizador)
Entre como **Dev**, abra **🛠 Admin → ✎ Editar** no parceiro desejado,
preencha a nova senha no campo correspondente (deixe o outro em branco) e
**Salvar**. Não é mais necessário usar **Authentication → Users** no Supabase.

### Trocar a senha do Dev
Edite a variável de ambiente `DEV_PASS` na Vercel (**Settings → Environment
Variables**) e faça um **Redeploy**.

### Adicionar/remover parceiros
Use o **Painel do Desenvolvedor** (🛠 Admin) — ver seção "Vários parceiros" acima.

### Backup
Dentro do sistema, use **⤓ Backup** de tempos em tempos para baixar um JSON de segurança. O banco do Supabase também mantém backups automáticos no plano pago.

### Atualizar o sistema
Se eu enviar uma nova versão dos arquivos, basta substituir e publicar de novo
(novo deploy na Vercel). As variáveis de ambiente e os dados no Supabase
permanecem.

---

# Problemas comuns

| Sintoma | Solução |
|---|---|
| "Senha incorreta" mesmo com a senha certa | Confirme as variáveis `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` na Vercel; reabra o Painel Dev e troque a senha do parceiro (✎ Editar) para gerar novas credenciais |
| "Sistema já inicializado" ao chamar o bootstrap | A Etapa 4 já foi executada antes — crie novos parceiros pelo Painel do Desenvolvedor |
| Site abre em modo "offline/demo" (senhas `classe7`/`ver123`/`dev-master`) em produção | `/api/public-config` não respondeu — verifique os **Logs** da função na Vercel e se as variáveis `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` estão configuradas e um novo deploy foi feito |
| Entra, mas não consigo salvar (sendo Financeiro) | Confira no Supabase (Authentication → Users) se a conta `financeiro@<parceiro>.xjbr.local` existe e tem um registro em `profiles` com `role='financeiro'` — normalmente criado automaticamente pelo bootstrap/Admin |
| Não consigo ver os comprovantes | Verifique se o bucket `comprovantes` existe (o schema cria) e se rodou o schema completo |
| Telas não atualizam sozinhas entre usuários | Habilite o Realtime (Etapa 1.4) — opcional |

> Qualquer dúvida em qualquer passo, me chame que eu te oriento na hora da publicação.
