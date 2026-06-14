import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useApp } from './store/appState';

function App() {
  const app=useApp();
  const { fetchMe }=app;

  useEffect(()=>{
    const token=localStorage.getItem('token');
    if (token){
      fetchMe();
    }
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
