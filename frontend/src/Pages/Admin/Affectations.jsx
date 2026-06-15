import React, { useEffect, useState } from 'react';
import Sidebar from '../../Layouts/Sidebar';
import { useApp } from '../../store/appState';

const urlBase = 'http://localhost:8000';

const formaterDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');

const nomEmploye = (a) => {
  if (a.employee) {
    return a.employee.nom + ' ' + a.employee.prenom;
  }
  return '---';
};

const initialesEmp = (a) => {
  if (!a.employee) {
    return '?';
  }
  const premiereLettre = a.employee.nom ? a.employee.nom.charAt(0) : '';
  const deuxiemeLettre = a.employee.prenom ? a.employee.prenom.charAt(0) : '';
  return (premiereLettre + deuxiemeLettre).toUpperCase();
};

const urlAvatar = (a) => {
  if (a.employee && a.employee.user && a.employee.user.avatar) {
    return urlBase + '/storage/' + a.employee.user.avatar;
  }
  return '';
};

const dateInput = (d) => {
  if (!d) return '';
  return String(d).slice(0, 10);
};

const Affectations = () => {
  const app = useApp();
  const { user } = app.auth;
  const { list: listeAffectations, loading } = app.affectations;
  const { list: listeEmployes } = app.employees;
  const { list: listeProjets } = app.projets;
  const estAdmin = user?.role === 'admin';

  const [form, setForm] = useState({ employee_id: '', projet_id: '', role_projet: '', date_debut: '', date_fin: '' });
  const [affectationEdit, setAffectationEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    app.fetchAffectations();
    if (estAdmin) {
      app.fetchEmployees();
      app.fetchProjets();
    }
  }, []);

  const gerer = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const gererEdit = (e) => {
    setAffectationEdit({
      ...affectationEdit,
      [e.target.name]: e.target.value,
    });
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreur('');
    const res = await app.createAffectation(form);
    if (res.ok) {
      setForm({ employee_id: '', projet_id: '', role_projet: '', date_debut: '', date_fin: '' });
    } else {
      setErreur(res.payload ?? 'Erreur.');
    }
    setSaving(false);
  };

  const ouvrirModification = (affectation) => {
    setAffectationEdit({
      id: affectation.id,
      employee_id: affectation.employee_id || (affectation.employee ? affectation.employee.id : ''),
      projet_id: affectation.projet_id || (affectation.projet ? affectation.projet.id : ''),
      role_projet: affectation.role_projet || '',
      date_debut: dateInput(affectation.date_debut),
      date_fin: dateInput(affectation.date_fin),
    });
    setErreur('');
  };

  const confirmerModification = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreur('');
    const id = affectationEdit.id;
    const data = {
      employee_id: affectationEdit.employee_id,
      projet_id: affectationEdit.projet_id,
      role_projet: affectationEdit.role_projet,
      date_debut: affectationEdit.date_debut,
      date_fin: affectationEdit.date_fin,
    };
    const res = await app.updateAffectation({ id, data });
    if (res.ok) {
      setAffectationEdit(null);
    } else {
      setErreur(res.payload ?? 'Erreur.');
    }
    setSaving(false);
  };

  const supprimer = (id) => {
    if (window.confirm('Supprimer ?')) app.deleteAffectation(id);
  };

  return (
    <div className="d-flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar />

      {affectationEdit && (
        <div className="gp-modal-overlay" onClick={(e) => e.target === e.currentTarget && setAffectationEdit(null)}>
          <div className="gp-modal" style={{ maxWidth: 440 }}>
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">Modifier l'affectation</h5>
              <button className="btn-close" onClick={() => setAffectationEdit(null)} />
            </div>
            <form onSubmit={confirmerModification} className="p-4">
              {erreur && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{erreur}</div>}
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Employé *</label>
                  <select name="employee_id" className="form-select gp-input" value={affectationEdit.employee_id} onChange={gererEdit} required>
                    <option value="">Choisir un employé</option>
                    {listeEmployes.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Projet *</label>
                  <select name="projet_id" className="form-select gp-input" value={affectationEdit.projet_id} onChange={gererEdit} required>
                    <option value="">Choisir un projet</option>
                    {listeProjets.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Rôle *</label>
                  <input name="role_projet" className="form-control gp-input" placeholder="Rôle dans le projet" value={affectationEdit.role_projet} onChange={gererEdit} required />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date début *</label>
                  <input name="date_debut" type="date" className="form-control gp-input" value={affectationEdit.date_debut} onChange={gererEdit} required />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date fin</label>
                  <input name="date_fin" type="date" className="form-control gp-input" min={affectationEdit.date_debut} value={affectationEdit.date_fin} onChange={gererEdit} />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => setAffectationEdit(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary flex-fill fw-semibold" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />...</> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="gp-page flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <div className="d-grid gap-4 align-items-start" style={{ gridTemplateColumns: estAdmin ? 'minmax(280px,340px) 1fr' : '1fr' }}>

          {estAdmin && (
            <div className="gp-card p-4">
              <h5 className="fw-bold mb-1">Nouvelle affectation</h5>
              <p className="text-muted mb-3" style={{ fontSize: 12 }}>Associer un employé à un projet</p>
              {erreur && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{erreur}</div>}
              <form onSubmit={soumettre} className="d-grid gap-3">
                <select name="employee_id" className="form-select gp-input" value={form.employee_id} onChange={gerer} required>
                  <option value="">Choisir un employé</option>
                  {listeEmployes.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                </select>
                <select name="projet_id" className="form-select gp-input" value={form.projet_id} onChange={gerer} required>
                  <option value="">Choisir un projet</option>
                  {listeProjets.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
                <input name="role_projet" className="form-control gp-input" placeholder="Rôle dans le projet" value={form.role_projet} onChange={gerer} required />
                <input name="date_debut" type="date" className="form-control gp-input" value={form.date_debut} onChange={gerer} required />
                <input name="date_fin" type="date" className="form-control gp-input" value={form.date_fin} onChange={gerer} />
                <button type="submit" className="btn btn-primary fw-semibold" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Enregistrement...</> : 'Affecter'}
                </button>
              </form>
            </div>
          )}

          <div className="gp-card overflow-hidden">
            <div className="p-4 border-bottom">
              <h5 className="fw-bold mb-0">{estAdmin ? 'Toutes les affectations' : 'Mes affectations'}</h5>
              <p className="text-muted mb-0" style={{ fontSize: 12 }}>{listeAffectations.length} affectation(s)</p>
            </div>
            <div className="table-responsive">
              <table className="table gp-table mb-0">
                <thead>
                  <tr>
                    <th>Projet</th>
                    <th>Employé</th>
                    <th>Rôle</th>
                    <th>Période</th>
                    {estAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={estAdmin ? 5 : 4} className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Chargement...</td></tr>}
                  {!loading && listeAffectations.length === 0 && <tr><td colSpan={estAdmin ? 5 : 4} className="text-center text-muted py-4">Aucune affectation.</td></tr>}
                  {!loading && listeAffectations.map((a) => (
                    <tr key={a.id}>
                      <td className="fw-bold" style={{ fontSize: 13 }}>{a.projet ? a.projet.nom : '---'}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {urlAvatar(a)
                            ? <img src={urlAvatar(a)} alt="" className="gp-avatar" />
                            : <div className="gp-avatar-placeholder" style={{ fontSize: 11 }}>{initialesEmp(a)}</div>
                          }
                          <span className="fw-semibold" style={{ fontSize: 13 }}>{nomEmploye(a)}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{a.role_projet || '—'}</td>
                      <td style={{ fontSize: 13 }}>{formaterDate(a.date_debut)} - {formaterDate(a.date_fin)}</td>
                      {estAdmin && (
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-modifier btn-sm rounded-2" onClick={() => ouvrirModification(a)}>Modifier</button>
                            <button className="btn btn-supprimer btn-sm rounded-2" onClick={() => supprimer(a.id)}>Supprimer</button>
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
export default Affectations;