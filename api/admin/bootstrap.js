const crypto = require('crypto');
const { getAdminClient } = require('../../lib/supabaseAdmin');
const { createTenantAccounts } = require('../../lib/tenantCrud');

const SLUG_RE = /^[a-z0-9-]+$/;

// POST /api/admin/bootstrap
// Inicializacao unica do sistema: cria os parceiros iniciais + a conta dev.
// Se ja existir qualquer registro em tenant_settings, retorna 403.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo nao permitido' });
    return;
  }

  if (process.env.BOOTSTRAP_TOKEN) {
    if (req.headers['x-bootstrap-token'] !== process.env.BOOTSTRAP_TOKEN) {
      res.status(403).json({ error: 'Token de bootstrap invalido' });
      return;
    }
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  body = body || {};

  const tenants = Array.isArray(body.tenants) ? body.tenants : [];
  if (tenants.length === 0) {
    res.status(400).json({ error: 'Informe ao menos um parceiro em "tenants"' });
    return;
  }

  for (const t of tenants) {
    if (!t || typeof t.slug !== 'string' || !SLUG_RE.test(t.slug) ||
        t.slug === '_dev' || t.slug === '_bootstrap_lock') {
      res.status(400).json({ error: 'Slug invalido: ' + (t && t.slug) });
      return;
    }
    if (!t.passFinanceiro || !t.passViewer) {
      res.status(400).json({ error: 'Parceiro "' + t.slug + '" precisa de passFinanceiro e passViewer' });
      return;
    }
  }

  const sbAdmin = getAdminClient();

  // Trava atomica: se a insercao falhar por violacao de unicidade, o sistema
  // ja foi inicializado antes -> nunca permitir um segundo bootstrap.
  const { error: lockErr } = await sbAdmin.from('tenant_settings').insert({ tenant: '_bootstrap_lock' });
  if (lockErr) {
    if (lockErr.code === '23505') {
      res.status(403).json({ error: 'Sistema ja inicializado' });
      return;
    }
    console.error('bootstrap lock error', lockErr);
    res.status(500).json({ error: 'Erro ao verificar inicializacao', details: lockErr.message });
    return;
  }

  const createdSlugs = [];
  try {
    for (const t of tenants) {
      await createTenantAccounts(sbAdmin, {
        slug: t.slug,
        nome: t.nome || t.slug,
        fontes: Array.isArray(t.fontes) ? t.fontes : [],
        logo: t.logo || null,
        passFinanceiro: t.passFinanceiro,
        passViewer: t.passViewer
      });
      createdSlugs.push(t.slug);
    }

    const internalDev = crypto.randomBytes(32).toString('hex');
    const { data: devUser, error: devErr } = await sbAdmin.auth.admin.createUser({
      email: 'dev@xjbr.local',
      password: internalDev,
      email_confirm: true
    });
    if (devErr) throw devErr;

    const { error: devProfErr } = await sbAdmin.from('profiles').insert({
      id: devUser.user.id, role: 'dev', tenant: 'all'
    });
    if (devProfErr) throw devProfErr;

    const { error: devSettingsErr } = await sbAdmin.from('tenant_settings').insert({
      tenant: '_dev', internal_pass_dev: internalDev
    });
    if (devSettingsErr) throw devSettingsErr;

    res.status(200).json({ ok: true, tenants: createdSlugs, dev: true });
  } catch (e) {
    console.error('bootstrap error', e);
    res.status(500).json({
      error: 'Falha no bootstrap (parcialmente concluido). Verifique o SQL editor do Supabase para inspecionar/corrigir tenant_settings e auth.users.',
      details: e.message || String(e),
      tenantsCreated: createdSlugs
    });
  }
};
