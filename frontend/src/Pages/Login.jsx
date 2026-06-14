import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/gestiopro-logo.png';
import { useApp } from '../store/appState';

const Login =()=>{
  const navigate=useNavigate();
  const app=useApp();
  const {loading,error}=app.auth;

  const [email,setEmail]= useState('');
  const [password,setPassword]= useState('');
  const [voirPassword,setVoirPassword] =useState(false);

  const gererConnexion = async (e) => {
    e.preventDefault();
    const resultatLogin = await app.login({ email, password });
    if (resultatLogin.ok) {
      const role = resultatLogin.payload.user?.role;
      navigate(role === 'admin' ? '/admin/employees' : '/employee/projets');
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: 'radial-gradient(circle at 18% 10%, rgba(0,109,255,0.22), transparent 32%), radial-gradient(circle at 86% 12%, rgba(16,185,129,0.14), transparent 28%), linear-gradient(135deg, #eef5ff 0%, #f8fbff 45%, #e7f0fb 100%)',
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div className="w-100 shadow overflow-hidden" style={{ maxWidth: 980, borderRadius: 18, border: '1px solid rgba(15,44,86,0.10)' }}>
        <div className="row g-0" style={{ minHeight: 560 }}>

          {}
          <div
            className="col-lg-5 d-flex flex-column justify-content-between p-4 p-lg-5 text-white"
            style={{
              background: 'radial-gradient(circle at 74% 18%, rgba(10,167,255,0.34), transparent 30%), linear-gradient(160deg, #17335a 0%, #0b1d33 54%, #061020 100%)',
              minHeight: 300,
            }}
          >
            <div>
              <img src={logo} alt="GestioPro" style={{ width: 220, maxWidth: '100%', filter: 'drop-shadow(0 12px 28px rgba(0,109,255,0.42))' }} />
              <h1 className="mt-4 mb-2 fw-bold" style={{ fontSize: 32, lineHeight: 1.1 }}>
                Espace de gestion RH
              </h1>
              <p style={{ color: 'rgba(230,244,255,0.76)', fontSize: 14, lineHeight: 1.7 }}>
                Suivez les employés, les absences, les congés, les projets et les affectations depuis un tableau de bord clair.
              </p>
            </div>

            <div className="row g-2 mt-3">
              {[['RH', 'Employés'], ['Suivi', 'Absences'], ['Projets', 'Équipes']].map(([valeur, label]) => (
                <div key={label} className="col-4">
                  <div className="p-2 p-lg-3 rounded-3" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(120,184,255,0.18)' }}>
                    <div className="fw-bold" style={{ fontSize: 15 }}>{valeur}</div>
                    <div style={{ fontSize: 11, color: 'rgba(230,244,255,0.68)' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-7 bg-white d-flex flex-column justify-content-center p-4 p-lg-5">

            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-center mb-3" style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', color: '#006dff', fontSize: 20, fontWeight: 800 }}>
                G
              </div>
              <h2 className="fw-bold mb-1" style={{ fontSize: 24, color: '#132137' }}>Connexion</h2>
              <p className="text-muted" style={{ fontSize: 13 }}>Entrez vos identifiants pour accéder à GestioPro</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3" style={{ fontSize: 13 }}>
                {error}
              </div>
            )}

            <form onSubmit={gererConnexion}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: 12, color: '#334155' }}>Email</label>
                <input
                  type="email"
                  className="form-control gp-input"
                  placeholder="admin@gestiopro.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: 12, color: '#334155' }}>Mot de passe</label>
                <div className="input-group">
                  <input
                    type={voirPassword ? 'text' : 'password'}
                    className="form-control gp-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ borderRight: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setVoirPassword((v) => !v)}
                    style={{ fontSize: 12, borderLeft: 'none', background: '#f8fbff' }}
                  >
                    {voirPassword ? 'Masquer' : 'Voir'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold"
                disabled={loading}
                style={{ padding: '11px 0', borderRadius: 10, fontSize: 14, boxShadow: '0 14px 30px rgba(0,109,255,0.28)' }}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Connexion...</>
                ) : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
