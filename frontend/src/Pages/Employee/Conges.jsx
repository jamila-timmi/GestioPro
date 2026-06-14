import React, { useEffect, useState } from 'react';
import Sidebar from '../../Layouts/Sidebar';
import { useApp } from '../../store/appState';

const formaterDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const nbJours = (d1, d2) => {
  if (!d1 || !d2) return 1;
  const diff = new Date(d2) - new Date(d1);
  return diff >= 0 ? Math.ceil(diff / 86400000) + 1 : 1;
};

const TYPES   = { annuel: 'Congé annuel', maladie: 'Maladie', maternite: 'Maternité', sans_solde: 'Sans solde' };
const STATUTS = { en_attente: 'badge-en-attente', approuve: 'badge-approuve', refuse: 'badge-refuse' };
const LABELS  = { en_attente: 'En attente', approuve: 'Approuvé', refuse: 'Refusé' };

const MesConges = () => {
  const app = useApp();
  const { list: mesConges, loading } = app.conges;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type_conge: 'annuel', date_debut: '', date_fin: '', motif: '' });
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    app.fetchConges();
  }, []);

  const soumettre = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreur('');
    const res = await app.createConge({ ...form, motif: form.motif || null });
    if (res.ok) {
      setShowForm(false);
      setForm({ type_conge: 'annuel', date_debut: '', date_fin: '', motif: '' });
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
          <div className="gp-modal" style={{ maxWidth: 420 }}>
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">Nouvelle demande</h5>
              <button className="btn-close" onClick={() => setShowForm(false)} />
            </div>
            <form onSubmit={soumettre} className="p-4">
              {erreur && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{erreur}</div>}
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Type *</label>
                  <select className="form-select gp-input" value={form.type_conge} onChange={(e) => setForm((p) => ({ ...p, type_conge: e.target.value }))}>
                    <option value="annuel">Congé annuel</option>
                    <option value="maladie">Maladie</option>
                    <option value="maternite">Maternité</option>
                    <option value="sans_solde">Sans solde</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date début *</label>
                  <input type="date" className="form-control gp-input" value={form.date_debut} onChange={(e) => setForm((p) => ({ ...p, date_debut: e.target.value }))} required />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date fin *</label>
                  <input type="date" className="form-control gp-input" min={form.date_debut} value={form.date_fin} onChange={(e) => setForm((p) => ({ ...p, date_fin: e.target.value }))} required />
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
                  <textarea className="form-control gp-input" rows={3} value={form.motif} onChange={(e) => setForm((p) => ({ ...p, motif: e.target.value }))} />
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

      <div className="gp-page flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-0">Mes congés</h5>
            <p className="text-muted mb-0" style={{ fontSize: 12 }}>{mesConges.length} demande(s)</p>
          </div>
          <button className="btn btn-primary fw-semibold" onClick={() => setShowForm(true)}>+ Nouvelle demande</button>
        </div>
        <div className="gp-card overflow-hidden">
          <div className="table-responsive">
            <table className="table gp-table mb-0">
              <thead>
                <tr><th>Type</th><th>Période</th><th>Durée</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={4} className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Chargement...</td></tr>}
                {!loading && mesConges.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-4">Aucune demande.</td></tr>}
                {!loading && mesConges.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontSize: 13 }}>{TYPES[c.type_conge] ?? c.type_conge}</td>
                    <td style={{ fontSize: 13 }}>
                      {formaterDate(c.date_debut)}
                      <div className="text-muted" style={{ fontSize: 11 }}>→ {formaterDate(c.date_fin)}</div>
                    </td>
                    <td><span className="badge rounded-pill text-bg-primary" style={{ fontSize: 11 }}>{nbJours(c.date_debut, c.date_fin)}j</span></td>
                    <td><span className={`badge rounded-pill ${STATUTS[c.statut] ?? 'text-bg-secondary'}`} style={{ fontSize: 11 }}>{LABELS[c.statut] ?? c.statut}</span></td>
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

export default MesConges;
