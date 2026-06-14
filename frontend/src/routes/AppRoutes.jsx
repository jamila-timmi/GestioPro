import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Login from '../Pages/Login.jsx';
import AdminEmployees from '../Pages/Admin/Employees.jsx';
import AdminAddEmployee from '../Pages/Admin/AddEmployee.jsx';
import AdminConges from '../Pages/Admin/Conges.jsx';
import AdminAbsences from '../Pages/Admin/Absences.jsx';
import AdminProjets from '../Pages/Admin/Projets.jsx';
import AdminAffectations from '../Pages/Admin/Affectations.jsx';
import EmployeeConges from '../Pages/Employee/Conges.jsx';
import EmployeeAbsences from '../Pages/Employee/Absences.jsx';
import EmployeeProjets from '../Pages/Employee/Projets.jsx';
import { useApp } from '../store/appState';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute=({ children })=>{
  const token=localStorage.getItem('token');
  const app=useApp();
  const { user, loading }=app.auth;

  if (!token) return <Navigate to="/login" replace />;
  if (loading) return null;
  if (user && user.role !== 'admin') return <Navigate to="/employee/conges" replace />;
  return children;
};

const EmployeeRoute=({ children })=>{
  const token=localStorage.getItem('token');
  const app=useApp();
  const { user, loading }=app.auth;

  if (!token) return <Navigate to="/login" replace />;
  if (loading) return null;
  if (user && user.role === 'admin') return <Navigate to="/admin/employees" replace />;
  return children;
};

const RoleRedirect=({ adminTo = '/admin/employees', employeeTo = '/employee/conges' })=>{
  const token=localStorage.getItem('token');
  const app=useApp();
  const { user, loading }=app.auth;

  if (!token) return <Navigate to="/login" replace />;
  if (loading) return null;
  return <Navigate to={user?.role === 'admin' ? adminTo : employeeTo} replace />;
};

const AppRoutes=() => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route path="/" element={<RoleRedirect />} />

    <Route path="/admin/employees" element={<AdminRoute><AdminEmployees /></AdminRoute>} />
    <Route path="/admin/create" element={<AdminRoute><AdminAddEmployee /></AdminRoute>} />
    <Route path="/admin/conges" element={<AdminRoute><AdminConges /></AdminRoute>} />
    <Route path="/admin/absences" element={<AdminRoute><AdminAbsences /></AdminRoute>} />
    <Route path="/admin/projets" element={<AdminRoute><AdminProjets /></AdminRoute>} />
    <Route path="/admin/affectations" element={<AdminRoute><AdminAffectations /></AdminRoute>} />

    <Route path="/employee/conges" element={<EmployeeRoute><EmployeeConges /></EmployeeRoute>} />
    <Route path="/employee/absences" element={<EmployeeRoute><EmployeeAbsences /></EmployeeRoute>} />
    <Route path="/employee/projets" element={<EmployeeRoute><EmployeeProjets /></EmployeeRoute>} />

    <Route path="/employees" element={<Navigate to="/admin/employees" replace />} />
    <Route path="/create" element={<Navigate to="/admin/create" replace />} />
    <Route path="/affectations" element={<Navigate to="/admin/affectations" replace />} />
    <Route path="/conges" element={<PrivateRoute><RoleRedirect adminTo="/admin/conges" employeeTo="/employee/conges" /></PrivateRoute>} />
    <Route path="/absences" element={<PrivateRoute><RoleRedirect adminTo="/admin/absences" employeeTo="/employee/absences" /></PrivateRoute>} />
    <Route path="/projets" element={<PrivateRoute><RoleRedirect adminTo="/admin/projets" employeeTo="/employee/projets" /></PrivateRoute>} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
