import React, { useState, useCallback } from 'react';
import api from '../api';
import { AppContext } from './appState';

export const AppProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, loading: false, error: null });
  const [employees, setEmployees] = useState({ list: [], loading: false });
  const [conges, setConges] = useState({ list: [], loading: false });
  const [absences, setAbsences] = useState({ list: [], loading: false });
  const [projets, setProjets] = useState({ list: [], loading: false });
  const [affectations, setAffectations] = useState({ list: [], loading: false });
  const [notifications, setNotifications] = useState({ list: [], unreadCount: 0 });

  const login = async (identifiants) => {
    setAuth((p) => ({ ...p, loading: true, error: null }));
    try {
      const res = await api.post('/auth/login', identifiants);
      localStorage.setItem('token', res.data.token);
      setAuth({ user: res.data.user, loading: false, error: null });
      return { ok: true, payload: res.data };
    } catch (e) {
      const msg = e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Email ou mot de passe incorrect.';
      setAuth((p) => ({ ...p, loading: false, error: msg }));
      return { ok: false, payload: msg };
    }
  };

  const logout = async () => {
  try {
    await api.post('/auth/logout');  
  } catch {}
  localStorage.removeItem('token'); 
  setAuth({ user: null, loading: false, error: null });
};

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setAuth({ user: res.data, loading: false, error: null });
      return { ok: true, payload: res.data };
    } catch {
      return { ok: false };
    }
  }, []);


  const fetchEmployees = async () => {
    setEmployees((p) => ({ ...p, loading: true }));
    try {
      const res = await api.get('/employees');
      const list = res.data && res.data.data ? res.data.data : res.data;
      setEmployees({ list: Array.isArray(list) ? list : [], loading: false });
    } catch {
      setEmployees((p) => ({ ...p, loading: false }));
    }
  };

  const createEmployee = async (data) => {
    try {
      const fd = new FormData();
      for (const k in data) {
        if (data[k] !== null && data[k] !== undefined && data[k] !== '') {
          fd.append(k, typeof data[k] === 'boolean' ? (data[k] ? '1' : '0') : data[k]);
        }
      }
      const res = await api.post('/employees', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const emp = res.data && res.data.data ? res.data.data : res.data;
      setEmployees((p) => ({ ...p, list: [...p.list, emp] }));
      return { ok: true, payload: emp };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data ? e.response.data : 'Erreur' };
    }
  };

  const updateEmployee = async ({ id, data }) => {
    try {
      const fd = new FormData();
      for (const k in data) {
        if (data[k] !== null && data[k] !== undefined && data[k] !== '') {
          fd.append(k, typeof data[k] === 'boolean' ? (data[k] ? '1' : '0') : data[k]);
        }
      }
      fd.append('_method', 'PUT');
      const res = await api.post(`/employees/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const emp = res.data && res.data.data ? res.data.data : res.data;
      setEmployees((p) => ({ ...p, list: p.list.map((e) => (e.id === emp.id ? emp : e)) }));
      return { ok: true, payload: emp };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      setEmployees((p) => ({ ...p, list: p.list.filter((e) => e.id !== id) }));
      return { ok: true };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const fetchConges = async () => {
    setConges((p) => ({ ...p, loading: true }));
    try {
      const res = await api.get('/conges');
      const list = res.data && res.data.data ? res.data.data : res.data;
      setConges({ list: Array.isArray(list) ? list : [], loading: false });
    } catch {
      setConges((p) => ({ ...p, loading: false }));
    }
  };

  const createConge = async (data) => {
    try {
      const res = await api.post('/conges', data);
      const conge = res.data && res.data.data ? res.data.data : res.data;
      setConges((p) => ({ ...p, list: [...p.list, conge] }));
      return { ok: true, payload: conge };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const updateConge = async ({ id, data }) => {
    try {
      const res = await api.put(`/conges/${id}`, data);
      const conge = res.data && res.data.data ? res.data.data : res.data;
      setConges((p) => ({ ...p, list: p.list.map((c) => (c.id === conge.id ? conge : c)) }));
      return { ok: true, payload: conge };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const validerConge = async ({ id, statut, commentaire }) => {
    try {
      const res = await api.patch(`/conges/${id}/valider`, { statut, commentaire });
      const conge = res.data && res.data.data ? res.data.data : res.data;
      setConges((p) => ({ ...p, list: p.list.map((c) => (c.id === conge.id ? conge : c)) }));
      return { ok: true, payload: conge };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const deleteConge = async (id) => {
    try {
      await api.delete(`/conges/${id}`);
      setConges((p) => ({ ...p, list: p.list.filter((c) => c.id !== id) }));
      return { ok: true };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };


  const fetchAbsences = async () => {
    setAbsences((p) => ({ ...p, loading: true }));
    try {
      const res = await api.get('/absences');
      const list = res.data && res.data.data ? res.data.data : res.data;
      setAbsences({ list: Array.isArray(list) ? list : [], loading: false });
    } catch {
      setAbsences((p) => ({ ...p, loading: false }));
    }
  };

  const createAbsence = async (data) => {
    try {
      const fd = new FormData();
      for (const k in data) {
        if (data[k] !== null && data[k] !== undefined && data[k] !== '') {
          fd.append(k, typeof data[k] === 'boolean' ? (data[k] ? '1' : '0') : data[k]);
        }
      }
      const res = await api.post('/absences', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const absence = res.data && res.data.data ? res.data.data : res.data;
      setAbsences((p) => ({ ...p, list: [...p.list, absence] }));
      return { ok: true, payload: absence };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const updateAbsence = async ({ id, data }) => {
    try {
      const fd = new FormData();
      for (const k in data) {
        if (data[k] !== null && data[k] !== undefined && data[k] !== '') {
          fd.append(k, typeof data[k] === 'boolean' ? (data[k] ? '1' : '0') : data[k]);
        }
      }
      fd.append('_method', 'PUT');
      const res = await api.post(`/absences/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const absence = res.data && res.data.data ? res.data.data : res.data;
      setAbsences((p) => ({ ...p, list: p.list.map((a) => (a.id === absence.id ? absence : a)) }));
      return { ok: true, payload: absence };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const deleteAbsence = async (id) => {
    try {
      await api.delete(`/absences/${id}`);
      setAbsences((p) => ({ ...p, list: p.list.filter((a) => a.id !== id) }));
      return { ok: true };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };


  const fetchProjets = async () => {
    setProjets((p) => ({ ...p, loading: true }));
    try {
      const res = await api.get('/projets');
      const list = res.data && res.data.data ? res.data.data : res.data;
      setProjets({ list: Array.isArray(list) ? list : [], loading: false });
    } catch {
      setProjets((p) => ({ ...p, loading: false }));
    }
  };

  const createProjet = async (data) => {
    try {
      const res = await api.post('/projets', data);
      const projet = res.data && res.data.data ? res.data.data : res.data;
      setProjets((p) => ({ ...p, list: [...p.list, projet] }));
      return { ok: true, payload: projet };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const updateProjet = async ({ id, data }) => {
    try {
      const res = await api.put(`/projets/${id}`, data);
      const projet = res.data && res.data.data ? res.data.data : res.data;
      setProjets((p) => ({ ...p, list: p.list.map((pr) => (pr.id === projet.id ? projet : pr)) }));
      return { ok: true, payload: projet };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const deleteProjet = async (id) => {
    try {
      await api.delete(`/projets/${id}`);
      setProjets((p) => ({ ...p, list: p.list.filter((pr) => pr.id !== id) }));
      return { ok: true };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };


  const fetchAffectations = async () => {
    setAffectations((p) => ({ ...p, loading: true }));
    try {
      const res = await api.get('/affectations');
      const list = res.data && res.data.data ? res.data.data : res.data;
      setAffectations({ list: Array.isArray(list) ? list : [], loading: false });
    } catch {
      setAffectations((p) => ({ ...p, loading: false }));
    }
  };

  const createAffectation = async (data) => {
    try {
      const res = await api.post('/affectations', data);
      const aff = res.data && res.data.data ? res.data.data : res.data;
      setAffectations((p) => ({ ...p, list: [...p.list, aff] }));
      return { ok: true, payload: aff };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const updateAffectation = async ({ id, data }) => {
    try {
      const res = await api.put(`/affectations/${id}`, data);
      const aff = res.data && res.data.data ? res.data.data : res.data;
      setAffectations((p) => ({ ...p, list: p.list.map((a) => (a.id === aff.id ? aff : a)) }));
      return { ok: true, payload: aff };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };

  const deleteAffectation = async (id) => {
    try {
      await api.delete(`/affectations/${id}`);
      setAffectations((p) => ({ ...p, list: p.list.filter((a) => a.id !== id) }));
      return { ok: true };
    } catch (e) {
      return { ok: false, payload: e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Erreur' };
    }
  };


  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const list = res.data && res.data.data ? res.data.data : res.data;
      const unreadCount = res.data && res.data.unread_count ? res.data.unread_count : 0;
      setNotifications({ list: Array.isArray(list) ? list : [], unreadCount: unreadCount });
    } catch {}
  }, []);

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((p) => {
        const list = p.list.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        return { list, unreadCount: list.filter((n) => !n.read_at).length };
      });
    } catch {}
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      const now = new Date().toISOString();
      setNotifications((p) => ({
        list: p.list.map((n) => ({ ...n, read_at: n.read_at ? n.read_at : now })),
        unreadCount: 0,
      }));
    } catch {}
  };

  return (
    <AppContext.Provider value={{
      auth, employees, conges, absences, projets, affectations, notifications,
      login, logout, fetchMe,
      fetchEmployees, createEmployee, updateEmployee, deleteEmployee,
      fetchConges, createConge, updateConge, validerConge, deleteConge,
      fetchAbsences, createAbsence, updateAbsence, deleteAbsence,
      fetchProjets, createProjet, updateProjet, deleteProjet,
      fetchAffectations, createAffectation, updateAffectation, deleteAffectation,
      fetchNotifications, markNotificationRead, markAllNotificationsRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};