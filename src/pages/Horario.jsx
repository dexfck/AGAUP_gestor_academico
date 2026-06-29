import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHorarios, createHorario, deleteHorario, updateHorario } from '../services/horarios';
import { getMaterias } from '../services/materias';
import { getInscripciones } from '../services/inscripciones';
import { Loader2, Calendar, MapPin, Clock, Trash2, Plus, X, Edit2 } from 'lucide-react';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HORAS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function Horario() {
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    materia_id: '',
    dia: 'Lunes',
    hora_inicio: '08:00',
    hora_fin: '10:00',
    aula: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const horData = await getHorarios();
      setHorarios(horData.horarios || horData || []);
      
      const matData = await getMaterias();
      setMaterias(matData.materias || matData || []);

      const insData = await getInscripciones();
      setInscripciones(insData.inscripciones || insData || []);
    } catch (err) {
      console.error("Error al cargar horarios:", err.response?.data || err.message);
      setErrorMsg("Ocurrió un error al cargar el horario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMateriaNombre = (id) => {
    const mat = materias.find(m => m.id === id);
    return mat ? mat.nombre : id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materia_id) return;
    
    // Validación básica de horas
    const hInicio = parseInt(formData.hora_inicio.split(':')[0]);
    const hFin = parseInt(formData.hora_fin.split(':')[0]);
    if (hFin <= hInicio) {
      setErrorMsg("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    try {
      if (editingId) {
        await updateHorario(editingId, formData);
      } else {
        await createHorario(formData);
      }
      setIsModalOpen(false);
      setFormData({ materia_id: '', dia: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00', aula: '' });
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error("Error guardando horario:", err.response?.data || err.message);
      const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      setErrorMsg(`Error: ${errMsg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este bloque de horario?")) return;
    try {
      await deleteHorario(id);
      loadData();
    } catch (err) {
      console.error("Error eliminando horario:", err.response?.data || err.message);
    }
  };

  const openModal = (clase = null) => {
    if (clase) {
      setEditingId(clase.id);
      setFormData({
        materia_id: clase.materia_id,
        dia: clase.dia,
        hora_inicio: clase.hora_inicio,
        hora_fin: clase.hora_fin,
        aula: clase.aula || ''
      });
    } else {
      setEditingId(null);
      setFormData({ materia_id: '', dia: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00', aula: '' });
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const normalize = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Agrupar horarios por día de forma robusta
  const horariosPorDia = DIAS.reduce((acc, dia) => {
    const nDia = normalize(dia);
    acc[dia] = horarios.filter(h => normalize(h.dia) === nDia).sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));
    return acc;
  }, {});

  const hasClasses = DIAS.some(dia => horariosPorDia[dia].length > 0);

  return (
    <div className="p-8 relative">
      <div className="sticky top-0 z-10 bg-slate-50 pt-8 pb-4 -mt-8 -mx-8 px-8 flex justify-between items-center mb-6 border-b border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800">Horario Semanal</h2>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar Clase
        </button>
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Clase' : 'Registrar Clase'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Materia</label>
                <select 
                  required
                  value={formData.materia_id} onChange={(e) => setFormData({...formData, materia_id: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                >
                  <option value="">Seleccione...</option>
                  {inscripciones.map(ins => (
                    <option key={ins.materia_id} value={ins.materia_id}>{getMateriaNombre(ins.materia_id)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Día de la semana</label>
                <select 
                  required
                  value={formData.dia} onChange={(e) => setFormData({...formData, dia: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                >
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora Inicio</label>
                  <select 
                    required
                    value={formData.hora_inicio} onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  >
                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora Fin</label>
                  <select 
                    required
                    value={formData.hora_fin} onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  >
                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aula / Ubicación (Ej: 202305)</label>
                <input 
                  type="text" required placeholder="Número de aula"
                  value={formData.aula} onChange={(e) => setFormData({...formData, aula: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 uppercase"
                />
              </div>

              <button type="submit" className="w-full bg-blue-700 text-white py-2 mt-4 rounded-lg font-medium hover:bg-blue-800">
                Guardar Horario
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : !hasClasses ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Aún no tienes horarios configurados.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow-sm border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Día</th>
                <th className="px-6 py-4">Horario</th>
                <th className="px-6 py-4">Materia</th>
                <th className="px-6 py-4">Aula</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(() => {
                let delayCounter = 0;
                return DIAS.map(dia => {
                  const clases = horariosPorDia[dia];
                  if (clases.length === 0) return null;
                  
                  return clases.map((clase, idx) => (
                    <motion.tr 
                      key={clase.id || `${dia}-${idx}`} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (delayCounter++) * 0.05 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">{idx === 0 ? dia : ''}</td>
                    <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {clase.hora_inicio} - {clase.hora_fin}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {getMateriaNombre(clase.materia_id)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {clase.aula ? (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          Aula {clase.aula}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No asignada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(clase)}
                          className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="Editar Clase"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(clase.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Eliminar Clase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      </td>
                    </motion.tr>
                  ));
                });
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
