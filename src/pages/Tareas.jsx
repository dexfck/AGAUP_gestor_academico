import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTareas, deleteTarea, createTarea, updateTarea } from '../services/tareas';
import { getMaterias } from '../services/materias';
import { Trash2, Plus, Loader2, X, CheckSquare, Square, CalendarClock, Book, Search, Filter } from 'lucide-react';

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTarea, setNewTarea] = useState({ titulo: '', materia_id: '', fecha_entrega: '', completada: false });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas'); // todas, pendientes, retrasadas, completadas

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTareas();
      setTareas(data.tareas || data || []);
      const matData = await getMaterias();
      setMaterias(matData.materias || matData || []);
    } catch (err) {
      console.error("Error cargando tareas:", err.response?.data || err);
      setErrorMsg('Error al cargar tareas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteTarea(id);
      loadData();
    } catch (err) {
      setErrorMsg("Ocurrió un error al intentar eliminar la tarea.");
    }
  };

  const handleToggle = async (tarea) => {
    const nuevoEstado = !tarea.completada;
    try {
      await updateTarea(tarea.id, { ...tarea, completada: nuevoEstado });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTarea.titulo || !newTarea.materia_id || !newTarea.fecha_entrega) {
       setErrorMsg("Materia, título y fecha de entrega son obligatorios.");
       return;
    }
    try {
      await createTarea(newTarea);
      setIsModalOpen(false);
      setNewTarea({ titulo: '', materia_id: '', fecha_entrega: '', completada: false });
      loadData();
    } catch (err) {
      console.error("Error guardando tarea:", err.response?.data || err);
      setErrorMsg(err.response?.data?.error || "Error al crear la tarea.");
    }
  };

  const getTaskState = (tarea) => {
    if (tarea.completada) return 'completadas';
    if (!tarea.fecha_entrega) return 'pendientes';
    const today = new Date();
    today.setHours(0,0,0,0);
    const [year, month, day] = tarea.fecha_entrega.split('-');
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0,0,0,0);
    if (dueDate.getTime() < today.getTime()) return 'retrasadas';
    return 'pendientes';
  };

  const getStatusColor = (tarea) => {
    if (tarea.completada) return 'border-green-200 bg-green-50 text-green-700';
    if (!tarea.fecha_entrega) return 'border-blue-200';
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const [year, month, day] = tarea.fecha_entrega.split('-');
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0,0,0,0);
    
    if (dueDate.getTime() < today.getTime()) return 'border-red-300 bg-red-50 text-red-700';
    if (dueDate.getTime() === today.getTime()) return 'border-orange-300 bg-orange-50 text-orange-700';
    return 'border-slate-200';
  };

  const getStatusLabel = (tarea) => {
    if (tarea.completada) return 'Completada';
    if (!tarea.fecha_entrega) return 'Pendiente';
    const today = new Date();
    today.setHours(0,0,0,0);
    const [year, month, day] = tarea.fecha_entrega.split('-');
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0,0,0,0);
    
    if (dueDate.getTime() < today.getTime()) return 'Retrasada';
    if (dueDate.getTime() === today.getTime()) return 'Entrega Hoy';
    return 'Pendiente';
  };

  const filteredTareas = tareas.filter(t => {
    const matName = materias.find(m => m.id === t.materia_id)?.nombre || '';
    const matchSearch = t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || matName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchSearch) return false;
    if (filterStatus === 'todas') return true;
    
    const state = getTaskState(t);
    return state === filterStatus;
  });

  // Sort chronological (completadas top)
  filteredTareas.sort((a, b) => {
    if (a.completada !== b.completada) return a.completada ? -1 : 1;
    return new Date(a.fecha_entrega || '9999-12-31') - new Date(b.fecha_entrega || '9999-12-31');
  });

  return (
    <div className="p-8 relative select-none">
      <div className="sticky top-0 z-10 bg-slate-50 pt-8 pb-4 -mt-8 -mx-8 px-8 flex justify-between items-center mb-6 border-b border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800">Tareas</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar Tarea
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Buscar por título o materia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 select-auto"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 appearance-none bg-white min-w-[160px]"
          >
            <option value="todas">Todas</option>
            <option value="pendientes">Pendientes</option>
            <option value="retrasadas">Retrasadas</option>
            <option value="completadas">Completadas</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {errorMsg}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Nueva Tarea</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input 
                  type="text" required placeholder="Ej. Ensayo final"
                  value={newTarea.titulo} onChange={(e) => setNewTarea({...newTarea, titulo: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Materia</label>
                <select 
                  required
                  value={newTarea.materia_id} onChange={(e) => setNewTarea({...newTarea, materia_id: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                >
                  <option value="">Seleccione una materia...</option>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Entrega</label>
                <input 
                  type="date" required
                  value={newTarea.fecha_entrega} onChange={(e) => setNewTarea({...newTarea, fecha_entrega: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-medium hover:bg-blue-800">
                Guardar Tarea
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : filteredTareas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No se encontraron tareas que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTareas.map((tarea, index) => {
            const statusColor = getStatusColor(tarea);
            const statusLabel = getStatusLabel(tarea);
            
            return (
              <motion.div 
                key={tarea.id || index}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                className={`rounded-xl border p-4 flex items-center justify-between transition-colors ${statusColor}`}
              >
                <div className="flex items-start gap-4">
                  <button onClick={() => handleToggle(tarea)} className={`mt-1 hover:text-blue-600 transition-colors ${tarea.completada ? 'text-green-600' : 'text-slate-400'}`}>
                    {tarea.completada ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                  </button>
                  <div>
                    <h3 className={`text-lg font-semibold flex items-center gap-2 ${tarea.completada ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {tarea.titulo}
                      {!tarea.completada && statusLabel !== 'Pendiente' && (
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          statusLabel === 'Retrasada' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                        }`}>
                          {statusLabel}
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1">
                        <Book className="w-3.5 h-3.5" />
                        {materias.find(m => m.id === tarea.materia_id)?.nombre || tarea.materia_id}
                      </div>
                      {tarea.fecha_entrega && (
                        <div className={`flex items-center gap-1 ${!tarea.completada && statusLabel === 'Retrasada' ? 'text-red-500 font-bold' : !tarea.completada && statusLabel === 'Entrega Hoy' ? 'text-orange-500 font-bold' : 'text-slate-400'}`}>
                          <CalendarClock className="w-3.5 h-3.5" />
                          {tarea.fecha_entrega}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(tarea.id)}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-lg transition-colors"
                  title="Eliminar Tarea"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
