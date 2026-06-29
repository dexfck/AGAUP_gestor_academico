import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import Calculadora from './pages/Calculadora';
import Tareas from './pages/Tareas';
import Calificaciones from './pages/Calificaciones';
import Horario from './pages/Horario';
import Contactos from './pages/Contactos';
import Notas from './pages/Notas';
import Layout from './components/Layout';
import ErrorToast from './components/ErrorToast';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUser(null);
  };

  if (loading) return null;

  return (
    <HashRouter>
      <ErrorToast />
      <AnimatePresence mode="wait">
        {!user ? (
          <Routes>
            <Route path="/register" element={
              <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Register onLogin={(u) => setUser(u)} />
              </motion.div>
            } />
            <Route path="*" element={
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Login onLogin={(u) => setUser(u)} />
              </motion.div>
            } />
          </Routes>
        ) : (
          <Routes>
            <Route element={<Layout onLogout={handleLogout} />}>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/materias" element={<Materias />} />
              <Route path="/calculadora" element={<Calculadora />} />
              <Route path="/tareas" element={<Tareas />} />
              <Route path="/calificaciones" element={<Calificaciones />} />
              <Route path="/horario" element={<Horario />} />
              <Route path="/contactos" element={<Contactos />} />
              <Route path="/notas" element={<Notas />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        )}
      </AnimatePresence>
    </HashRouter>
  );
}

export default App;
