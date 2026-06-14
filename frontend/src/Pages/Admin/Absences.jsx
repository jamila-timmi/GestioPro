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

const nomDeclarant = (a) => {
  if (a.enregistre_par && a.enregistre_par.name) {
    return a.enregistre_par.name;
  }
  if (a.enregistrePar && a.enregistrePar.name) {
    return a.enregistrePar.name;
  }
  return '---';
};

const urlAvatar = (a) => {
  if (a.employee && a.employee.user && a.employee.user.avatar) {
    return urlBase + '/storage/' + a.employee.user.avatar;
  }
  return '';
};

const urlJustif = (a) => {
  if (a.fichier_justification) {
    return urlBase + '/storage/' + a.fichier_justification;
  }
  return '';
};

const dateInput = (d) => {
  if (!d) return '';
  return String(d).slice(0, 10);
};

const Absences = () => {
  const app = useApp();
  const { user } = app.auth;
  const { list: listeAbsences, loading } = app.absences;
  const { list: listeEmployes } = app.employees;
  const estAdmin = user?.role === 'admin';

  const [form, setForm] = useState({ employee_id: '', date_absence: '', motif: '', justifiee: false, fichier_justification: null });
  const [absenceEdit, setAbsenceEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    app.fetchAbsences();
    if (estAdmin) app.fetchEmployees();
  }, []);

  const gerer = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      setForm({
        ...form,
        [name]: checked,
      });
    } else if (type === 'file') {
      setForm({
        ...form,
        [name]: files[0],
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const gererEdit = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      setAbsenceEdit({
        ...absenceEdit,
        [name]: checked,
      });
    } else if (type === 'file') {
      setAbsenceEdit({
        ...absenceEdit,
        [name]: files[0],
      });
    } else {
      setAbsenceEdit({
        ...absenceEdit,
        [name]: value,
      });
    }
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreur('');
    const motif = form.motif.trim() === '' ? null : form.motif.trim();
    const res = await app.createAbsence({ ...form, motif });
    if (res.ok) {
      setForm({ employee_id: '', date_absence: '', motif: '', justifiee: false, fichier_justification: null });
    } else {
      setErreur(res.payload ?? 'Erreur.');
    }
    setSaving(false);
  };

  const ouvrirModification = (absence) => {
    setAbsenceEdit({
      id: absence.id,
      employee_id: absence.employee_id || (absence.employee ? absence.employee.id : ''),
      date_absence: dateInput(absence.date_absence),
      motif: absence.motif || '',
      justifiee: absence.justifiee || false,
      fichier_justification: null,
    });
    setErreur('');
  };

  const confirmerModification = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreur('');
    const id = absenceEdit.id;
    const data = {
      employee_id: absenceEdit.employee_id,
      date_absence: absenceEdit.date_absence,
      motif: absenceEdit.motif.trim() === '' ? null : absenceEdit.motif.trim(),
      justifiee: absenceEdit.justifiee,
      fichier_justification: absenceEdit.fichier_justification,
    };
    const res = await app.updateAbsence({ id, data });
    if (res.ok) {
      setAbsenceEdit(null);
    } else {
      setErreur(res.payload ?? 'Erreur.');
    }
    setSaving(false);
  };

  const supprimer = (id) => {
    if (window.confirm('Supprimer ?')) app.deleteAbsence(id);
  };

  return (
    <div className="d-flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar />

      {absenceEdit && (
        <div className="gp-modal-overlay" onClick={(e) => e.target === e.currentTarget && setAbsenceEdit(null)}>
          <div className="gp-modal" style={{ maxWidth: 420 }}>
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">Modifier l'absence</h5>
              <button className="btn-close" onClick={() => setAbsenceEdit(null)} />
            </div>
            <form onSubmit={confirmerModification} className="p-4">
              {erreur && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{erreur}</div>}
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date absence *</label>
                  <input
                    name="date_absence"
                    type="date"
                    className="form-control gp-input"
                    value={absenceEdit.date_absence}
                    onChange={gererEdit}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Motif</label>
                  <textarea
                    name="motif"
                    className="form-control gp-input"
                    rows={3}
                    value={absenceEdit.motif}
                    onChange={gererEdit}
                  />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="justifieeEdit"
                      name="justifiee"
                      checked={absenceEdit.justifiee}
                      onChange={gererEdit}
                    />
                    <label className="form-check-label" htmlFor="justifieeEdit" style={{ fontSize: 13 }}>Absence justifiée</label>
                  </div>
                </div>
                {absenceEdit.justifiee && (
                  <div className="col-12">
                    <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Nouveau justificatif</label>
                    <input
                      name="fichier_justification"
                      type="file"
                      accept=".pdf,image/*"
                      className="form-control gp-input"
                      onChange={gererEdit}
                    />
                  </div>
                )}
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => setAbsenceEdit(null)}>Annuler</button>
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
              <h5 className="fw-bold mb-1">Nouvelle absence</h5>
              <p className="text-muted mb-3" style={{ fontSize: 12 }}>Déclarer une absence</p>
              {erreur && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{erreur}</div>}
              <form onSubmit={soumettre} className="d-grid gap-3">
                <select name="employee_id" className="form-select gp-input" value={form.employee_id} onChange={gerer} required>
                  <option value="">Choisir un employé</option>
                  {listeEmployes.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                </select>
                <input name="date_absence" type="date" className="form-control gp-input" value={form.date_absence} onChange={gerer} required />
                <textarea name="motif" className="form-control gp-input" rows={3} placeholder="Motif (optionnel)" value={form.motif} onChange={gerer} />
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="justifiee" name="justifiee" checked={form.justifiee} onChange={gerer} />
                  <label className="form-check-label" htmlFor="justifiee" style={{ fontSize: 13 }}>Absence justifiée</label>
                </div>
                {form.justifiee && <input name="fichier_justification" type="file" accept=".pdf,image/*" className="form-control gp-input" onChange={gerer} />}
                <button type="submit" className="btn btn-primary fw-semibold" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Enregistrement...</> : 'Enregistrer'}
                </button>
              </form>
            </div>
          )}

          <div className="gp-card overflow-hidden">
            <div className="p-4 border-bottom">
              <h5 className="fw-bold mb-0">{estAdmin ? 'Toutes les absences' : 'Mes absences'}</h5>
              <p className="text-muted mb-0" style={{ fontSize: 12 }}>{listeAbsences.length} absence(s)</p>
            </div>
            {!estAdmin && <div className="alert alert-info m-3 mb-0 py-2" style={{ fontSize: 13 }}>Les absences sont déclarées par l'administrateur.</div>}
            <div className="table-responsive">
              <table className="table gp-table mb-0">
                <thead>
                  <tr>
                    {estAdmin && 
                    <th>Employé</th>}
                    <th>Déclarée par</th>
                    <th>Date</th>
                    <th>Motif</th>
                    <th>Statut</th><th>Justificatif</th>
                    {estAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={estAdmin ? 7 : 5} className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Chargement...</td></tr>}
                  {!loading && listeAbsences.length === 0 && <tr><td colSpan={estAdmin ? 7 : 5} className="text-center text-muted py-4">Aucune absence.</td></tr>}
                  {!loading && listeAbsences.map((a) => (
                    <tr key={a.id}>
                      {estAdmin && (
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {urlAvatar(a)
                              ? <img src={urlAvatar(a)} alt="" className="gp-avatar" />
                              : <div className="gp-avatar-placeholder" style={{ fontSize: 11 }}>{initialesEmp(a)}</div>
                            }
                            <span className="fw-semibold" style={{ fontSize: 13 }}>{nomEmploye(a)}</span>
                          </div>
                        </td>
                      )}
                      <td style={{ fontSize: 13 }}>{nomDeclarant(a)}</td>
                      <td className="fw-semibold" style={{ fontSize: 13 }}>{formaterDate(a.date_absence)}</td>
                      <td style={{ fontSize: 13 }}>{a.motif || '---'}</td>
                      <td><span className={`badge rounded-pill ${a.justifiee ? 'badge-approuve' : 'badge-refuse'}`} style={{ fontSize: 11 }}>{a.justifiee ? 'Justifiée' : 'Non justifiée'}</span></td>
                      <td>
                        {urlJustif(a)
                          ? <a href={urlJustif(a)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#006dff' }}>Voir</a>
                          : <span className="text-muted" style={{ fontSize: 12 }}>---</span>
                        }
                      </td>
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

export default Absences;
