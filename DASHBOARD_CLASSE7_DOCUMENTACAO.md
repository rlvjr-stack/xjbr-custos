# Sistema de Controle de Custos de Obra — Classe 7

> **Arquivos principais:** `index.html` (aplicação) · `api/` (funções do servidor) · `supabase/schema.sql` (banco)
> **Tecnologia:** HTML + CSS + JavaScript · Chart.js 4.4.1 · **Supabase** (PostgreSQL + Storage + Auth)
> **Hospedagem recomendada:** Vercel (com domínio próprio + HTTPS)
> **Guia de publicação:** veja [`GUIA_DE_INSTALACAO.md`](GUIA_DE_INSTALACAO.md)

---

## Visão Geral

Sistema completo de controle de custos de obra para a **Construtora Classe 7**, desenvolvido para acompanhar e ratear despesas entre dois investidores (**XJBR** e **MPI**) em um empreendimento com até N casas (padrão: 6 casas).

O sistema é **online e multiusuário**: os dados (lançamentos, obras) ficam num banco **PostgreSQL** e os comprovantes (fotos/PDFs) num **storage de arquivos**, ambos no **Supabase**. Várias pessoas acessam o mesmo sistema pelo navegador, de qualquer dispositivo, e enxergam os mesmos dados em tempo real. O acesso continua sendo feito apenas por **senha** (dois perfis: Financeiro e Visualizador), agora com segurança real garantida pelo banco (Row Level Security).

---

## Estrutura da Tela

### Cabeçalho (Header fixo)
O cabeçalho permanece visível durante a rolagem e contém:

| Elemento | Descrição |
|---|---|
| Logo **C7** | Identidade visual da Construtora Classe 7 |
| Título | "Controle de Custos de Obra" |
| Subtítulo | "Construtora Classe 7 · XJBR × MPI" |
| Botão **⚙ Obras** | Abre o gerenciador de obras/casas |
| Botão **⤓ Excel** | Exporta todos os dados para CSV |
| Botão **⤓ Backup** | Exporta backup completo em JSON |
| Botão **⤒ Importar** | Importa backup JSON salvo anteriormente |
| Botão **＋ Novo lançamento** | Abre o formulário de novo lançamento |

---

## Módulos e Funcionalidades

### 1. KPIs (Indicadores Principais)

Quatro cards no topo da página, atualizados automaticamente a cada mudança nos dados:

| Card | Descrição |
|---|---|
| **Total investido** | Soma de todos os lançamentos + quantidade total de lançamentos |
| **Pago por XJBR** | Total pago pelo investidor XJBR + percentual do total |
| **Pago por MPI** | Total pago pelo investidor MPI + percentual do total |
| **Acerto 50/50** | Valor que o investidor devedor precisa aportar para equilibrar a participação; exibe "Equilibrado" quando estão iguais |

---

### 2. Painel — Gasto por Obra

Painel de barras horizontais mostrando o total gasto em cada casa/obra. As barras são **segmentadas por Centro de Custo**, com as seguintes cores:

| Cor | Centro de Custo |
|---|---|
| 🔵 Azul `#3F5FA8` | Obra (materiais de construção) |
| 🟣 Roxo `#6B3FA8` | Mão de Obra (serviços) |
| 🟢 Verde `#2E8C6A` | Documentação (taxas, alvarás, certidões) |
| ⚫ Cinza `#A0A8B4` | Sem categoria (lançamentos sem CC definido) |

- Passando o mouse sobre cada segmento, é exibido o valor exato daquele centro de custo na obra
- Lançamentos sem casa atribuída aparecem como **"Não alocado"** em vermelho
- A legenda fica no rodapé do painel
- **Clicar em uma barra** abre o **detalhe da obra**, com:
  - Indicadores de total gasto, pago por XJBR e por MPI
  - Painel **colorido "Gasto por centro de custo"** (Obra, Mão de Obra, Documentação, Sem categoria), com valor, percentual e barra de cada categoria
  - Tabela de todos os lançamentos vinculados à obra (ID, data, fonte, CC, fornecedor, referência, valor total e valor rateado), **adaptável à tela** (as colunas se ajustam e o texto quebra em linha, sem cortes)

---

### 3. Painel — Por Fonte Pagadora

Gráfico de **donut** (rosca) mostrando a divisão percentual entre XJBR e MPI:

- Cores: XJBR em verde-teal `#2E6E66`, MPI em ocre `#C9802B`
- Tooltip ao passar o mouse mostra o valor em R$
- Legenda abaixo do gráfico com os totais de cada investidor

---

### 4. Painel — Por Centro de Custo

Cards individuais para cada centro de custo, exibindo:

- Badge colorido com nome da categoria
- **Valor total** gasto naquela categoria
- **Percentual** do total geral
- Barra de progresso proporcional ao maior centro de custo
- Quantidade de lançamentos na categoria

Se houver lançamentos sem categoria atribuída, um card adicional "⚠ Sem categoria" é exibido em destaque.

**Centros de custo disponíveis:**

| Ícone | Nome | Uso |
|---|---|---|
| 🏗️ | **Obra** | Materiais de construção, insumos |
| 👷 | **Mão de Obra** | Serviços, medições de equipes |
| 📄 | **Documentação** | Alvarás, taxas, certidões, registros |

---

### 5. Tabela de Lançamentos

Tabela principal com todos os lançamentos, com as colunas:

| Coluna | Descrição |
|---|---|
| **ID** | Código sequencial fixo do lançamento (ex.: `#001`), para identificação rápida. Aparece também no título ao editar, na exportação e no detalhe da obra |
| **Data** | Data do comprovante (formato DD/MM/AAAA) |
| **Fonte** | Badge colorido: XJBR (verde) ou MPI (ocre) |
| **Centro de Custo** | Badge colorido da categoria da despesa |
| **Fornecedor** | Nome do fornecedor |
| **Referência** | Descrição da despesa (truncada em 140 caracteres) |
| **Casas (rateio)** | Chips mostrando cada casa e o valor rateado individualmente |
| **Anexo** | Selo **📎 N** clicável quando há comprovantes; abre o visualizador. Mostra **—** quando não há arquivos |
| **Valor** | Valor total do lançamento |
| **Ações** | Botões ✎ Editar e 🗑 Excluir |

#### Filtros da tabela

Quatro controles de filtragem disponíveis simultaneamente:

| Filtro | Opções |
|---|---|
| **Busca textual** | Pesquisa em tempo real por fornecedor ou descrição |
| **Fonte** | Todas as fontes / XJBR / MPI |
| **Centro de custo** | Todos / Obra / Mão de Obra / Documentação |
| **Obra** | Todas as obras / Casa individual |

O rodapé da tabela exibe a contagem de lançamentos visíveis e o **total filtrado em R$**.

---

### 6. Formulário de Lançamento (Modal)

Acessível pelo botão "＋ Novo lançamento" ou pelo ícone ✎ na tabela. Campos disponíveis:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| **Data do comprovante** | Date picker | Sim | Data padrão: hoje |
| **Valor total (R$)** | Numérico | Sim | Valor cheio; o rateio é calculado automaticamente |
| **Fonte pagadora** | Toggle (XJBR / MPI) | Sim | Quem pagou a despesa |
| **Fornecedor** | Texto | Não | Nome do fornecedor ou prestador |
| **Referência / descrição** | Textarea | Não | Detalhamento do que foi comprado ou executado |
| **Centro de custo** | Toggle (3 opções) | Sim | Categoria da despesa |
| **Comprovantes / arquivos** | Upload múltiplo | Não | Imagens e PDFs (máx. 8 MB por arquivo) |
| **Casas (rateio)** | Seleção múltipla visual | Sim | Quais casas rateiam esse custo |

#### Rateio automático
- O valor total é **dividido igualmente** entre todas as casas selecionadas
- O preview "Rateio entre N casa(s) · R$ X,XX / casa" é atualizado em tempo real
- Link "todas" seleciona/deseleciona todas as obras de uma vez

#### Upload de arquivos
- Suporta **arrastar e soltar** (drag & drop) ou clique na área
- Formatos aceitos: JPG, PNG, GIF, WEBP, PDF
- Múltiplos arquivos por lançamento
- Limite de **8 MB por arquivo**
- Cada arquivo pode ser removido individualmente antes de salvar
- Os arquivos ficam salvos em **base64** no localStorage

---

### 7. Visualizador de Comprovantes (Modal)

Acessível clicando no badge **📎 X arquivo(s)** na tabela:

- **Imagens:** exibidas diretamente no modal com bordas arredondadas
- **PDFs:** renderizados em iframe de 500px de altura
- **Outros formatos:** mensagem "Prévia não disponível"
- Botão **⤓ Baixar** individual para cada arquivo
- Cabeçalho exibe o nome do fornecedor do lançamento

---

### 8. Gerenciador de Obras (Modal)

Acessível pelo botão "⚙ Obras" no cabeçalho:

- Listar todas as obras/casas cadastradas
- **Renomear** obras diretamente (campo editável inline)
- **Excluir** obras (com confirmação se houver lançamentos vinculados)
- **Adicionar** nova obra com nome personalizado (sem limite de quantidade)
- Cada obra exibe a contagem de lançamentos vinculados
- Ao fechar, todos os totais e relatórios são recalculados automaticamente

**Obras padrão (seed):** Casa 1, Casa 2, Casa 3, Casa 4, Casa 5, Casa 6

---

### 9. Exportação e Importação

#### Exportar para Excel (CSV)
Gera arquivo `custos_classe7.csv` com:
- Linha por lançamento com: Data, Fonte, Centro de Custo, Fornecedor, Referência, Valor Total, Nº Casas, valor por obra
- **Resumo por Obra:** total, Obra, Mão de Obra, Documentação, Sem Categoria
- **Resumo por Centro de Custo:** total de cada categoria
- **Resumo Investidores:** totais XJBR, MPI, geral e saldo do acerto 50/50
- Separador `;` (compatível com Excel BR)
- Encoding UTF-8 com BOM

#### Backup JSON
Exporta arquivo `backup_classe7.json` com o estado completo:
```json
{
  "obras": [{ "id": "c1", "nome": "Casa 1" }, ...],
  "lancamentos": [{ "id": "...", "data": "...", "fonte": "...", "cc": "...", ... }]
}
```

#### Importar JSON
Restaura um backup JSON previamente salvo. **Atenção:** substitui todos os dados atuais.

---

## Modelo de Dados

### Obra (tabela `obras`)
```json
{
  "id": "0e8c…-uuid",
  "nome": "Casa 1"
}
```

### Lançamento (tabela `lancamentos`)
```json
{
  "id": "a1b2…-uuid",
  "numero": 12,
  "data": "2026-05-15",
  "fonte": "XJBR",
  "cc": "OBRA",
  "fornecedor": "Nome do Fornecedor",
  "referencia": "Descrição do item/serviço",
  "valor": 1500.00,
  "casas": ["0e8c…-uuid", "1f9d…-uuid"],
  "arquivos": [
    {
      "name": "nota_fiscal.jpg",
      "type": "image/jpeg",
      "size": 204800,
      "path": "1717612345-ab12c-nota_fiscal.jpg"
    }
  ]
}
```

> Os `id` das obras e lançamentos são **UUID** gerados pelo banco. O campo `casas` é uma lista de IDs de obras. Em `arquivos`, o `path` aponta para o arquivo dentro do bucket `comprovantes` (não é mais base64).

### Valores válidos para `fonte`
| Valor | Descrição |
|---|---|
| `"XJBR"` | Investidor XJBR |
| `"MPI"` | Investidor MPI |

### Valores válidos para `cc` (Centro de Custo)
| Valor | Descrição |
|---|---|
| `"OBRA"` | Materiais de construção |
| `"MAO_DE_OBRA"` | Serviços e mão de obra |
| `"DOCUMENTACAO"` | Documentação, taxas, alvarás |
| `""` ou ausente | Sem categoria (lançamentos legados) |

---

## Persistência e Armazenamento (Supabase)

- **Lançamentos e obras:** tabelas `lancamentos` e `obras` num banco **PostgreSQL** gerenciado pelo Supabase
- **Comprovantes (fotos/PDFs):** enviados para um **bucket de Storage privado** (`comprovantes`); o lançamento guarda apenas o caminho (`path`) do arquivo, e a visualização gera um **link assinado temporário** (válido por 1 hora)
- **Sincronização em tempo real:** quando alguém adiciona/edita/exclui um lançamento, as telas dos outros usuários conectados se atualizam automaticamente (Supabase Realtime)
- **Segurança (RLS):** o banco impõe que **todos os logados leem**, mas **somente o perfil Financeiro escreve** — não é só uma questão visual, é uma regra no servidor
- **Backup:** o botão **⤓ Backup** continua exportando um JSON completo dos dados como cópia de segurança; **⤒ Importar** restaura esse JSON para o banco (substitui tudo — apenas Financeiro)
- **Primeira execução:** se o banco estiver vazio, o Financeiro vê um botão **"Importar dados iniciais"** que cadastra as 6 casas e os lançamentos históricos de exemplo

---

## Dados de Exemplo (Seed)

O sistema vem com **+130 lançamentos de exemplo** pré-carregados, cobrindo obras reais com fornecedores, materiais, medições de equipes e documentações. Esses dados são carregados apenas na **primeira abertura** (quando não há dados no localStorage).

---

## Design e Tecnologia

### Paleta de cores
| Variável | Cor | Uso |
|---|---|---|
| `--paper` | `#F2EDE1` | Fundo principal |
| `--card` | `#FBF8F0` | Cards e painéis |
| `--ink` | `#16202E` | Texto principal, cabeçalho |
| `--ochre` | `#C9802B` | Destaque, MPI, botão primário |
| `--teal` | `#2E6E66` | XJBR, elementos de sucesso |
| `--danger` | `#B23A35` | Alertas e exclusões |

### Tipografia
| Fonte | Uso |
|---|---|
| **Fraunces** (serif) | Títulos, valores numéricos grandes |
| **Archivo** (sans-serif) | Corpo de texto, botões, labels |
| **Archivo Narrow** | Labels uppercase, eyebrows |

### Dependências externas
| Biblioteca | Versão | Uso |
|---|---|---|
| Chart.js | 4.4.1 (cdnjs) | Gráfico donut por fonte pagadora |
| supabase-js | 2.x (jsDelivr) | Conexão com banco, storage e autenticação |
| Google Fonts | — | Fraunces, Archivo, Archivo Narrow |

### Responsividade
- **≤ 1000px:** KPIs em 2 colunas; painéis em coluna única
- **≤ 560px:** KPIs em 1 coluna; formulário em coluna única

---

## Atalhos e Comportamentos

| Ação | Como |
|---|---|
| Fechar qualquer modal | Tecla `Esc` ou clicar fora do modal |
| Selecionar todas as casas | Link "todas" no formulário de lançamento |
| Preview de rateio | Atualizado em tempo real ao digitar o valor ou selecionar casas |
| Visualizar comprovante | Clicar no badge 📎 na tabela |
| Filtros combinados | Todos os filtros funcionam simultaneamente |

---

## Multi-parceiro (vários centros de custo)

O sistema é **multi-ambiente**: atende vários parceiros no mesmo domínio, cada um pelo caminho da URL — `www.xjbr.com.br/mpi`, `www.xjbr.com.br/construtorax`, etc. Cada ambiente tem **dados, relatórios e senhas próprios e isolados** (um não enxerga o outro).

- O parceiro é detectado pelo **primeiro trecho do caminho** da URL (ou por `?t=slug` em teste local).
- Cada parceiro é um registro na tabela `tenant_settings` (Supabase), com **nome**, suas **duas fontes pagadoras** (ex.: `XJBR × MPI`, `XJBR × Construtora X`), logo e senhas — gerenciado pelo Dev no **Painel do Desenvolvedor** (🛠 Admin), sem editar arquivos.
- No **modo online**, um único banco Supabase guarda todos, com isolamento por **RLS** (cada conta só acessa o seu parceiro) e comprovantes separados por pasta no Storage.
- Passo a passo para criar um novo parceiro: veja [`GUIA_DE_INSTALACAO.md`](GUIA_DE_INSTALACAO.md).

---

## Modos de funcionamento

O sistema detecta sozinho como deve funcionar, com base na resposta de `/api/public-config`:

- **Modo LOCAL** (somente se `/api/public-config` estiver inacessível — ex.: pré-visualização offline): funciona no próprio navegador, salvando os dados no `localStorage`, com senhas de demonstração fixas no `index.html`. Não protege nenhum dado real — serve só para testar a interface sem backend.
- **Modo ONLINE** (publicado na Vercel com as variáveis de ambiente do Supabase configuradas — ver [`GUIA_DE_INSTALACAO.md`](GUIA_DE_INSTALACAO.md)): funciona na nuvem, multiusuário, com banco PostgreSQL e storage de arquivos. O login é verificado no servidor (`/api/login`) contra as senhas definidas para cada parceiro em `tenant_settings`.

> Senhas de demonstração do modo offline (sem efeito em produção): Financeiro = `classe7`, Visualizador = `ver123`, Dev = `dev-master`.

---

## Segurança

- Acesso por **senha**, com três perfis:
  - **Financeiro** — acesso completo (cria/edita/exclui) no seu parceiro
  - **Visualizador** — somente leitura; **vê e abre os comprovantes/anexos** (não edita)
  - **Dev** — super-administrador: senha na variável de ambiente `DEV_PASS` (Vercel); abre o **Painel do Desenvolvedor** (🛠 Admin) para criar/editar/remover parceiros e administrar tudo, em qualquer ambiente
- A senha digitada nunca é verificada no navegador: o front-end envia para `/api/login`, que confere o hash no servidor e devolve uma sessão já autenticada do Supabase
- Por baixo, cada perfil é uma **conta real no Supabase Auth**; a separação de permissões é imposta pelo banco via **Row Level Security (RLS)**, não apenas escondendo botões na tela
- A única chave que chega ao navegador é a **chave pública (`anon`)**, via `/api/public-config` — é segura por design (a RLS protege os dados). A chave `service_role`, os hashes de senha e a `DEV_PASS` ficam **só** em variáveis de ambiente da Vercel, lidas pelas funções em `api/`
- Os comprovantes ficam num **bucket privado** e só são acessados por link assinado temporário
- **Importante:** defina senhas fortes e **diferentes** para as contas Financeiro e Visualizador

---

## Limitações Conhecidas

- O sistema depende de conexão com a internet (banco e arquivos ficam no Supabase)
- PDFs podem não renderizar em alguns navegadores mobile via iframe (há sempre o botão **⤓ Baixar**)
- Limite de **8 MB por arquivo** de comprovante (configurável no código)
- A sincronização em tempo real exige que **Realtime** esteja habilitado para as tabelas no Supabase (veja o guia)
