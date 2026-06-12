const { getAdminClient } = require('../../lib/supabaseAdmin');
const { requireDev } = require('../../lib/requireDev');
const { createTenantAccounts, rotateTenantPasswords } = require('../../lib/tenantCrud');

const SLUG_RE = /^[a-z0-9-]+$/;
const RESERVED = ['_dev', '_bootstrap_lock'];

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  return body || {};
}

// /api/admin/tenants -- somente usuario "dev" (verificado via Bearer token).
// GET: lista parceiros (sem segredos). POST: cria parceiro. PUT: edita
// parceiro / troca senhas. DELETE: remove parceiro.
module.exports = async (req, res) => {
  const sbAdmin = getAdminClient();

  const user = await requireDev(req, sbAdmin);
  if (!user) {
    res.status(401).json({ error: 'Acesso restrito ao usuario dev' });
    return;
  }

  if (req.method === 'GET') {
    const { data, error } = await sbAdmin
      .from('tenant_settings')
      .select('tenant, nome, fontes, logo, pass_financeiro_hash, pass_viewer_hash')
      .not('tenant', 'in', '("_dev","_bootstrap_lock")')
      .order('tenant');

    if (error) {
      console.error('tenants GET error', error);
      res.status(500).json({ error: 'Erro ao listar parceiros' });
      return;
    }

    const list = (data || []).map(row => ({
      tenant: row.tenant,
      nome: row.nome,
      fontes: row.fontes || [],
      logo: row.logo || null,
      hasPasswords: {
        financeiro: !!row.pass_financeiro_hash,
        viewer: !!row.pass_viewer_hash
      }
    }));
    res.status(200).json({ tenants: list });
    return;
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    const slug = typeof body.slug === 'string' ? body.slug.toLowerCase() : '';

    if (!slug || !SLUG_RE.test(slug) || RESERVED.includes(slug)) {
      res.status(400).json({ error: 'Slug invalido' });
      return;
    }
    if (!body.passFinanceiro || !body.passViewer) {
      res.status(400).json({ error: 'Informe passFinanceiro e passViewer' });
      return;
    }

    const { data: existing } = await sbAdmin
      .from('tenant_settings').select('tenant').eq('tenant', slug).maybeSingle();
    if (existing) {
      res.status(409).json({ error: 'Parceiro ja existe' });
      return;
    }

    try {
      await createTenantAccounts(sbAdmin, {
        slug,
        nome: body.nome || slug,
        fontes: Array.isArray(body.fontes) ? body.fontes : [],
        logo: body.logo || null,
        passFinanceiro: body.passFinanceiro,
        passViewer: body.passViewer
      });
      res.status(200).json({ ok: true, tenant: slug });
    } catch (e) {
      console.error('tenants POST error', e);
      res.status(500).json({ error: 'Erro ao criar parceiro', details: e.message || String(e) });
    }
    return;
  }

  if (req.method === 'PUT') {
    const body = parseBody(req);
    const slug = typeof body.slug === 'string' ? body.slug.toLowerCase() : '';

    if (!slug || RESERVED.includes(slug)) {
      res.status(400).json({ error: 'Slug invalido' });
      return;
    }

    const { data: row, error: rowErr } = await sbAdmin
      .from('tenant_settings').select('*').eq('tenant', slug).maybeSingle();
    if (rowErr || !row) {
      res.status(404).json({ error: 'Parceiro nao encontrado' });
      return;
    }

    const updates = {};
    if (body.nome !== undefined) updates.nome = body.nome;
    if (body.fontes !== undefined) updates.fontes = Array.isArray(body.fontes) ? body.fontes : [];
    if (body.logo !== undefined) updates.logo = body.logo;

    try {
      if (body.passFinanceiro || body.passViewer) {
        const pwUpdates = await rotateTenantPasswords(sbAdmin, row, {
          passFinanceiro: body.passFinanceiro,
          passViewer: body.passViewer
        });
        Object.assign(updates, pwUpdates);
      }

      if (Object.keys(updates).length > 0) {
        const { error: updErr } = await sbAdmin
          .from('tenant_settings').update(updates).eq('tenant', slug);
        if (updErr) throw updErr;
      }

      res.status(200).json({ ok: true, tenant: slug });
    } catch (e) {
      console.error('tenants PUT error', e);
      res.status(500).json({ error: 'Erro ao atualizar parceiro', details: e.message || String(e) });
    }
    return;
  }

  if (req.method === 'DELETE') {
    const body = parseBody(req);
    const slug = typeof (body.slug || req.query.slug) === 'string'
      ? (body.slug || req.query.slug).toLowerCase() : '';

    if (!slug || RESERVED.includes(slug)) {
      res.status(400).json({ error: 'Slug invalido' });
      return;
    }

    const { data: row } = await sbAdmin
      .from('tenant_settings').select('financeiro_user_id, viewer_user_id').eq('tenant', slug).maybeSingle();

    if (row) {
      if (row.financeiro_user_id) {
        try { await sbAdmin.auth.admin.deleteUser(row.financeiro_user_id); } catch (e) { console.error('delete financeiro user', e); }
      }
      if (row.viewer_user_id) {
        try { await sbAdmin.auth.admin.deleteUser(row.viewer_user_id); } catch (e) { console.error('delete viewer user', e); }
      }
    }

    const { error: delErr } = await sbAdmin.from('tenant_settings').delete().eq('tenant', slug);
    if (delErr) {
      console.error('tenants DELETE error', delErr);
      res.status(500).json({ error: 'Erro ao remover parceiro' });
      return;
    }

    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Metodo nao permitido' });
};
