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

const Affectations = () => {
  const app = useApp();
  const { user } = app.auth;
  const { list: listeAffectations, loading } = app.affectations;
  const { list: listeEmployes } = app.employees;
  const { list: listeProjets } = app.projets;
  const estAdmin = user?.role === 'admin';

  const [form, setForm] = useState({ employee_id: '', projet_id: '', role_projet: '', date_debut: '', date_fin: '' });
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

  const supprimer = (id) => {
    if (window.confirm('Supprimer ?')) app.deleteAffectation(id);
  };

  return (
    <div className="d-flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar />
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
                      {estAdmin && <td><button className="btn btn-supprimer btn-sm rounded-2" onClick={() => supprimer(a.id)}>Supprimer</button></td>}
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
