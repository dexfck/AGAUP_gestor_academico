import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCalificaciones, createCalificacion, updateCalificacion, deleteCalificacion } from '../services/calificaciones';
import { getMaterias } from '../services/materias';
import { getInscripciones } from '../services/inscripciones';
import { Loader2, BookOpen, Edit2, Trash2, Plus, X } from 'lucide-react';

export default function Calificaciones() {
  const [calificaciones, setCalificaciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [activeTab, setActiveTab] = useState('asignar'); // 'asignar' | 'reporte'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    materia_id: '',
    cuatrimestre: 1,
    acum_1: 0,
    acum_2: 0,
    acum_3: 0,
    acum_4: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const calData = await getCalificaciones();
      setCalificaciones(calData.calificaciones || calData || []);
      
      const matData = await getMaterias();
      setMaterias(matData.materias || matData || []);

      const insData = await getInscripciones();
      setInscripciones(insData.inscripciones || insData || []);
    } catch (err) {
      console.error("Error al cargar datos:", err.response?.data || err.message);
      setErrorMsg("Ocurrió un error al cargar las calificaciones.");
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

  const getLetra = (total) => {
    if (total >= 90) return 'A';
    if (total >= 80) return 'B';
    if (total >= 70) return 'C';
    if (total >= 60) return 'D';
    return 'F';
  };

  const openModal = (calificacion = null) => {
    if (calificacion) {
      setEditingId(calificacion.id);
      setFormData({
        materia_id: calificacion.materia_id,
        cuatrimestre: calificacion.cuatrimestre,
        acum_1: calificacion.acum_1 || 0,
        acum_2: calificacion.acum_2 || 0,
        acum_3: calificacion.acum_3 || 0,
        acum_4: calificacion.acum_4 || 0
      });
    } else {
      setEditingId(null);
      setFormData({ materia_id: '', cuatrimestre: 1, acum_1: 0, acum_2: 0, acum_3: 0, acum_4: 0 });
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materia_id) return;
    
    const total = formData.acum_1 + formData.acum_2 + formData.acum_3 + formData.acum_4;
    if (total > 100) {
      setErrorMsg("Error: La suma total de las calificaciones no puede exceder 100 puntos.");
      return;
    }

    try {
      if (editingId) {
        await updateCalificacion(editingId, formData);
      } else {
        await createCalificacion(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Error guardando calificacion:", err.response?.data || err.message);
      const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      setErrorMsg(`Error: ${errMsg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar estas calificaciones?")) return;
    try {
      await deleteCalificacion(id);
      loadData();
    } catch (err) {
      console.error("Error eliminando calificacion:", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-8 relative">
      <div className="sticky top-0 z-10 bg-slate-50 pt-8 pb-4 -mt-8 -mx-8 px-8 flex justify-between items-center mb-6 border-b border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800">Calificaciones</h2>
        {activeTab === 'asignar' && (
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Registrar Calificación
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-200 mb-6">
        <button 
          onClick={() => setActiveTab('asignar')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'asignar' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Asignar Notas
        </button>
        <button 
          onClick={() => setActiveTab('reporte')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'reporte' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Mis Calificaciones
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
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Calificaciones' : 'Registrar Calificaciones'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Materia</label>
                  <select 
                    required disabled={editingId !== null}
                    value={formData.materia_id} onChange={(e) => setFormData({...formData, materia_id: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 disabled:bg-slate-100"
                  >
                    <option value="">Seleccione...</option>
                    {inscripciones.map(ins => (
                      <option key={ins.materia_id} value={ins.materia_id}>{getMateriaNombre(ins.materia_id)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cuatrimestre</label>
                  <input 
                    type="number" min="1" max="15" required
                    value={formData.cuatrimestre} onChange={(e) => setFormData({...formData, cuatrimestre: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Acumulado 1</label>
                  <input type="number" min="0" max="100" required value={formData.acum_1} onChange={(e) => setFormData({...formData, acum_1: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Acumulado 2</label>
                  <input type="number" min="0" max="100" required value={formData.acum_2} onChange={(e) => setFormData({...formData, acum_2: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Acumulado 3</label>
                  <input type="number" min="0" max="100" required value={formData.acum_3} onChange={(e) => setFormData({...formData, acum_3: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Evaluación Final</label>
                  <input type="number" min="0" max="100" required value={formData.acum_4} onChange={(e) => setFormData({...formData, acum_4: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-900">Total Proyectado:</span>
                <span className="text-xl font-bold text-blue-700">
                  {formData.acum_1 + formData.acum_2 + formData.acum_3 + formData.acum_4} / 100
                </span>
              </div>

              <button type="submit" className="w-full bg-blue-700 text-white py-2 mt-4 rounded-lg font-medium hover:bg-blue-800">
                Guardar Calificaciones
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : activeTab === 'asignar' ? (
        calificaciones.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">No hay calificaciones registradas. ¡Empieza por agregar una!</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow-sm border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Materia</th>
                  <th className="px-4 py-4 text-center">Acum. 1</th>
                  <th className="px-4 py-4 text-center">Acum. 2</th>
                  <th className="px-4 py-4 text-center">Acum. 3</th>
                  <th className="px-4 py-4 text-center">Eval. Final</th>
                  <th className="px-6 py-4 text-center">Total</th>
                  <th className="px-6 py-4 text-center">Letra</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {calificaciones.map((cal, index) => {
                  const total = (cal.acum_1 || 0) + (cal.acum_2 || 0) + (cal.acum_3 || 0) + (cal.acum_4 || 0);
                  const letra = getLetra(total);
                  
                  return (
                    <motion.tr 
                      key={cal.id || index} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {getMateriaNombre(cal.materia_id)}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-500">{cal.acum_1}</td>
                      <td className="px-4 py-4 text-center text-slate-500">{cal.acum_2}</td>
                      <td className="px-4 py-4 text-center text-slate-500">{cal.acum_3}</td>
                      <td className="px-4 py-4 text-center text-slate-500">{cal.acum_4}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{total}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          letra === 'A' ? 'bg-green-100 text-green-700' :
                          letra === 'B' ? 'bg-blue-100 text-blue-700' :
                          letra === 'C' ? 'bg-yellow-100 text-yellow-700' :
                          letra === 'D' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {letra}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal(cal)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(cal.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        calificaciones.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">No tienes calificaciones para generar un reporte de cuatrimestre.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(new Set(calificaciones.map(c => c.cuatrimestre))).sort((a,b) => b - a).map(cuatrimestre => {
              const califs = calificaciones.filter(c => c.cuatrimestre === cuatrimestre);
              let sumTotal = 0;
              califs.forEach(c => sumTotal += (c.acum_1||0) + (c.acum_2||0) + (c.acum_3||0) + (c.acum_4||0));
              const promCuat = califs.length > 0 ? (sumTotal / califs.length).toFixed(1) : 0;
              
              return (
                <motion.div key={cuatrimestre} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Cuatrimestre {cuatrimestre}</h3>
                    <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Promedio: {promCuat}</span>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {califs.map((cal, i) => {
                      const total = (cal.acum_1 || 0) + (cal.acum_2 || 0) + (cal.acum_3 || 0) + (cal.acum_4 || 0);
                      const letra = getLetra(total);
                      return (
                        <div key={i} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-800">{getMateriaNombre(cal.materia_id)}</p>
                            <p className="text-xs text-slate-500 mt-1">Nota: {total}/100</p>
                          </div>
                          <span className={`px-3 py-2 rounded-lg font-bold text-xl ${
                            letra === 'A' ? 'bg-green-100 text-green-700' :
                            letra === 'B' ? 'bg-blue-100 text-blue-700' :
                            letra === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            letra === 'D' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>{letra}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
