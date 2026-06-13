const { getAdminClient } = require('../lib/supabaseAdmin');
const { requireUser } = require('../lib/requireUser');

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  return body || {};
}

// PUT /api/settings -- Financeiro (ou Dev) logado salva configuracoes do
// PROPRIO parceiro (fontes pagadoras), persistindo em tenant_settings.fontes.
module.exports = async (req, res) => {
  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Metodo nao permitido' });
    return;
  }

  const sbAdmin = getAdminClient();
  const auth = await requireUser(req, sbAdmin);
  if (!auth || (auth.role !== 'financeiro' && auth.role !== 'dev')) {
    res.status(403).json({ error: 'Sem permissao' });
    return;
  }

  const body = parseBody(req);
  const tenant = (auth.role === 'dev' && body.tenant) ? String(body.tenant).toLowerCase() : auth.tenant;
  if (!tenant) {
    res.status(400).json({ error: 'Parceiro nao identificado' });
    return;
  }

  const fontes = Array.isArray(body.fontes)
    ? body.fontes.map(f => String(f).trim()).filter(Boolean)
    : [];
  if (fontes.length === 0) {
    res.status(400).json({ error: 'Informe ao menos uma fonte de pagamento' });
    return;
  }

  const { error } = await sbAdmin.from('tenant_settings').update({ fontes }).eq('tenant', tenant);
  if (error) {
    console.error('settings PUT error', error);
    res.status(500).json({ error: 'Erro ao salvar configuracoes' });
    return;
  }

  res.status(200).json({ ok: true, tenant, fontes });
};
