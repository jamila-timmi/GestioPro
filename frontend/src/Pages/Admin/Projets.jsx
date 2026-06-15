import React, { useEffect, useState } from 'react';
import Sidebar from '../../Layouts/Sidebar';
import { useApp } from '../../store/appState';

const formaterDate   = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');
const formaterBudget = (v) => (v ? `${Number(v).toLocaleString('fr-FR')} MAD` : '—');
const STATUTS = { en_cours: 'En cours', termine: 'Terminé', suspendu: 'Suspendu' };

const dateInput = (d) => {
  if (!d) return '';
  return String(d).slice(0, 10);
};

const Projets = () => {
  const app = useApp();
  const { user } = app.auth;
  const { list: listeProjets, loading } = app.projets;
  const estAdmin = user?.role === 'admin';

  const [form, setForm] = useState({ nom: '', description: '', date_debut: '', date_fin: '', statut: 'en_cours', budget: '' });
  const [projetEdit, setProjetEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => { app.fetchProjets(); }, []);

  const gerer = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const gererEdit = (e) => setProjetEdit((p) => ({ ...p, [e.target.name]: e.target.value }));

  const soumettre = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreur('');
    const res = await app.createProjet({ ...form, budget: form.budget || null });
    if (res.ok) {
      setForm({ nom: '', description: '', date_debut: '', date_fin: '', statut: 'en_cours', budget: '' });
    } else {
      setErreur(res.payload ?? 'Erreur.');
    }
    setSaving(false);
  };

  const ouvrirModification = (projet) => {
    setProjetEdit({
      id: projet.id,
      nom: projet.nom || '',
      description: projet.description || '',
      date_debut: dateInput(projet.date_debut),
      date_fin: dateInput(projet.date_fin),
      statut: projet.statut || 'en_cours',
      budget: projet.budget || '',
    });
    setErreur('');
  };

  const confirmerModification = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreur('');
    const id = projetEdit.id;
    const data = {
      nom: projetEdit.nom,
      description: projetEdit.description,
      date_debut: projetEdit.date_debut,
      date_fin: projetEdit.date_fin,
      statut: projetEdit.statut,
      budget: projetEdit.budget || null,
    };
    const res = await app.updateProjet({ id, data });
    if (res.ok) {
      setProjetEdit(null);
    } else {
      setErreur(res.payload ?? 'Erreur.');
    }
    setSaving(false);
  };

  const supprimer = (id) => {
    if (window.confirm('Supprimer ?')) app.deleteProjet(id);
  };

  return (
    <div className="d-flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar />

      {projetEdit && (
        <div className="gp-modal-overlay" onClick={(e) => e.target === e.currentTarget && setProjetEdit(null)}>
          <div className="gp-modal" style={{ maxWidth: 460 }}>
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">Modifier le projet</h5>
              <button className="btn-close" onClick={() => setProjetEdit(null)} />
            </div>
            <form onSubmit={confirmerModification} className="p-4">
              {erreur && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{erreur}</div>}
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Nom *</label>
                  <input name="nom" className="form-control gp-input" value={projetEdit.nom} onChange={gererEdit} required />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Description</label>
                  <textarea name="description" className="form-control gp-input" rows={3} value={projetEdit.description} onChange={gererEdit} />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date début *</label>
                  <input name="date_debut" type="date" className="form-control gp-input" value={projetEdit.date_debut} onChange={gererEdit} required />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date fin *</label>
                  <input name="date_fin" type="date" className="form-control gp-input" min={projetEdit.date_debut} value={projetEdit.date_fin} onChange={gererEdit} required />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Statut</label>
                  <select name="statut" className="form-select gp-input" value={projetEdit.statut} onChange={gererEdit}>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Budget (MAD)</label>
                  <input name="budget" type="number" min="0" className="form-control gp-input" value={projetEdit.budget} onChange={gererEdit} />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => setProjetEdit(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary flex-fill fw-semibold" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />...</> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="gp-page flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <div className="d-grid gap-4 align-items-start" style={{ gridTemplateColumns: estAdmin ? 'minmax(280px,360px) 1fr' : '1fr' }}>

          {estAdmin && (
            <div className="gp-card p-4">
              <h5 className="fw-bold mb-1">Nouveau projet</h5>
              <p className="text-muted mb-3" style={{ fontSize: 12 }}>Créer et suivre un projet</p>
              {erreur && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{erreur}</div>}
              <form onSubmit={soumettre} className="d-grid gap-3">
                <input name="nom" className="form-control gp-input" placeholder="Nom du projet" value={form.nom} onChange={gerer} required />
                <textarea name="description" className="form-control gp-input" rows={3} placeholder="Description" value={form.description} onChange={gerer} />
                <input name="date_debut" type="date" className="form-control gp-input" value={form.date_debut} onChange={gerer} required />
                <input name="date_fin" type="date" className="form-control gp-input" value={form.date_fin} onChange={gerer} required />
                <select name="statut" className="form-select gp-input" value={form.statut} onChange={gerer}>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                  <option value="suspendu">Suspendu</option>
                </select>
                <input name="budget" type="number" min="0" className="form-control gp-input" placeholder="Budget (MAD)" value={form.budget} onChange={gerer} />
                <button type="submit" className="btn btn-primary fw-semibold" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Création...</> : 'Créer'}
                </button>
              </form>
            </div>
          )}

          <div className="gp-card overflow-hidden">
            <div className="p-4 border-bottom">
              <h5 className="fw-bold mb-0">Projets</h5>
              <p className="text-muted mb-0" style={{ fontSize: 12 }}>{listeProjets.length} projet(s)</p>
            </div>
            <div className="table-responsive">
              <table className="table gp-table mb-0">
                <thead>
                  <tr>
                    <th>Nom</th><th>Période</th><th>Budget</th><th>Statut</th><th>Équipe</th>
                    {estAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={estAdmin ? 6 : 5} className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Chargement...</td></tr>}
                  {!loading && listeProjets.length === 0 && <tr><td colSpan={estAdmin ? 6 : 5} className="text-center text-muted py-4">Aucun projet.</td></tr>}
                  {!loading && listeProjets.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="fw-semibold" style={{ fontSize: 13 }}>{p.nom}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{p.description || 'Sans description'}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <div>{formaterDate(p.date_debut)}</div>
                        <div className="text-muted">→ {formaterDate(p.date_fin)}</div>
                      </td>
                      <td className="fw-semibold" style={{ fontSize: 13 }}>{formaterBudget(p.budget)}</td>
                      <td><span className="badge rounded-pill text-bg-primary" style={{ fontSize: 11 }}>{STATUTS[p.statut] ?? p.statut}</span></td>
                      <td style={{ fontSize: 13 }}>{p.affectations?.length ?? 0} membre(s)</td>
                      {estAdmin && (
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-modifier btn-sm rounded-2" onClick={() => ouvrirModification(p)}>Modifier</button>
                            <button className="btn btn-supprimer btn-sm rounded-2" onClick={() => supprimer(p.id)}>Supprimer</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projets;
