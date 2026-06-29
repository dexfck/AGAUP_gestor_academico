import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, BookOpen, Calculator, Home, Book, FileText, CheckSquare, GraduationCap, Calendar, Users, Edit3 } from 'lucide-react';

export default function Layout({ onLogout }) {
  const getNavClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-blue-800 text-white' : 'hover:bg-blue-800/50 text-blue-100'
    }`;

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Lateral */}
      <div className="w-64 bg-blue-900 text-white shadow-xl flex flex-col flex-shrink-0 z-10">
        <div className="p-6 border-b border-blue-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-200" />
          <h1 className="text-xl font-bold tracking-wide">AGAUP</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/" end className={getNavClass}>
            <Home className="w-5 h-5" /> Inicio
          </NavLink>
          <NavLink to="/materias" className={getNavClass}>
            <Book className="w-5 h-5" /> Materias Inscritas
          </NavLink>
          <NavLink to="/tareas" className={getNavClass}>
            <CheckSquare className="w-5 h-5" /> Tareas
          </NavLink>
          <NavLink to="/calificaciones" className={getNavClass}>
            <GraduationCap className="w-5 h-5" /> Calificaciones
          </NavLink>
          <NavLink to="/horario" className={getNavClass}>
            <Calendar className="w-5 h-5" /> Horario Semanal
          </NavLink>
          <NavLink to="/contactos" className={getNavClass}>
            <Users className="w-5 h-5" /> Contactos
          </NavLink>
          <NavLink to="/notas" className={getNavClass}>
            <Edit3 className="w-5 h-5" /> Notas
          </NavLink>
          <NavLink to="/calculadora" className={getNavClass}>
            <Calculator className="w-5 h-5" /> Calculadora
          </NavLink>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-600/90 rounded-lg text-sm font-medium transition-colors text-blue-100"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
