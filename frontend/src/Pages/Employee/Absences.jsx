import React, { useEffect } from 'react';
import Sidebar from '../../Layouts/Sidebar';
import { useApp } from '../../store/appState';

const urlBase = 'http://localhost:8000';

const formaterDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');

const nomDeclarant = (a) => {
  if (a.enregistre_par && a.enregistre_par.name) {
    return a.enregistre_par.name;
  }
  if (a.enregistrePar && a.enregistrePar.name) {
    return a.enregistrePar.name;
  }
  return '---';
};

const urlJustif = (a) => {
  if (a.fichier_justification) {
    return urlBase + '/storage/' + a.fichier_justification;
  }
  return '';
};

const MesAbsences = () => {
  const app = useApp();
  const { list: mesAbsences, loading } = app.absences;

  useEffect(() => {
    app.fetchAbsences();
  }, []);

  return (
    <div className="d-flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar />
      <div className="gp-page flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <div className="mb-3">
          <h5 className="fw-bold mb-0">Mes absences</h5>
          <p className="text-muted mb-0" style={{ fontSize: 12 }}>{mesAbsences.length} absence(s)</p>
        </div>
        <div className="alert alert-info py-2 mb-3" style={{ fontSize: 13 }}>Les absences sont déclarées par l'administrateur.</div>
        <div className="gp-card overflow-hidden">
          <div className="table-responsive">
            <table className="table gp-table mb-0">
              <thead>
                <tr><th>Déclarée par</th><th>Date</th><th>Motif</th><th>Statut</th><th>Justificatif</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Chargement...</td></tr>}
                {!loading && mesAbsences.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">Aucune absence.</td></tr>}
                {!loading && mesAbsences.map((a) => (
                  <tr key={a.id}>
                    <td className="fw-semibold" style={{ fontSize: 13 }}>{nomDeclarant(a)}</td>
                    <td className="fw-semibold" style={{ fontSize: 13 }}>{formaterDate(a.date_absence)}</td>
                    <td style={{ fontSize: 13 }}>{a.motif || '---'}</td>
                    <td><span className={`badge rounded-pill ${a.justifiee ? 'badge-approuve' : 'badge-refuse'}`} style={{ fontSize: 11 }}>{a.justifiee ? 'Justifiée' : 'Non justifiée'}</span></td>
                    <td>
                      {urlJustif(a)
                        ? <a href={urlJustif(a)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#006dff' }}>Voir</a>
                        : <span className="text-muted" style={{ fontSize: 12 }}>---</span>
                      }
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

export default MesAbsences;
