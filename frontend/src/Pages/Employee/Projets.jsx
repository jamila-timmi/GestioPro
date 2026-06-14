import React, { useEffect } from 'react';
import Sidebar from '../../Layouts/Sidebar';
import { useApp } from '../../store/appState';

const formaterDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');

const formaterBudget = (v) => {
  if (!v) return '—';
  return Number(v).toLocaleString('fr-FR') + ' MAD';
};

const STATUTS = { en_cours: 'En cours', termine: 'Terminé', suspendu: 'Suspendu' };

const MesProjets = () => {
  const app = useApp();
  const { list: listeProjets, loading } = app.projets;

  useEffect(() => {
    app.fetchProjets();
  }, []);

  return (
    <div className="d-flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar />
      <div className="gp-page flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <div className="mb-3">
          <h5 className="fw-bold mb-0">Mes projets</h5>
          <p className="text-muted mb-0" style={{ fontSize: 12 }}>{listeProjets.length} projet(s)</p>
        </div>
        <div className="gp-card overflow-hidden">
          <div className="table-responsive">
            <table className="table gp-table mb-0">
              <thead>
                <tr><th>Nom</th><th>Période</th><th>Budget</th><th>Statut</th><th>Équipe</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Chargement...</td></tr>}
                {!loading && listeProjets.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">Aucun projet.</td></tr>}
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
                    <td><span className="badge rounded-pill text-bg-primary" style={{ fontSize: 11 }}>{STATUTS[p.statut] || p.statut}</span></td>
                    <td style={{ fontSize: 13 }}>{p.affectations ? p.affectations.length : 0} membre(s)</td>
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

export default MesProjets;
