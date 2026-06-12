const { getAdminClient } = require('../lib/supabaseAdmin');

// GET /api/public-config
// Endpoint publico (sem auth): devolve a config necessaria para o front-end
// montar o seletor de parceiros e conectar ao Supabase. Nenhum segredo
// (service role, hashes, senhas internas, DEV_PASS) e' retornado aqui --
// somente a anon key, que e' segura por design (a RLS protege os dados).
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo nao permitido' });
    return;
  }

  const sbAdmin = getAdminClient();

  const { data, error } = await sbAdmin
    .from('tenant_settings')
    .select('tenant, nome, fontes, logo')
    .not('tenant', 'in', '("_dev","_bootstrap_lock")');

  if (error) {
    console.error('public-config error', error);
    res.status(500).json({ error: 'Erro ao carregar configuracao' });
    return;
  }

  const tenants = {};
  for (const row of data || []) {
    tenants[row.tenant] = {
      nome: row.nome,
      fontes: row.fontes || [],
      logo: row.logo || null
    };
  }

  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    tenants,
    defaultTenant: process.env.DEFAULT_TENANT || 'mpi'
  });
};
