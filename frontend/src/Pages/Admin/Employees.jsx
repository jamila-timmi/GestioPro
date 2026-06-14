import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Layouts/Sidebar';
import { useApp } from '../../store/appState';

const urlBase = 'http://localhost:8000';

const formaterDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '---');

const emailEmploye = (emp) => {
  if (emp.user && emp.user.email) {
    return emp.user.email;
  }
  if (emp.email) {
    return emp.email;
  }
  return '';
};

const urlAvatar = (emp) => {
  if (emp.user && emp.user.avatar) {
    return urlBase + '/storage/' + emp.user.avatar;
  }
  if (emp.avatar) {
    return urlBase + '/storage/' + emp.avatar;
  }
  return '';
};

const initialesEmploye = (emp) => {
  if (!emp.nom && !emp.prenom) {
    return '?';
  }
  const premiereLettre = emp.nom ? emp.nom.charAt(0) : '';
  const deuxiemeLettre = emp.prenom ? emp.prenom.charAt(0) : '';
  return (premiereLettre + deuxiemeLettre).toUpperCase();
};

const Avatar = ({ employe, size = 30 }) => {
  if (urlAvatar(employe)) {
    return <img src={urlAvatar(employe)} alt="" className="gp-avatar" style={{ width: size, height: size }} />;
  }
  return (
    <div className="gp-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.37 }}>
      {initialesEmploye(employe)}
    </div>
  );
};

const ModalModifierEmploye = ({ employe, onClose }) => {
  const app = useApp();

  const [donnees, setDonnees] = useState({
    nom: employe.nom || '',
    prenom: employe.prenom || '',
    email: emailEmploye(employe),
    poste: employe.poste || '',
    departement: employe.departement || '',
    telephone: employe.telephone || '',
    statut: employe.statut || 'actif',
  });
  const [fichierAvatar, setFichierAvatar] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');

  const maj = (cle, val) => {
    setDonnees({
      ...donnees,
      [cle]: val,
    });
  };

  const gererAvatar = (e) => {
    const f = e.target.files[0];
    setFichierAvatar(f);
  };

  const enregistrer = async () => {
    if (!donnees.nom || !donnees.prenom) {
      setErreur('Nom et prenom obligatoires.');
      return;
    }
    setEnregistrement(true);
    setErreur('');
    const dataEnvoi = fichierAvatar ? { ...donnees, avatar: fichierAvatar } : donnees;
    const res = await app.updateEmployee({ id: employe.id, data: dataEnvoi });
    if (res.ok) {
      onClose();
    } else {
      setErreur(res.payload || 'Erreur.');
      setEnregistrement(false);
    }
  };

  return (
    <div className="gp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gp-modal" style={{ maxWidth: 580 }}>
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
          <h5 className="mb-0 fw-bold">Modifier employe</h5>
          <button className="btn-close" onClick={onClose} />
        </div>
        <div className="p-4">
          {erreur && <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: 13 }}>{erreur}</div>}

          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Photo</label>
            <input type="file" accept="image/*" className="form-control gp-input" onChange={gererAvatar} />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Nom *</label>
              <input className="form-control gp-input" value={donnees.nom} onChange={(e) => maj('nom', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Prenom *</label>
              <input className="form-control gp-input" value={donnees.prenom} onChange={(e) => maj('prenom', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Email</label>
              <input type="email" className="form-control gp-input" value={donnees.email} onChange={(e) => maj('email', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Poste</label>
              <input className="form-control gp-input" value={donnees.poste} onChange={(e) => maj('poste', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Departement</label>
              <input className="form-control gp-input" value={donnees.departement} onChange={(e) => maj('departement', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Telephone</label>
              <input className="form-control gp-input" value={donnees.telephone} onChange={(e) => maj('telephone', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: 12 }}>Statut</label>
              <select className="form-select gp-input" value={donnees.statut} onChange={(e) => maj('statut', e.target.value)}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>
        </div>
        <div className="d-flex gap-2 px-4 pb-4">
          <button className="btn btn-outline-secondary flex-fill" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary flex-fill fw-semibold" onClick={enregistrer} disabled={enregistrement}>
            {enregistrement ? <><span className="spinner-border spinner-border-sm me-2" />Enregistrement...</> : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Employees = () => {
  const navigate = useNavigate();
  const app = useApp();
  const { user } = app.auth;
  const { list: listeEmployes, loading } = app.employees;
  const { list: listeAffectations } = app.affectations;

  const [recherche, setRecherche] = useState('');
  const [employeSelectionne, setEmployeSelectionne] = useState(null);
  const [employeEnEdition, setEmployeEnEdition] = useState(null);

  useEffect(() => {
    app.fetchEmployees();
    app.fetchAffectations();
  }, []);

  const supprimerEmploye = (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    app.deleteEmployee(id);
  };

  const employesFiltres = listeEmployes.filter((emp) => {
    const q = recherche.toLowerCase();
    const nomComplet = emp.nom + ' ' + emp.prenom;
    return (
      nomComplet.toLowerCase().includes(q) ||
      (emp.poste || '').toLowerCase().includes(q) ||
      emailEmploye(emp).toLowerCase().includes(q)
    );
  });

  return (
    <div className="d-flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar />

      {employeSelectionne && (
        <div className="gp-modal-overlay" onClick={(e) => e.target === e.currentTarget && setEmployeSelectionne(null)}>
          <div className="gp-modal" style={{ maxWidth: 480 }}>
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">Detail employe</h5>
              <button className="btn-close" onClick={() => setEmployeSelectionne(null)} />
            </div>
            <div className="p-4">
              <div className="text-center mb-3">
                <Avatar employe={employeSelectionne} size={72} />
                <div className="fw-bold mt-2">{employeSelectionne.nom} {employeSelectionne.prenom}</div>
                <div className="text-muted small">{emailEmploye(employeSelectionne)}</div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="p-2 rounded-2" style={{ background: '#f8fafc' }}>
                    <div className="text-muted" style={{ fontSize: 11 }}>Poste</div>
                    <div className="fw-semibold" style={{ fontSize: 13 }}>{employeSelectionne.poste || '---'}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-2" style={{ background: '#f8fafc' }}>
                    <div className="text-muted" style={{ fontSize: 11 }}>Departement</div>
                    <div className="fw-semibold" style={{ fontSize: 13 }}>{employeSelectionne.departement || '---'}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-2" style={{ background: '#f8fafc' }}>
                    <div className="text-muted" style={{ fontSize: 11 }}>Telephone</div>
                    <div className="fw-semibold" style={{ fontSize: 13 }}>{employeSelectionne.telephone || '---'}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-2" style={{ background: '#f8fafc' }}>
                    <div className="text-muted" style={{ fontSize: 11 }}>Statut</div>
                    <div className="fw-semibold" style={{ fontSize: 13 }}>{employeSelectionne.statut || '---'}</div>
                  </div>
                </div>
              </div>
              <div className="fw-bold mb-2" style={{ fontSize: 13 }}>Projets</div>
              {listeAffectations.filter((a) => Number(a.employee_id) === Number(employeSelectionne.id)).length === 0 ? (
                <p className="text-muted small">Aucun projet affecte.</p>
              ) : (
                listeAffectations
                  .filter((a) => Number(a.employee_id) === Number(employeSelectionne.id))
                  .map((aff) => (
                    <div key={aff.id} className="d-flex justify-content-between p-2 mb-1 rounded-2" style={{ background: '#f8fafc' }}>
                      <span className="fw-semibold" style={{ fontSize: 13 }}>{aff.projet ? aff.projet.nom : 'Projet'}</span>
                      <span style={{ fontSize: 12, color: '#006dff' }}>{aff.role_projet || 'Role'}</span>
                    </div>
                  ))
              )}
            </div>
            <div className="px-4 pb-4">
              <button className="btn btn-outline-secondary w-100" onClick={() => setEmployeSelectionne(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {employeEnEdition && (
        <ModalModifierEmploye employe={employeEnEdition} onClose={() => setEmployeEnEdition(null)} />
      )}

      <div className="gp-page flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <div className="d-flex align-items-center justify-content-between mb-3 gap-2 flex-wrap">
          <div>
            <h5 className="fw-bold mb-0">Employes</h5>
            <p className="text-muted mb-0" style={{ fontSize: 12 }}>{listeEmployes.length} enregistres</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="input-group" style={{ width: 220 }}>
              <span className="input-group-text bg-white border-end-0" style={{ fontSize: 13 }}>🔍</span>
              <input className="form-control gp-input border-start-0 ps-0" placeholder="Rechercher..."
                value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </div>
            {user?.role === 'admin' && (
              <button className="btn btn-primary fw-semibold" style={{ fontSize: 13 }} onClick={() => navigate('/admin/create')}>
                + Ajouter
              </button>
            )}
          </div>
        </div>

        <div className="gp-card overflow-hidden">
          <div className="table-responsive">
            <table className="table gp-table mb-0">
              <thead>
                <tr>
                  <th>Employe</th>
                  <th>Poste</th>
                  <th>Departement</th>
                  <th>Telephone</th>
                  <th>Statut</th>
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={user?.role === 'admin' ? 6 : 5} className="text-center py-4">
                      <span className="spinner-border spinner-border-sm me-2" />Chargement...
                    </td>
                  </tr>
                )}
                {!loading && employesFiltres.length === 0 && (
                  <tr>
                    <td colSpan={user?.role === 'admin' ? 6 : 5} className="text-center text-muted py-4">Aucun employe.</td>
                  </tr>
                )}
                {!loading && employesFiltres.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar employe={emp} />
                        <div>
                          <div className="fw-semibold" style={{ fontSize: 13 }}>{emp.nom} {emp.prenom}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>{emailEmploye(emp)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{emp.poste || '---'}</td>
                    <td style={{ fontSize: 13 }}>{emp.departement || '---'}</td>
                    <td style={{ fontSize: 13 }}>{emp.telephone || '---'}</td>
                    <td>
                      <span className={`badge rounded-pill ${emp.statut === 'actif' ? 'text-bg-primary' : 'badge-refuse'}`} style={{ fontSize: 11 }}>
                        {emp.statut === 'actif' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-voir btn-sm rounded-2" onClick={() => setEmployeSelectionne(emp)}>Voir</button>
                          <button className="btn btn-modifier btn-sm rounded-2" onClick={() => setEmployeEnEdition(emp)}>Modifier</button>
                          <button className="btn btn-supprimer btn-sm rounded-2" onClick={() => supprimerEmploye(emp.id)}>Supprimer</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-top text-muted" style={{ fontSize: 11 }}>
            {employesFiltres.length} / {listeEmployes.length} employe(s)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
