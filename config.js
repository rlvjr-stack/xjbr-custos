/* =====================================================================
   XJBR — Configuração do sistema (multi-parceiro / multi-centro de custo)
   =====================================================================

   COMO FUNCIONA O ENDEREÇO
   Cada parceiro/centro de custo tem seu próprio ambiente, pelo caminho da URL:
     www.xjbr.com.br/mpi          -> parceiro "mpi"
     www.xjbr.com.br/construtorax -> parceiro "construtorax"
   Cada ambiente tem dados, relatórios e senhas PRÓPRIOS e independentes.

   DOIS MODOS (detectados automaticamente):
   • MODO LOCAL  (padrão, enquanto o Supabase abaixo estiver em branco):
     funciona no navegador; cada parceiro guarda seus dados separadamente
     neste computador; o login usa as senhas definidas em cada parceiro.
   • MODO ONLINE (depois de preencher SUPABASE_URL e SUPABASE_ANON_KEY):
     UM único banco Supabase guarda todos os parceiros, com dados ISOLADOS
     por parceiro (cada um só vê o seu). Veja o GUIA_DE_INSTALACAO.md.

   PARA CRIAR UM NOVO PARCEIRO:
   copie um bloco dentro de TENANTS, troque a chave (o nome que vai na URL),
   o "nome", as duas "fontes" pagadoras e as senhas. Depois crie a rota
   www.xjbr.com.br/<chave> (na hospedagem).
   ===================================================================== */
window.C7_CONFIG = {

  /* ===== SENHA DO DEV (super-administrador) =====
     Funciona em QUALQUER ambiente. Dá acesso ao Painel do Desenvolvedor
     (criar/editar/remover parceiros, abrir qualquer ambiente, limpar dados)
     e a todos os poderes de edição. TROQUE por uma senha forte. */
  DEV_PASS: "dev-master",

  /* ===== ONLINE — um banco para TODOS os parceiros (deixe assim p/ modo local) ===== */
  SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
  SUPABASE_ANON_KEY: "SUA-CHAVE-ANON-PUBLICA",

  /* Parceiro aberto quando a URL não indica nenhum (ex.: teste local por arquivo) */
  DEFAULT_TENANT: "mpi",

  /* ===== PARCEIROS / CENTROS DE CUSTO ===== */
  TENANTS: {

    "mpi": {
      nome: "MPI",                    // aparece no cabeçalho
      fontes: ["XJBR", "MPI"],        // as DUAS fontes pagadoras deste ambiente
      PASS_FINANCEIRO: "classe7",     // senha de acesso completo (modo local)
      PASS_VIEWER:     "ver123"       // senha somente leitura (modo local)
    },

    /* Exemplo de outro parceiro (edite as senhas ou remova).
       Acesse em www.xjbr.com.br/construtorax */
    "construtorax": {
      nome: "Construtora X",
      fontes: ["XJBR", "Construtora X"],
      PASS_FINANCEIRO: "trocar-financeiro",
      PASS_VIEWER:     "trocar-leitura"
    }

  }
};
