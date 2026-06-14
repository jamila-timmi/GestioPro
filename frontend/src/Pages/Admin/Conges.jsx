import React, { useEffect, useState } from 'react';
import Sidebar from '../../Layouts/Sidebar';
import { useApp } from '../../store/appState';

const urlBase = 'http://localhost:8000';

const formaterDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

const nbJours = (d1, d2) => {
  if (!d1 || !d2) return 1;
  const diff = new Date(d2) - new Date(d1);
  return diff >= 0 ? Math.ceil(diff / 86400000) + 1 : 1;
};

const nomEmploye = (c) => {
  if (c.employee) {
    return c.employee.nom + ' ' + c.employee.prenom;
  }
  return '---';
};

const initialesEmp = (c) => {
  if (!c.employee) {
    return '?';
  }
  const premiereLettre = c.employee.nom ? c.employee.nom.charAt(0) : '';
  const deuxiemeLettre = c.employee.prenom ? c.employee.prenom.charAt(0) : '';
  return (premiereLettre + deuxiemeLettre).toUpperCase();
};

const urlAvatar = (c) => {
  if (c.employee && c.employee.user && c.employee.user.avatar) {
    return urlBase + '/storage/' + c.employee.user.avatar;
  }
  return '';
};

const dateInput = (d) => {
  if (!d) return '';
  return String(d).slice(0, 10);
};

const TYPES   = { annuel: 'Congé annuel', maladie: 'Maladie', maternite: 'Maternité', sans_solde: 'Sans solde' };
const STATUTS = { en_attente: 'badge-en-attente', approuve: 'badge-approuve', refuse: 'badge-refuse' };
const LABELS  = { en_attente: 'En attente', approuve: 'Approuvé', refuse: 'Refusé' };

const Conges = () => {
  const app = useApp();
  const { user } = app.auth;
  const { list: listeConges, loading } = app.conges;
  const { list: listeEmployes } = app.employees;
  const estAdmin = user?.role === 'admin';

  const [showForm, setShowForm] = useState(false);
  const [congeId, setCongeId] = useState(null);
  const [congeEdit, setCongeEdit] = useState(null);
  const [decision, setDecision] = useState('approuve');
  const [commentaire, setCommentaire] = useState('');
  const [erreur, setErreur] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ type_conge: 'annuel', date_debut: '', date_fin: '', motif: '', employee_id: '' });

  useEffect(() => {
    app.fetchConges();
    if (estAdmin) app.fetchEmployees();
  }, []);

  const soumettre = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreur('');
    const motif = form.motif.trim() === '' ? null : form.motif.trim();
    const payload = { ...form, motif };
    if (!estAdmin) delete payload.employee_id;
    const res = await app.createConge(payload);
    if (res.ok) {
      setShowForm(false);
      setForm({ type_conge: 'annuel', date_debut: '', date_fin: '', motif: '', employee_id: '' });
    } else {
      setErreur(res.payload ?? 'Erreur.');
    }
    setSaving(false);
  };

  const confirmerValidation = async () => {
    setSaving(true);
    setErreur('');
    const res = await app.validerConge({ id: congeId, statut: decision, commentaire });
    if (res.ok) {
      setCongeId(null);
      setCommentaire('');
    } else {
      setErreur(res.payload ?? 'Erreur.');
    }
    setSaving(false);
  };

  const ouvrirModification = (conge) => {
    setCongeEdit({
      id: conge.id,
      employee_id: conge.employee_id || (conge.employee ? conge.employee.id : ''),
      type_conge: conge.type_conge || 'annuel',
      date_debut: dateInput(conge.date_debut),
      date_fin: dateInput(conge.date_fin),
      motif: conge.motif || '',
      statut: conge.statut || 'en_attente',
      commentaire: conge.commentaire || '',
    });
    setErreur('');
  };

  const confirmerModification = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreur('');
    const id = congeEdit.id;
    const data = {
      employee_id: congeEdit.employee_id,
      type_conge: congeEdit.type_conge,
      date_debut: congeEdit.date_debut,
      date_fin: congeEdit.date_fin,
      motif: congeEdit.motif.trim() === '' ? null : congeEdit.motif.trim(),
      statut: congeEdit.statut,
      commentaire: congeEdit.commentaire,
    };
    const res = await app.updateConge({ id, data });
    if (res.ok) {
      setCongeEdit(null);
    } else {
      setErreur(res.payload ?? 'Erreur.');
    }
    setSaving(false);
  };

  return (
    <div className="d-flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar />

      {showForm && (
        <div className="gp-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="gp-modal" style={{ maxWidth: 440 }}>
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">Nouvelle demande</h5>
              <button className="btn-close" onClick={() => setShowForm(false)} />
            </div>
            <form onSubmit={soumettre} className="p-4">
              {erreur && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{erreur}</div>}
              <div className="row g-3">
                {estAdmin && (
                  <div className="col-12">
                    <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Employé *</label>
                    <select className="form-select gp-input" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required>
                      <option value="">-- Choisir --</option>
                      {listeEmployes.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                    </select>
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Type *</label>
                  <select className="form-select gp-input" value={form.type_conge} onChange={(e) => setForm({ ...form, type_conge: e.target.value })}>
                    <option value="annuel">Congé annuel</option>
                    <option value="maladie">Maladie</option>
                    <option value="maternite">Maternité</option>
                    <option value="sans_solde">Sans solde</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date début *</label>
                  <input type="date" className="form-control gp-input" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} required />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date fin *</label>
                  <input type="date" className="form-control gp-input" min={form.date_debut} value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} required />
                </div>
                {form.date_debut && form.date_fin && (
                  <div className="col-12">
                    <div className="alert alert-info py-2 mb-0" style={{ fontSize: 12 }}>
                      Durée : <strong>{nbJours(form.date_debut, form.date_fin)} jour(s)</strong>
                    </div>
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Motif</label>
                  <textarea className="form-control gp-input" rows={3} value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary flex-fill fw-semibold" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Envoi...</> : 'Soumettre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {congeId && (
        <div className="gp-modal-overlay" onClick={(e) => e.target === e.currentTarget && setCongeId(null)}>
          <div className="gp-modal" style={{ maxWidth: 400 }}>
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">Valider la demande</h5>
              <button className="btn-close" onClick={() => setCongeId(null)} />
            </div>
            <div className="p-4">
              <div className="d-flex gap-2 mb-3">
                <button onClick={() => setDecision('approuve')} className={`btn flex-fill fw-semibold ${decision === 'approuve' ? 'btn-success' : 'btn-outline-secondary'}`}>✓ Approuver</button>
                <button onClick={() => setDecision('refuse')} className={`btn flex-fill fw-semibold ${decision === 'refuse' ? 'btn-danger' : 'btn-outline-secondary'}`}>✕ Refuser</button>
              </div>
              <textarea className="form-control gp-input" rows={3} placeholder="Commentaire..." value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
              {erreur && <div className="alert alert-danger py-2 mt-2" style={{ fontSize: 13 }}>{erreur}</div>}
            </div>
            <div className="d-flex gap-2 px-4 pb-4">
              <button className="btn btn-outline-secondary flex-fill" onClick={() => setCongeId(null)}>Annuler</button>
              <button className={`btn flex-fill fw-semibold ${decision === 'approuve' ? 'btn-success' : 'btn-danger'}`} onClick={confirmerValidation} disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />...</> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {congeEdit && (
        <div className="gp-modal-overlay" onClick={(e) => e.target === e.currentTarget && setCongeEdit(null)}>
          <div className="gp-modal" style={{ maxWidth: 420 }}>
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">Modifier la duree</h5>
              <button className="btn-close" onClick={() => setCongeEdit(null)} />
            </div>
            <form onSubmit={confirmerModification} className="p-4">
              {erreur && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{erreur}</div>}
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date debut *</label>
                  <input
                    type="date"
                    className="form-control gp-input"
                    value={congeEdit.date_debut}
                    onChange={(e) => setCongeEdit({ ...congeEdit, date_debut: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date fin *</label>
                  <input
                    type="date"
                    className="form-control gp-input"
                    min={congeEdit.date_debut}
                    value={congeEdit.date_fin}
                    onChange={(e) => setCongeEdit({ ...congeEdit, date_fin: e.target.value })}
                    required
                  />
                </div>
                {congeEdit.date_debut && congeEdit.date_fin && (
                  <div className="col-12">
                    <div className="alert alert-info py-2 mb-0" style={{ fontSize: 12 }}>
                      Duree : <strong>{nbJours(congeEdit.date_debut, congeEdit.date_fin)} jour(s)</strong>
                    </div>
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Statut *</label>
                  <select
                    className="form-select gp-input"
                    value={congeEdit.statut}
                    onChange={(e) => setCongeEdit({ ...congeEdit, statut: e.target.value })}
                    required
                  >
                    <option value="en_attente">En attente</option>
                    <option value="approuve">Approuvé</option>
                    <option value="refuse">Refusé</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Motif</label>
                  <textarea
                    className="form-control gp-input"
                    rows={3}
                    value={congeEdit.motif}
                    onChange={(e) => setCongeEdit({ ...congeEdit, motif: e.target.value })}
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => setCongeEdit(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary flex-fill fw-semibold" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />...</> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="gp-page flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0">Gestion des congés</h5>
            <p className="text-muted mb-0" style={{ fontSize: 12 }}>{listeConges.length} demande(s)</p>
          </div>
        </div>

        <div className="gp-card overflow-hidden">
          <div className="table-responsive">
            <table className="table gp-table mb-0">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Type</th>
                  <th>Période</th>
                  <th>Durée</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Chargement...</td></tr>}
                {!loading && listeConges.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Aucune demande.</td></tr>}
                {!loading && listeConges.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {urlAvatar(c)
                          ? <img src={urlAvatar(c)} alt="" className="gp-avatar" />
                          : <div className="gp-avatar-placeholder" style={{ fontSize: 11 }}>{initialesEmp(c)}</div>
                        }
                        <span className="fw-semibold" style={{ fontSize: 13 }}>{nomEmploye(c)}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{TYPES[c.type_conge] || c.type_conge}</td>
                    <td style={{ fontSize: 13 }}>
                      {formaterDate(c.date_debut)}
                      <div className="text-muted" style={{ fontSize: 11 }}>→ {formaterDate(c.date_fin)}</div>
                    </td>
                    <td><span className="badge rounded-pill text-bg-primary" style={{ fontSize: 11 }}>{nbJours(c.date_debut, c.date_fin)}j</span></td>
                    <td><span className={`badge rounded-pill ${STATUTS[c.statut] || 'text-bg-secondary'}`} style={{ fontSize: 11 }}>{LABELS[c.statut] || c.statut}</span></td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-outline-primary btn-sm rounded-2" onClick={() => ouvrirModification(c)}>Modifier</button>
                        {c.statut === 'en_attente' && (
                          <button className="btn btn-valider btn-sm rounded-2" onClick={() => { setCongeId(c.id); setDecision('approuve'); setCommentaire(''); setErreur(''); }}>Valider</button>
                        )}
                        <button className="btn btn-supprimer btn-sm rounded-2" onClick={() => { if (window.confirm('Supprimer ?')) app.deleteConge(c.id); }}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conges;