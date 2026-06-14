import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Layouts/Sidebar';
import { useApp } from '../../store/appState';

const AddEmployee = () => {
  const navigate = useNavigate();
  const app = useApp();

  const [formulaire, setFormulaire] = useState({
    matricule: '', nom: '', prenom: '', cin: '', date_naissance: '', date_embauche: '',
    email: '', password: '', poste: '', departement: '', telephone: '', adresse: '',
    statut: 'actif', avatar: null,
  });
  const [erreursChamps, setErreursChamps] = useState({});
  const [enregistrement, setEnregistrement] = useState(false);

  const gererChangement = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormulaire({
        ...formulaire,
        [name]: files[0],
      });
    } else {
      setFormulaire({
        ...formulaire,
        [name]: value,
      });
    }

    if (erreursChamps[name]) {
      setErreursChamps({
        ...erreursChamps,
        [name]: null,
      });
    }
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setEnregistrement(true);
    setErreursChamps({});
    const res = await app.createEmployee(formulaire);
    if (res.ok) {
      navigate('/admin/employees');
    } else {
      const erreurs = res.payload && res.payload.errors
        ? res.payload.errors
        : { global: res.payload && res.payload.message ? res.payload.message : 'Erreur.' };
      setErreursChamps(erreurs);
      setEnregistrement(false);
    }
  };

  const afficherErreur = (cle) => {
    if (!erreursChamps[cle]) return null;
    const msg = Array.isArray(erreursChamps[cle]) ? erreursChamps[cle][0] : erreursChamps[cle];
    return <div className="invalid-feedback d-block" style={{ fontSize: 11 }}>{msg}</div>;
  };

  return (
    <div className="d-flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar />
      <div className="gp-page flex-grow-1 p-4">

        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/admin/employees')}>
            Retour
          </button>
          <div>
            <h5 className="mb-0 fw-bold">Ajouter un employe</h5>
            <p className="text-muted mb-0" style={{ fontSize: 12 }}>Creer un nouveau compte employe</p>
          </div>
        </div>

        <form onSubmit={soumettre} style={{ maxWidth: 760 }}>
          {erreursChamps.global && (
            <div className="alert alert-danger py-2 px-3 mb-4" style={{ fontSize: 13 }}>{erreursChamps.global}</div>
          )}

          <div className="gp-card p-4 mb-3">
            <p className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: 11, letterSpacing: '.07em' }}>Informations personnelles</p>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Nom <span className="text-danger">*</span></label>
                <input name="nom" type="text" className={`form-control gp-input${erreursChamps.nom ? ' is-invalid' : ''}`} value={formulaire.nom} onChange={gererChangement} required />
                {afficherErreur('nom')}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Prenom <span className="text-danger">*</span></label>
                <input name="prenom" type="text" className={`form-control gp-input${erreursChamps.prenom ? ' is-invalid' : ''}`} value={formulaire.prenom} onChange={gererChangement} required />
                {afficherErreur('prenom')}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>CIN</label>
                <input name="cin" type="text" className="form-control gp-input" value={formulaire.cin} onChange={gererChangement} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Matricule</label>
                <input name="matricule" type="text" className="form-control gp-input" value={formulaire.matricule} onChange={gererChangement} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date de naissance</label>
                <input name="date_naissance" type="date" className="form-control gp-input" value={formulaire.date_naissance} onChange={gererChangement} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Telephone</label>
                <input name="telephone" type="text" className="form-control gp-input" value={formulaire.telephone} onChange={gererChangement} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Avatar</label>
                <input name="avatar" type="file" accept="image/*" className="form-control gp-input" onChange={gererChangement} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Adresse</label>
                <input name="adresse" type="text" className="form-control gp-input" value={formulaire.adresse} onChange={gererChangement} />
              </div>
            </div>
          </div>

          <div className="gp-card p-4 mb-3">
            <p className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: 11, letterSpacing: '.07em' }}>Informations professionnelles</p>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Poste</label>
                <input name="poste" type="text" className="form-control gp-input" value={formulaire.poste} onChange={gererChangement} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Departement</label>
                <input name="departement" type="text" className="form-control gp-input" value={formulaire.departement} onChange={gererChangement} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Date embauche</label>
                <input name="date_embauche" type="date" className="form-control gp-input" value={formulaire.date_embauche} onChange={gererChangement} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Statut</label>
                <select name="statut" className="form-select gp-input" value={formulaire.statut} onChange={gererChangement}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          <div className="gp-card p-4 mb-4">
            <p className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: 11, letterSpacing: '.07em' }}>Acces et securite</p>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Email <span className="text-danger">*</span></label>
                <input name="email" type="email" className={`form-control gp-input${erreursChamps.email ? ' is-invalid' : ''}`} value={formulaire.email} onChange={gererChangement} required />
                {afficherErreur('email')}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Mot de passe <span className="text-danger">*</span></label>
                <input name="password" type="password" className={`form-control gp-input${erreursChamps.password ? ' is-invalid' : ''}`} placeholder="••••••••" value={formulaire.password} onChange={gererChangement} required />
                {afficherErreur('password')}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/admin/employees')}>Annuler</button>
            <button type="submit" className="btn btn-primary fw-bold px-4" disabled={enregistrement}>
              {enregistrement
                ? <><span className="spinner-border spinner-border-sm me-2" />Creation...</>
                : 'Creer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
