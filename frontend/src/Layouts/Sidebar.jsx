import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/gestiopro-logo.png';
import { useApp } from '../store/appState';

const icons = {
  employees: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" />
    </svg>
  ),
  absences: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  conges: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  projets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  ),
  affectations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <line x1="23" y1="11" x2="17" y2="11" /><line x1="20" y1="8" x2="20" y2="14" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
};

const adminNav=[
  {to:'/admin/employees', label:'Employés',icon: icons.employees},
  {to:'/admin/conges',label:'Congés',icon: icons.conges},
  {to:'/admin/absences',label: 'Absences',     icon: icons.absences     },
  {to:'/admin/projets',label: 'Projets',      icon: icons.projets      },
  {to:'/admin/affectations',label: 'Affectations', icon: icons.affectations },
];

const employeeNav=[
  {to:'/employee/conges',label: 'Mes congés',icon: icons.conges},
  {to:'/employee/absences',label: 'Mes absences',icon: icons.absences },
  {to:'/employee/projets',label: 'Mes projets',icon: icons.projets},
];

const Sidebar=()=>{
  const navigate=useNavigate();
  const app=useApp();
  const {fetchNotifications}=app;

  const [notificationsOpen,setNotificationsOpen]=useState(false);

  const user=app.auth.user;
  const {list:notifications,unreadCount }=app.notifications;
  const navItems=user?.role === 'admin'?adminNav : employeeNav;
  const sectionLabel= user?.role === 'admin' ? 'Administration' : 'Mon espace';
  const initiales= user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleLogout=()=>{
    app.logout(); 
    navigate('/login'); 
  };

  useEffect(() => {
    if (!user) return undefined;
    fetchNotifications();
    const timer =setInterval(()=>fetchNotifications(), 30000);
    return ()=>clearInterval(timer);
  }, [fetchNotifications, user]);

  const ouvrirNotification = async (notif) => {
    if (!notif.read_at) await app.markNotificationRead(notif.id);
    setNotificationsOpen(false);
    const chemin = notif.data?.path;
    if (chemin) navigate(chemin);
  };

  return (
    <>
      <div className="gp-sidebar">
        {}
        <div className="px-3 py-3 border-bottom border-0" style={{ borderColor: 'rgba(120,184,255,0.18) !important' }}>
          <img src={logo} alt="GestioPro" style={{ width: 166, maxWidth: '100%', display: 'block', margin: '0 auto', filter: 'drop-shadow(0 10px 22px rgba(0,109,255,0.42))' }} />
        </div>

        {}
        <nav className="flex-grow-1 py-2">
          <div className="px-3 pb-1" style={{ fontSize: 9, color: 'rgba(196,224,255,0.72)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            {sectionLabel}
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `gp-nav-link${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {}
        <div className="px-3 py-2 position-relative" style={{ borderTop: '1px solid rgba(120,184,255,0.18)' }}>
          <div className="d-flex align-items-center gap-2">
            {}
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(145deg,#006dff,#0aa7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
              {initiales}
            </div>

            {}
            <div className="flex-grow-1 overflow-hidden">
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.96)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name ?? 'Utilisateur'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(245,248,252,0.7)' }}>
                {user?.role === 'admin' ? 'Administrateur' : 'Employé'}
              </div>
            </div>

            {}
            <button
              className="btn btn-sm p-1 position-relative"
              onClick={() => setNotificationsOpen((o) => !o)}
              title="Notifications"
              style={{ background: 'none', border: 'none', color: unreadCount > 0 ? '#fff' : 'rgba(255,255,255,0.45)' }}
            >
              {icons.bell}
              {unreadCount > 0 && (
                <span className="badge rounded-pill bg-danger position-absolute" style={{ top: -4, right: -3, fontSize: 9, minWidth: 15, height: 15, lineHeight: '15px', padding: '0 4px' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {}
            <button
              className="btn btn-sm p-1"
              onClick={handleLogout}
              title="Déconnexion"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              {icons.logout}
            </button>
          </div>

          {}
          {notificationsOpen && (
            <div className="dropdown-menu show shadow" style={{ position: 'absolute', left: 12, right: 12, bottom: 58, borderRadius: 10, overflow: 'hidden', zIndex: 200 }}>
              <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button className="btn btn-link btn-sm p-0" onClick={() => app.markAllNotificationsRead()} style={{ fontSize: 11, fontWeight: 600 }}>
                    Tout lire
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 && (
                  <div className="text-center text-muted py-3" style={{ fontSize: 12 }}>Aucune notification</div>
                )}
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    className="dropdown-item border-bottom py-2 px-3 text-start w-100"
                    onClick={() => ouvrirNotification(notif)}
                    style={{ background: notif.read_at ? '#fff' : '#eff6ff', border: 'none', fontFamily: 'inherit' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      {!notif.read_at && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#006dff', flexShrink: 0 }} />}
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.title}</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: 11, lineHeight: 1.35, marginTop: 4 }}>{notif.message}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="gp-sidebar-spacer" aria-hidden="true" />
    </>
  );
};

export default Sidebar;
