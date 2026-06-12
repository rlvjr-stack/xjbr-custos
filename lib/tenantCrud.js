const crypto = require('crypto');
const bcrypt = require('bcryptjs');

function emailFor(role, slug) {
  if (role === 'financeiro') return `financeiro@${slug}.xjbr.local`;
  if (role === 'viewer') return `visualizador@${slug}.xjbr.local`;
  throw new Error('invalid role: ' + role);
}

// Cria as 2 contas de Auth (financeiro/viewer), os perfis e a linha em
// tenant_settings para um novo parceiro. Em caso de falha no meio do
// caminho, tenta remover (best-effort) as contas ja criadas.
async function createTenantAccounts(sbAdmin, { slug, nome, fontes, logo, passFinanceiro, passViewer }) {
  const internalFin  = crypto.randomBytes(32).toString('hex');
  const internalView = crypto.randomBytes(32).toString('hex');
  const createdUserIds = [];

  try {
    const { data: finUser, error: finErr } = await sbAdmin.auth.admin.createUser({
      email: emailFor('financeiro', slug),
      password: internalFin,
      email_confirm: true
    });
    if (finErr) throw finErr;
    createdUserIds.push(finUser.user.id);

    const { error: finProfErr } = await sbAdmin.from('profiles').insert({
      id: finUser.user.id, role: 'financeiro', tenant: slug
    });
    if (finProfErr) throw finProfErr;

    const { data: viewUser, error: viewErr } = await sbAdmin.auth.admin.createUser({
      email: emailFor('viewer', slug),
      password: internalView,
      email_confirm: true
    });
    if (viewErr) throw viewErr;
    createdUserIds.push(viewUser.user.id);

    const { error: viewProfErr } = await sbAdmin.from('profiles').insert({
      id: viewUser.user.id, role: 'viewer', tenant: slug
    });
    if (viewProfErr) throw viewProfErr;

    const { error: settingsErr } = await sbAdmin.from('tenant_settings').insert({
      tenant: slug,
      nome,
      fontes,
      logo,
      pass_financeiro_hash: bcrypt.hashSync(passFinanceiro, 10),
      pass_viewer_hash: bcrypt.hashSync(passViewer, 10),
      internal_pass_financeiro: internalFin,
      internal_pass_viewer: internalView,
      financeiro_user_id: finUser.user.id,
      viewer_user_id: viewUser.user.id
    });
    if (settingsErr) throw settingsErr;

    return { financeiroUserId: finUser.user.id, viewerUserId: viewUser.user.id };
  } catch (e) {
    for (const id of createdUserIds) {
      try { await sbAdmin.auth.admin.deleteUser(id); } catch (_) { /* best-effort */ }
    }
    throw e;
  }
}

// Troca a(s) senha(s) de operador de um parceiro existente. Gera novas
// senhas "internas" (Supabase Auth) e devolve os campos que devem ser
// atualizados na linha de tenant_settings (o caller faz o update).
async function rotateTenantPasswords(sbAdmin, row, { passFinanceiro, passViewer }) {
  const updates = {};

  if (passFinanceiro) {
    const newInternal = crypto.randomBytes(32).toString('hex');
    const { error } = await sbAdmin.auth.admin.updateUserById(row.financeiro_user_id, { password: newInternal });
    if (error) throw error;
    updates.pass_financeiro_hash = bcrypt.hashSync(passFinanceiro, 10);
    updates.internal_pass_financeiro = newInternal;
  }

  if (passViewer) {
    const newInternal = crypto.randomBytes(32).toString('hex');
    const { error } = await sbAdmin.auth.admin.updateUserById(row.viewer_user_id, { password: newInternal });
    if (error) throw error;
    updates.pass_viewer_hash = bcrypt.hashSync(passViewer, 10);
    updates.internal_pass_viewer = newInternal;
  }

  return updates;
}

module.exports = { emailFor, createTenantAccounts, rotateTenantPasswords };
