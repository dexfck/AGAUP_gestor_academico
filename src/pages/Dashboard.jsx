import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTareas } from '../services/tareas';
import { getCalificaciones } from '../services/calificaciones';
import { getInscripciones } from '../services/inscripciones';
import { Clock, AlertCircle, CheckCircle2, CalendarClock } from 'lucide-react';

export default function Dashboard({ user }) {
  const [tareas, setTareas] = useState([]);
  const [gpaGeneral, setGpaGeneral] = useState('N/A');
  const [gpaUltimo, setGpaUltimo] = useState('N/A');
  const [inscritas, setInscritas] = useState(0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getTaskStatus = (tarea) => {
    if (tarea.completada) return { label: 'Completada', color: 'text-green-600 bg-green-50 border-green-200' };
    
    if (!tarea.fecha_entrega) return { label: 'Pendiente', color: 'text-slate-600 bg-slate-50 border-slate-200' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [year, month, day] = tarea.fecha_entrega.split('-');
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate.getTime() < today.getTime()) {
      return { label: 'Retrasada', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (dueDate.getTime() === today.getTime()) {
      return { label: 'Entrega Hoy', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    }
    
    return { label: 'Pendiente', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  };

  const calcularNotaFinal = (cal) => {
    const p1 = cal.acum_1 || 0;
    const p2 = cal.acum_2 || 0;
    const tp = cal.acum_3 || 0;
    const ex = cal.acum_4 || 0;
    return p1 + p2 + tp + ex;
  };

  const calcularGPA = (calificacionesList) => {
    if (calificacionesList.length === 0) return 0;
    let totalPuntos = 0;
    calificacionesList.forEach(cal => {
      const nota = calcularNotaFinal(cal);
      if (nota >= 90) totalPuntos += 4.0;
      else if (nota >= 80) totalPuntos += 3.0;
      else if (nota >= 70) totalPuntos += 2.0;
      else if (nota >= 60) totalPuntos += 1.0;
    });
    return (totalPuntos / calificacionesList.length).toFixed(2);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tareasData, calData, insData] = await Promise.all([
          getTareas(), getCalificaciones(), getInscripciones()
        ]);
        
        const t = tareasData.tareas || tareasData || [];
        // Sort chronologically (oldest pending/due first)
        t.sort((a, b) => new Date(a.fecha_entrega || '9999-12-31') - new Date(b.fecha_entrega || '9999-12-31'));
        setTareas(t);

        const ins = insData.inscripciones || insData || [];
        setInscritas(ins.length);

        const calificacionesList = calData.calificaciones || calData || [];
        if (calificacionesList.length > 0) {
          setGpaGeneral(calcularGPA(calificacionesList));
          
          // Get highest cuatrimestre
          const maxCuat = Math.max(...calificacionesList.map(c => c.cuatrimestre));
          const ultimos = calificacionesList.filter(c => c.cuatrimestre === maxCuat);
          setGpaUltimo(calcularGPA(ultimos));
        } else {
          setGpaGeneral('N/A');
          setGpaUltimo('N/A');
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
      >
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{getGreeting()}, {user.nombre || 'Estudiante'}</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Carrera: <span className="text-slate-700">{user.carrera || 'No registrada'}</span> | Matrícula: <span className="text-slate-700">{user.matricula}</span></p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-900">GPA General</h3>
            <p className="text-2xl font-bold text-blue-700 mt-1">{gpaGeneral}</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-indigo-900">GPA Último Cuatrimestre</h3>
            <p className="text-2xl font-bold text-indigo-700 mt-1">{gpaUltimo}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-emerald-900">Materias Activas</h3>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{inscritas}</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-slate-500" /> Próximas Tareas
        </h3>
        {tareas.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay tareas pendientes.</p>
        ) : (
          <div className="space-y-3">
            {tareas.slice(0, 5).map((tarea, index) => {
              const status = getTaskStatus(tarea);
              return (
                <div key={tarea.id || index} className={`flex items-center justify-between p-4 rounded-lg border ${status.color}`}>
                  <div>
                    <h4 className="font-semibold text-slate-800">{tarea.titulo}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-1">Vence: {tarea.fecha_entrega || 'Sin fecha'}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/50">{status.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
