# Guia de Instalação e Publicação — Sistema Classe 7

Este guia leva o sistema do seu computador até a internet, no seu domínio.
Não precisa saber programar. São **3 etapas**:

1. **Banco de dados** (Supabase) — onde ficam os lançamentos e os comprovantes
2. **Configurar** o sistema (preencher o `config.js`)
3. **Publicar** o site (Vercel) e ligar o seu domínio

> ⏱️ Tempo estimado: 30 a 45 minutos. Tudo o que usamos aqui tem **plano gratuito**.

---

## 📁 Arquivos do projeto

| Arquivo | Para que serve |
|---|---|
| `index.html` | O sistema em si (a tela que todos vão usar) |
| `config.js` | Onde você cola as chaves do seu banco |
| `supabase/schema.sql` | O "molde" do banco — você roda uma vez no Supabase |
| `GUIA_DE_INSTALACAO.md` | Este guia |
| `DASHBOARD_CLASSE7_DOCUMENTACAO.md` | Manual de uso das funcionalidades |

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
   > Isso cria as tabelas `obras`, `lancamentos`, `profiles`, as regras de segurança e o local dos comprovantes (`comprovantes`).

## 1.3 Criar os dois usuários (Financeiro e Visualizador)
1. No menu lateral, abra **Authentication → Users**.
2. Clique em **Add user → Create new user**.
3. Crie o **Financeiro**:
   - **Email:** `financeiro@classe7.local`
   - **Password:** escolha a **senha do Financeiro** (a que dá acesso completo)
   - Marque **Auto Confirm User** (importante!)
   - Clique em **Create user**
4. Clique em **Add user** de novo e crie o **Visualizador**:
   - **Email:** `visualizador@classe7.local`
   - **Password:** escolha a **senha do Visualizador** (somente leitura) — **diferente** da anterior
   - Marque **Auto Confirm User**
   - **Create user**

> 💡 Essas senhas são as que as pessoas vão digitar na tela de login. Os e-mails são internos — ninguém precisa digitá-los.

## 1.4 Definir o papel de cada usuário
1. Volte em **SQL Editor → + New query**.
2. Cole e rode o bloco abaixo (ele liga cada e-mail ao seu papel):

```sql
insert into public.profiles (id, role)
select id, 'financeiro' from auth.users where email = 'financeiro@classe7.local'
on conflict (id) do update set role = excluded.role;

insert into public.profiles (id, role)
select id, 'viewer' from auth.users where email = 'visualizador@classe7.local'
on conflict (id) do update set role = excluded.role;
```
3. Deve aparecer **Success**.

## 1.5 Ligar a atualização em tempo real (opcional, recomendado)
Para que as telas se atualizem sozinhas quando alguém lança algo:
1. Menu lateral → **Database → Replication** (em algumas versões: **Realtime**).
2. Na publicação **supabase_realtime**, marque as tabelas **`lancamentos`** e **`obras`**.
3. Salve. (Se não achar essa tela, pode pular — o sistema funciona mesmo assim, só não atualiza sozinho.)

## 1.6 Copiar as chaves do projeto
1. Menu lateral → **Project Settings (engrenagem) → API**.
2. Anote dois valores:
   - **Project URL** (ex.: `https://abcdefgh.supabase.co`)
   - **Project API keys → `anon` `public`** (uma chave longa)

> A chave `anon` é pública — pode ficar no site. **Nunca** use a chave `service_role`.

---

# ETAPA 2 — Configurar o sistema

1. Abra o arquivo **`config.js`** num editor de texto (Bloco de Notas serve).
2. Substitua os dois valores pelos que você copiou no passo 1.6:

```js
window.C7_CONFIG = {
  SUPABASE_URL: "https://abcdefgh.supabase.co",   // <-- seu Project URL
  SUPABASE_ANON_KEY: "eyJhbGciOi...sua-chave...",  // <-- sua chave anon
  EMAIL_FINANCEIRO: "financeiro@classe7.local",
  EMAIL_VIEWER:     "visualizador@classe7.local"
};
```
3. **Salve** o arquivo. (Se mudou os e-mails no passo 1.3, ajuste aqui também.)

### Testar no seu computador (recomendado antes de publicar)
- Dê **duplo clique** no `index.html` para abrir no navegador.
- Digite a **senha do Financeiro** → deve entrar.
- Como o banco está vazio, aparece o botão **"Importar dados iniciais"** — clique para carregar as 6 casas e os lançamentos históricos.
- Teste adicionar um lançamento com um comprovante (foto/PDF) e abra o anexo.

> Se aparecer "Sistema não configurado", revise o `config.js`.

---

# ETAPA 3 — Publicar na internet (Vercel) + domínio

## 3.1 Subir o site
1. Acesse **https://vercel.com** e crie conta (pode usar Google/GitHub).
2. No painel, clique em **Add New… → Project**.
3. A forma mais simples sem GitHub: instale o app de linha de comando ou use o **"Deploy"** por upload.
   **Caminho recomendado (com GitHub):**
   - Crie um repositório no GitHub e suba a pasta do projeto (os arquivos `index.html`, `config.js` e a pasta `supabase`).
   - Na Vercel, **Import** esse repositório e clique em **Deploy**.
   - Em ~1 minuto o site fica no ar num endereço tipo `classe7.vercel.app`.

   > **Não tem/usa GitHub?** Me avise que eu te passo o passo a passo do upload direto (Vercel CLI) — é só rodar um comando.

## 3.2 Ligar o seu domínio
1. Na Vercel, abra o projeto → **Settings → Domains**.
2. Digite seu domínio (ex.: `custos.seudominio.com.br` ou o domínio raiz) e clique em **Add**.
3. A Vercel mostra os registros de **DNS** (um CNAME ou A) para configurar.
4. Entre no painel onde você comprou o domínio e **adicione esses registros de DNS**.
5. Aguarde a propagação (de minutos a algumas horas). O **HTTPS (cadeado)** é ativado automaticamente.

✅ Pronto: seu sistema está no ar, no seu domínio, com login por senha e dados na nuvem.

---

# Vários parceiros / centros de custo (multi-ambiente)

O sistema atende **vários parceiros** no mesmo domínio, cada um pelo seu caminho:
`www.xjbr.com.br/mpi`, `www.xjbr.com.br/construtorax`, etc. Cada ambiente tem
**dados, relatórios e senhas próprios e isolados** — um não enxerga o outro.

> O arquivo `vercel.json` (já incluído) faz esses caminhos abrirem o sistema. Não precisa mexer.

### Como funciona
- O sistema descobre o parceiro pelo **caminho da URL** (`/mpi` → parceiro `mpi`).
- Cada parceiro é configurado em `config.js`, dentro de **`TENANTS`**.
- As duas **fontes pagadoras** de cada parceiro são configuráveis (ex.: `XJBR × MPI`, `XJBR × Construtora X`).

### Criar um novo parceiro (ex.: "construtorax")
1. **No `config.js`**, dentro de `TENANTS`, adicione um bloco (copie o do `mpi`):
   ```js
   "construtorax": {
     nome: "Construtora X",
     fontes: ["XJBR", "Construtora X"],
     PASS_FINANCEIRO: "uma-senha-forte",
     PASS_VIEWER: "outra-senha"
   }
   ```
   A **chave** (`construtorax`) é o que vai na URL: `www.xjbr.com.br/construtorax`.

2. **No modo ONLINE**, crie as 2 contas desse parceiro em **Authentication → Users**
   (marque *Auto Confirm*), com este padrão de e-mail:
   - `financeiro@construtorax.xjbr.local`
   - `visualizador@construtorax.xjbr.local`
   E rode no **SQL Editor** (liga as contas ao parceiro):
   ```sql
   insert into public.profiles (id, role, tenant)
   select id, 'financeiro', 'construtorax' from auth.users where email='financeiro@construtorax.xjbr.local'
   on conflict (id) do update set role=excluded.role, tenant=excluded.tenant;

   insert into public.profiles (id, role, tenant)
   select id, 'viewer', 'construtorax' from auth.users where email='visualizador@construtorax.xjbr.local'
   on conflict (id) do update set role=excluded.role, tenant=excluded.tenant;
   ```
3. **Publique de novo** (novo deploy na Vercel). Pronto: `www.xjbr.com.br/construtorax` já funciona, isolado.

> 💡 No **modo local** (sem Supabase), criar o parceiro é só o passo 1. Para testar um parceiro
> específico no seu computador, abra com `?t=` no fim do endereço, ex.: `index.html?t=construtorax`.

> ⚠️ A chave do parceiro deve ter só letras minúsculas/números (sem espaços nem acentos): `mpi`, `construtorax`, `obra2`.

---

# Usuário Dev (super-administrador)

Existe um login **Dev** com poderes totais. A senha fica no `config.js` em **`DEV_PASS`**
(troque por uma senha forte). O Dev pode entrar em **qualquer** ambiente e enxerga um
botão **🛠 Admin** no topo, que abre o **Painel do Desenvolvedor**. Lá ele pode:

- **Criar** novos parceiros (nome, fontes pagadoras e senhas) — sem editar arquivos
- **Editar** parceiros existentes (nome, fontes, senhas)
- **Abrir** qualquer ambiente
- **Limpar** os dados de um parceiro
- **Remover** um parceiro da lista

Além disso, o Dev tem todos os poderes de edição (criar/editar/excluir lançamentos e obras).

> **Modo online:** crie a conta `dev@xjbr.local` (Auth → Users, *Auto Confirm*) com a senha
> do Dev e rode o bloco "USUÁRIO DEV" do `supabase/schema.sql`. Aí o Dev acessa todos os
> parceiros no banco. (No modo local, basta a `DEV_PASS` no `config.js`.)

> 🔒 Guarde a senha do Dev com cuidado — ela dá acesso a tudo.

---

# Depois de publicado

### Trocar uma senha
**Authentication → Users** → clique no usuário → **Reset / Update password**.

### Adicionar/remover quem tem acesso
Crie um novo usuário (passo 1.3) e defina o papel (passo 1.4). Para revogar, exclua o usuário em **Authentication → Users**.

### Backup
Dentro do sistema, use **⤓ Backup** de tempos em tempos para baixar um JSON de segurança. O banco do Supabase também mantém backups automáticos no plano pago.

### Atualizar o sistema
Se eu enviar uma nova versão do `index.html`, basta substituir o arquivo e publicar de novo (na Vercel, um novo deploy). O `config.js` e o banco permanecem.

---

# Problemas comuns

| Sintoma | Solução |
|---|---|
| "Sistema não configurado" na tela de login | `config.js` sem URL/chave corretas (Etapa 2) |
| "Senha incorreta" mesmo com a senha certa | O usuário não foi criado com **Auto Confirm**, ou faltou rodar o passo 1.4 (papéis) |
| Entra, mas não consigo salvar (sendo Financeiro) | Faltou o passo 1.4 para o e-mail do Financeiro |
| Não consigo ver os comprovantes | Verifique se o bucket `comprovantes` existe (o schema cria) e se rodou o schema completo |
| Telas não atualizam sozinhas entre usuários | Habilite o Realtime (passo 1.5) — opcional |

> Qualquer dúvida em qualquer passo, me chame que eu te oriento na hora da publicação.
